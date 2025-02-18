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
        <div
            class="status"
            v-for="status in statuses"
            :key="status.title"
            :class="{ 'selected-status': selectedStatus === status.title }"
            @click="filterTicketsByStatus(status.title)"
        >
          <h3>{{ status.title }}</h3>
          <p>{{ status.count }}</p>
        </div>
      </div>
      <div class="main-content">
        <TicketListComponent
            :tickets="tickets"
            :selectedArea="selectedArea"
            :selectedStatus="selectedStatus"
            :selectedTicket="selectedTicket"
            @select-ticket="selectTicket"
        />
        <TicketDetailsComponent
            ref="ticketDetailsComponent"
            :selectedTicket="selectedTicket"
            @resolve-ticket="resolveTicket"
            @cancel-ticket="cancelTicket"
            @reopen-ticket="reopenTicket"
            @submit-observation="submitObservation"
            v-if="selectedTicket"
            @ticket-transferred="handleTicketTransferred"
            @confirm-transfer="confirmTransfer"
        />
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

<script>
import TicketListComponent from '../components/TicketListComponent.vue';
import TicketDetailsComponent from '../components/TicketDetailsComponent.vue';
import TicketApiService from '../services/ticket-api.service';
import CommentApiService from '../services/comment-api.service';
import WebSocketService from '../../shared/WebSocket.Service';

export default {
  name: "home.component",
  components: {
    TicketListComponent,
    TicketDetailsComponent
  },
  data() {
    return {
      statuses: [
        {title: "En espera", count: 0},
        {title: "Resuelto", count: 0},
        {title: "Cancelado", count: 0}
      ],
      tickets: [],
      areas: [],
      selectedTicket: null,
      selectedArea: localStorage.getItem('userArea') || '',
      userRole: localStorage.getItem('userRole') || '',
      selectedStatus: 'En espera',
      showModal: false,
      newAreaName: '',
      webSocketService: null,
      ticketToTransfer: null
    };
  },
  created() {
    if (this.userRole === 'user') {
      this.selectedArea = localStorage.getItem('userArea');
    }
    this.fetchTickets(this.selectedArea);
    this.fetchAreas();
    this.setupWebSocketConnection();
    this.startPolling();
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
      this.selectedStatus = status;
    },
    handleAreaChange() {
      this.selectedTicket = null;
      this.fetchTickets(this.selectedArea);
    },
    updateStatusCounts() {
      this.statuses.forEach(status => {
        status.count = this.tickets.filter(ticket =>
            ticket.estado === status.title &&
            (!this.selectedArea || ticket.areaNombre === this.selectedArea)
        ).length;
      });
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
    startPolling() {
      setInterval(() => {
        this.fetchTickets(this.selectedArea);
      }, 1000);
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


<style scoped>
.container {
  padding: 1.5em;
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
  transition: background-color 0.2s;
}

.sidebar button:hover {
  background-color: #2563eb;
}

.status-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.status {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.status h3 {
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.status p {
  color: #64748b;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

/* Estado específico para "En espera" */
.status:nth-child(1) {
  background-color: #e6f3ff;
  border: 2px solid #2196f3;
  color: #2196f3;
}

.status:nth-child(2) {
  background-color: #e8f5e9;
  border: 2px solid #4caf50;
  color: #4caf50;
}

.status:nth-child(3) {
  background-color: #ffebee;
  border: 2px solid #f44336;
  color: #f44336;
}

.main-content {
  display: flex;
  gap: 1rem;
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
  padding: 2.5rem;
  border-radius: 1rem;
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
</style>