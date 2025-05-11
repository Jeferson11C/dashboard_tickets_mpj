<script>
import TicketListComponent from '../components/TicketListComponent.vue';
import TicketDetailsComponent from '../components/TicketDetailsComponent.vue';
import TicketApiService from '../services/ticket-api.service';
import CommentApiService from '../services/comment-api.service';
import WebSocketService from '../../shared/WebSocket.Service';

export default {
  name: "home",
  components: {
    TicketListComponent,
    TicketDetailsComponent
  },
  data() {
    return {
      statuses: [
        {title: "En espera", count: 0},
        {title: "Abierto", count: 0},
        {title: "Resuelto", count: 0},
        {title: "Cancelado", count: 0}
      ],
      tickets: [],
      areas: [],
      selectedTicket: null,
      lastSelectedTicket: null, // Store last selected "En espera" ticket
      selectedArea: localStorage.getItem('userRole') === 'Administrador' ? '' : localStorage.getItem('userArea'),
      userRole: localStorage.getItem('userRole') || '',
      selectedStatus: 'En espera',
      showModal: false,
      newAreaName: '',
      webSocketService: null,
      ticketToTransfer: null,
      selectedDate: new Date().toISOString().split('T')[0],
    };
  },
  created() {
    if (this.userRole === 'user') {
      this.selectedArea = localStorage.getItem('userArea');
    }
    this.fetchTickets(this.selectedArea);
    this.fetchAreas();
    this.setupWebSocketConnection();
  },
  beforeDestroy() {
    if (this.webSocketService) {
      this.webSocketService.close();
    }
  },
  methods: {
    async fetchTickets(areaNombre = '') {
      try {
        let response;
        if (areaNombre) {
          response = await TicketApiService.getByArea(areaNombre);
        } else {
          response = await TicketApiService.getAll();
        }
        this.tickets = response.data;
        this.updateStatusCounts();
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    },
    async fetchAreas() {
      try {
        const response = await TicketApiService.getAreas();
        this.areas = response.data.filter(area => area.nombre.toLowerCase() !== 'general');
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    },
    setupWebSocketConnection() {
      this.webSocketService = new WebSocketService();
      this.webSocketService.connect();

      this.webSocketService.onMessage((message) => {
        const parsedMessage = JSON.parse(message.data);
        if (parsedMessage.action === 'ticketCreated') {
          this.tickets.push(parsedMessage.ticket);
          this.updateStatusCounts();
        } else if (parsedMessage.entityName === 'Ticket' && parsedMessage.action === 'Updated') {
          this.fetchTickets(this.selectedArea);
        }
      });
    },
    async selectTicket(ticket) {
      this.selectedTicket = ticket;
      if (ticket.estado === 'En espera') {
        await this.updateTicketStatus(ticket, 'Abierto');
        this.selectedTicket.estado = 'Abierto';
      }

      const message = JSON.stringify({
        entityName: "Ticket",
        action: "Updated",
        entity: this.selectedTicket
      });
      this.webSocketService.sendMessage(message);
    },
    handleTicketTransferred(transferredTicket) {
      this.ticketToTransfer = transferredTicket;
      if (this.$refs.ticketDetailsComponent) {
        this.$refs.ticketDetailsComponent.showTransferSuccessModal = true;
      } else {
        console.error('TicketDetailsComponent reference is not available.');
      }
    },
    confirmTransfer() {
      if (this.ticketToTransfer) {
        // Remove the transferred ticket from the list of tickets
        this.tickets = this.tickets.filter(ticket => ticket.id !== this.ticketToTransfer.id);
        // Clear the selected ticket if it was the transferred one
        if (this.selectedTicket && this.selectedTicket.id === this.ticketToTransfer.id) {
          this.selectedTicket = null;
        }
        this.ticketToTransfer = null;
      }
    },

    async updateTicketStatus(ticket, status, observation = '') {
      try {
        ticket.estado = status;
        ticket.observacion = observation;
        this.updateStatusCounts();
        await TicketApiService.updateStatus(ticket.id, status);

        // Send message via WebSocket
        const message = JSON.stringify({
          entityName: "Ticket",
          action: "Updated",
          entity: ticket
        });
        this.webSocketService.sendMessage(message);
      } catch (error) {
        console.error('Error updating ticket status:', error);
      }
    },
    async resolveTicket() {
      if (this.selectedTicket) {
        this.showObservationModal('resolve');
      }
    },
    async cancelTicket() {
      if (this.selectedTicket) {
        this.showObservationModal('cancel');
      }
    },
    async reopenTicket() {
      if (this.selectedTicket) {
        await this.updateTicketStatus(this.selectedTicket, 'En espera');
        this.selectedTicket = null;
      }
    },
    filterTicketsByStatus(status) {
      if (this.selectedStatus === 'En espera' && this.selectedTicket && this.selectedTicket.estado === 'Abierto') {
        this.lastSelectedTicket = this.selectedTicket; // Save the current selected "En espera" ticket if it's "Abierto"
      }
      this.selectedStatus = status;
      if (status === 'En espera' && this.lastSelectedTicket && this.lastSelectedTicket.estado === 'Abierto') {
        this.selectedTicket = this.lastSelectedTicket; // Restore the selected "En espera" ticket if it's "Abierto"
      } else {
        this.selectedTicket = null; // Close the details view for other statuses
      }
    },
    handleAreaChange() {
      this.selectedTicket = null;
      this.fetchTickets(this.selectedArea);
    },
    async filterTicketsByDate() {
      const selectedDate = this.selectedDate; // Keep the format 'yyyy-MM-dd'
      try {
        const response = await TicketApiService.getAll();
        this.tickets = response.data.filter(ticket => {
          const ticketDate = ticket.fecha ? this.parseAndFormatDate(ticket.fecha) : null;
          return ticketDate === selectedDate; // Only include tickets created on the selected date
        });
        if (this.tickets.length > 0) {
          console.log(`Tickets fetched for the selected date: ${selectedDate}`);
        } else {
          console.log(`No tickets found for the selected date: ${selectedDate}`);
        }
        this.updateStatusCounts();
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    },
    updateStatusCounts() {
      const selectedDate = this.formatDate(this.selectedDate); // Ensure 'yyyy-MM-dd' format
      this.statuses.forEach(status => {
        status.count = this.tickets.filter(ticket => {
          const ticketDate = ticket.fecha ? this.parseAndFormatDate(ticket.fecha) : null;
          return ticketDate && ticket.estado === status.title &&
              (!this.selectedArea || ticket.areaNombre === this.selectedArea) &&
              ticketDate === selectedDate; // Only count tickets created on selectedDate
        }).length;
      });
    },
    parseAndFormatDate(dateString) {
      const date = new Date(dateString);
      if (isNaN(date)) {
        console.error('Invalid date:', dateString);
        return null;
      }
      return date.toISOString().split('T')[0];
    },
    formatDate(date) {
      const [year, month, day] = date.split('-');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    },
    showCreateAreaModal() {
      this.showModal = true;
    },
    closeCreateAreaModal() {
      this.showModal = false;
      this.newAreaName = '';
    },
    async createArea() {
      if (this.newAreaName) {
        const area = {
          nombre: this.newAreaName,
          codigo: this.newAreaName.charAt(0).toUpperCase()
        };
        try {
          const response = await TicketApiService.createArea(area);
          this.areas.push(response.data);
          this.closeCreateAreaModal();

          // Send message via WebSocket
          const message = JSON.stringify({
            entityName: "Area",
            action: "Created",
            entity: response.data
          });
          this.webSocketService.sendMessage(message);
        } catch (error) {
          console.error('Error creating area:', error);
        }
      }
    },
    async submitObservation(comment, actionType) {
      try {
        await CommentApiService.createComment(comment);
        if (actionType === 'resolve') {
          await this.updateTicketStatus(this.selectedTicket, 'Resuelto', comment.coment);
        } else if (actionType === 'cancel') {
          await this.updateTicketStatus(this.selectedTicket, 'Cancelado', comment.coment);
        }
      } catch (error) {
        console.error('Error submitting observation:', error);
      }
    }
  }
};
</script>


<template>
  <div class="container">
    <div class="content">
      <div class="sidebar">
        <select v-if="userRole === 'Administrador'" v-model="selectedArea" @change="handleAreaChange">
          <option value="">Seleccionar Área</option>
          <option v-for="area in areas" :key="area.nombre" :value="area.nombre">{{ area.nombre }}</option>
        </select>
        <button v-if="userRole === 'Administrador'" @click="showCreateAreaModal">Crear Área</button>
      </div>
      <div class="status-bar">
        <div class="date-container">
          <h4>Tickets Pendientes</h4>
          <input type="date" v-model="selectedDate" class="date-input-right" @change="filterTicketsByDate" />
        </div>
        <div
            class="status"
            v-for="status in statuses"
            :key="status.title"
            :class="{ 'selected-status': selectedStatus === status.title, 'status-pending': status.title === 'En espera', 'status-open': status.title === 'Abierto', 'status-resolved': status.title === 'Resuelto', 'status-cancelled': status.title === 'Cancelado' }"
            @click="filterTicketsByStatus(status.title)"
        >
          <h3>{{ status.title }}</h3>
          <p>{{ status.count }}</p>
        </div>
      </div>
      <div class="main-content">
        <div class="ticket-list-panel">
          <TicketListComponent
              :tickets="tickets"
              :selectedArea="selectedArea"
              :selectedStatus="selectedStatus"
              :selectedTicket="selectedTicket"
              :selectedDate="selectedDate"
              @select-ticket="selectTicket"
          />
        </div>
        <div class="ticket-details-panel">
          <TicketDetailsComponent
              ref="ticketDetailsComponent"
              :selectedTicket="selectedTicket"
              @resolve-ticket="resolveTicket"
              @cancel-ticket="cancelTicket"
              @reopen-ticket="reopenTicket"
              @submit-observation="submitObservation"
              @ticket-transferred="handleTicketTransferred"
              @confirm-transfer="confirmTransfer"
          />
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>Crear Área</h3>
        <input v-model="newAreaName" placeholder="Nombre del Área"/>
        <button @click="createArea">Crear</button>
        <button @click="closeCreateAreaModal">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 1.5em;
  background-color: #f8f9fa;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Evita que el contenido se desborde */
}
.sidebar select option:hover {
  background-color: red;
}

.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.sidebar {
  margin-bottom: 1.5rem;
}

.sidebar select {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: white;
  width: 250px;
  font-size: 0.95rem;
}

.sidebar button {
  margin-left: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.sidebar button:hover {
  background-color: #2563eb;
}
.main-content {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  overflow: hidden; /* Evita que el contenido se desborde */
}

.ticket-list-panel {
  flex: 0.7;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  scrollbar-width: thin;
  border: 2px solid #dbdee6;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ticket-list-panel > * {
  flex: 1;
  width: 100%;
  height: 100%;
}

.ticket-details-panel {
  flex: 2;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  scrollbar-width: thin;
  border: 2px solid #dbdee6;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.5rem; /* Add padding for the contour */

}

.ticket-details-panel > * {
  flex: 1;
  width: 100%;
  height: 100%;
}



.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
}

.modal-content input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.modal-content button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
  margin: 0 0.5rem;
}

.modal-content button:first-of-type {
  background-color: #3b82f6;
  color: white;
}

.modal-content button:last-of-type {
  background-color: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  flex-wrap: nowrap; /* Keep elements in a single row */
}

.date-container {
  background-color: rgba(228, 244, 10, 0.67);
  border: 5px solid #e8c90f;
  padding: 0.5rem;
  border-radius: 0.5rem;
  text-align: center;
  cursor: pointer;
}

.date-container h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #1e293b;
}

.date-input-right {
  margin-right: 1rem;
  width: 80%;
}

.status {
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 15vh; /* Set height */
  flex: 0.3;
}

.status-pending {
  background-color: #e6f3ff;
  border-color: #2196f3;
  color: #2196f3;
}

.status-open {
  background-color: #fff3e0;
  border-color: #ff9800;
  color: #ff9800;
}

.status-resolved {
  background-color: #e8f5e9;
  border-color: #4caf50;
  color: #4caf50;
}

.status-cancelled {
  background-color: #ffebee;
  border-color: #f44336;
  color: #f44336;
}

.selected-status {
  transform: scale(1);
  background-color: #d1e7ff;
  border-color: #0d6efd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.status h3 {
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.status p {
  color: #64748b;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

/* Media queries for responsiveness */
@media (max-width: 768px) {
  .status-bar {
    gap: 0.5rem; /* Reduce gap between elements */
  }

  .status, .date-container {
    padding: 1rem; /* Adjust padding */
  }

  .status h3, .status p {
    font-size: 1rem; /* Adjust font size */
  }
}

@media (max-width: 480px) {
  .status-bar {
    gap: 0.25rem; /* Further reduce gap */
  }

  .status, .date-container {
    padding: 0.75rem; /* Further adjust padding */
  }

  .status h3, .status p {
    font-size: 0.9rem; /* Further adjust font size */
  }
}



</style>