<template>
  <div class="container">
    <div class="content">
      <div class="sidebar">
        <select v-model="selectedArea" @change="handleAreaChange">
          <option value="">Seleccionar Área</option>
          <option v-for="area in areas" :key="area.nombre" :value="area.nombre">{{ area.nombre }}</option>
        </select>
        <button @click="showCreateAreaModal">Crear Área</button>
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
          <p><strong>Nombre:</strong> {{ selectedTicket.nombres }} {{ selectedTicket.apePaterno }} {{ selectedTicket.apeMaterno }}</p>
          <p><strong>Estado:</strong> {{ selectedTicket.estado }}</p>
          <div class="actions" v-if="selectedTicket.estado !== 'Resuelto' && selectedTicket.estado !== 'Cancelado'">
            <pv-button label="Resolver" @click="resolveTicket" />
            <pv-button label="Cancelar" @click="cancelTicket" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>Crear Área</h3>
        <input v-model="newAreaName" placeholder="Nombre del Área" />
        <button @click="createArea">Crear</button>
        <button @click="closeCreateAreaModal">Cancelar</button>
      </div>
    </div>
  </div>
</template>

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
      selectedArea: '',
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
    this.fetchTickets();
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
      }, 5000); // Polling interval of 5 seconds
    }
  }
};
</script>

<style scoped>
.container {
  padding: 1em;
}

.content {
  display: flex;
  flex-direction: column;
}

.sidebar {
  margin-bottom: 1em;
}

.status-bar {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1em;
}

.status {
  text-align: center;
  border: 1px solid #ddd;
  padding: 1em;
  margin: 0.5em;
  border-radius: 5px;
}

.status.selected-status {
  background-color: #d3d3d3; /* Color de resaltado para el estado seleccionado */
}

.ticket-list {
  display: flex;
}

.no-area-selected {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2em;
  text-align: center;
  color: #888;
}

.tickets {
  flex: 1;
  margin-right: 1em;
}

.ticket {
  border: 1px solid #ddd;
  padding: 1em;
  margin-bottom: 1em;
  cursor: pointer;
}

.ticket.selected-ticket {
  background-color: #d3d3d3; /* Color de resaltado para el ticket seleccionado */
}

.ticket-details {
  flex: 2;
  border: 1px solid #ddd;
  padding: 1em;
}

.actions {
  display: flex;
  justify-content: space-around;
  margin-top: 1em;
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
}

.modal-content {
  background: white;
  padding: 2em;
  border-radius: 5px;
  text-align: center;
}
</style>