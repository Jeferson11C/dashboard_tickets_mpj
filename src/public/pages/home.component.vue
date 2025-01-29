<script>
import TicketApiService from '../services/ticket-api.service';

export default {
  name: "home.component",
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
      selectedArea: localStorage.getItem('userArea') || '', // Retrieve user's area
      userRole: localStorage.getItem('userRole') || '', // Retrieve user's role
      selectedStatus: 'En espera',
      showModal: false,
      newAreaName: ''
    };
  },
  computed: {
    filteredTickets() {
      return this.tickets.filter(ticket => {
        return (!this.selectedArea || ticket.areaNombre === this.selectedArea) &&
            (ticket.estado === this.selectedStatus);
      });
    }
  },
  created() {
    if (this.userRole === 'user') {
      this.selectedArea = localStorage.getItem('userArea');
    }
    this.fetchTickets(this.selectedArea); // Filter tickets by user's area
    this.fetchAreas();
    this.startPolling();
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
        this.areas = response.data;
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    },
    selectTicket(ticket) {
      this.selectedTicket = ticket;
    },
    async updateTicketStatus(ticket, status) {
      try {
        ticket.estado = status;
        this.updateStatusCounts();
        this.selectedTicket = null;
        await TicketApiService.updateStatus(ticket.id, status);
      } catch (error) {
        console.error('Error updating ticket status:', error);
      }
    },
    async resolveTicket() {
      if (this.selectedTicket) {
        await this.updateTicketStatus(this.selectedTicket, 'Resuelto');
      }
    },
    async cancelTicket() {
      if (this.selectedTicket) {
        await this.updateTicketStatus(this.selectedTicket, 'Cancelado');
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
          await TicketApiService.createArea(area);
          this.fetchAreas();
          this.closeCreateAreaModal();
        } catch (error) {
          console.error('Error creating area:', error);
        }
      }
    },
    startPolling() {
      setInterval(() => {
        this.fetchTickets(this.selectedArea);
      }, 1000); // Polling interval of 5 seconds
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
      <div class="ticket-list">
        <div v-if="!selectedArea" class="no-area-selected">
          <p>Seleccione su área para atender los tickets</p>
        </div>
        <div v-else class="tickets">
          <div
              class="ticket"
              v-for="ticket in filteredTickets"
              :key="ticket.id"
              :class="{ 'selected-ticket': selectedTicket && selectedTicket.id === ticket.id }"
              @click="selectTicket(ticket)"
          >
            <h4>Ticket: {{ ticket.numeroTicket }}</h4>
            <p>Estado: {{ ticket.estado }}</p>
          </div>
        </div>
        <div class="ticket-details" v-if="selectedTicket">
          <h3>Detalles del Ticket</h3>
          <p><strong>Número de Ticket:</strong> {{ selectedTicket.numeroTicket }}</p>
          <p><strong>Área:</strong> {{ selectedTicket.areaNombre }}</p>
          <p><strong>Fecha:</strong> {{ selectedTicket.fecha }}</p>
          <p><strong>Nombre:</strong> {{ selectedTicket.nombres }} {{ selectedTicket.apePaterno }}
            {{ selectedTicket.apeMaterno }}</p>
          <p><strong>Estado:</strong> {{ selectedTicket.estado }}</p>
          <div class="actions" v-if="selectedTicket.estado !== 'Resuelto' && selectedTicket.estado !== 'Cancelado'">
            <pv-button label="Resolver" @click="resolveTicket"/>
            <pv-button label="Cancelar" @click="cancelTicket"/>
          </div>
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

/* Estado específico para "Resuelto" */
.status:nth-child(2) {
  background-color: #e8f5e9;
  border: 2px solid #4caf50;
  color: #4caf50;
}

/* Estado específico para "Cancelado" */
.status:nth-child(3) {
  background-color: #ffebee;
  border: 2px solid #f44336;
  color: #f44336;
}

.ticket-list {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  min-height: 500px;
}

.no-area-selected {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border-radius: 0.75rem;
  padding: 3rem;
  font-size: 1.25rem;
  color: #64748b;
  border: 2px dashed #e2e8f0;
}

.tickets {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-height: 600px;
  padding-right: 1rem;
}

.ticket {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.ticket:hover {
  transform: translateX(4px);
  border-color: #94a3b8;
}

.ticket.selected-ticket {
  background-color: #f1f5f9;
  border-color: #3b82f6;
}

.ticket h4 {
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.ticket p {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

.ticket-details {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.ticket-details h3 {
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
}

.ticket-details p {
  color: #475569;
  margin: 0.75rem 0;
  font-size: 1rem;
}

.ticket-details strong {
  color: #1e293b;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
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