<template>
  <div class="container">
    <div class="content">
      <div class="sidebar">
        <select v-model="selectedArea" @change="updateStatusCounts">
          <option value="">Seleccionar Área</option>
          <option value="Rentas">Rentas</option>
          <option value="Secretariado">Secretariado</option>
          <option value="Informatica">Informática</option>
        </select>
      </div>
      <div class="status-bar">
        <div class="status" v-for="status in statuses" :key="status.title" @click="filterTicketsByStatus(status.title)">
          <h3>{{ status.title }}</h3>
          <p>{{ status.count }}</p>
        </div>
      </div>
      <div class="ticket-list" v-if="selectedArea">
        <div class="tickets">
          <div class="ticket" v-for="ticket in filteredTickets" :key="ticket.id" @click="selectTicket(ticket)">
            <h4>{{ ticket.numeroTicket }}</h4>
            <p>Área: {{ ticket.area }}</p>
            <p>Fecha: {{ ticket.fecha }}</p>
            <p>Nombre: {{ ticket.nombres }} {{ ticket.apePaterno }} {{ ticket.apeMaterno }}</p>
            <p>Estado: {{ ticket.estado }}</p>
          </div>
        </div>
        <div class="ticket-details" v-if="selectedTicket">
          <h3>Detalles del Ticket</h3>
          <p><strong>Número de Ticket:</strong> {{ selectedTicket.numeroTicket }}</p>
          <p><strong>Área:</strong> {{ selectedTicket.area }}</p>
          <p><strong>Fecha:</strong> {{ selectedTicket.fecha }}</p>
          <p><strong>Nombre:</strong> {{ selectedTicket.nombres }} {{ selectedTicket.apePaterno }} {{ selectedTicket.apeMaterno }}</p>
          <p><strong>Estado:</strong> {{ selectedTicket.estado }}</p>
          <div class="actions" v-if="selectedTicket.estado !== 'Resuelto' && selectedTicket.estado !== 'Cerrado'">
            <pv-button label="Resolver" @click="resolveTicket" />
            <pv-button label="Cancelar" @click="cancelTicket" />
          </div>
        </div>
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
        { title: "En espera", count: 0 },
        { title: "Resuelto", count: 0 },
        { title: "Cerrado", count: 0 }
      ],
      tickets: [],
      selectedTicket: null,
      selectedArea: '',
      selectedStatus: 'En espera'
    };
  },
  computed: {
    filteredTickets() {
      return this.tickets.filter(ticket => {
        return (this.selectedArea && ticket.area === this.selectedArea) &&
            (ticket.estado === this.selectedStatus);
      });
    }
  },
  created() {
    this.fetchTickets();
  },
  methods: {
    async fetchTickets() {
      try {
        const response = await TicketApiService.getAll();
        this.tickets = response.data;
        this.updateStatusCounts();
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    },
    selectTicket(ticket) {
      this.selectedTicket = ticket;
    },
    async updateTicketStatus(ticket, status) {
      try {
        ticket.estado = status;
        await TicketApiService.update(ticket.id, ticket);
        this.updateStatusCounts();
      } catch (error) {
        console.error('Error updating ticket status:', error);
      }
    },
    async resolveTicket() {
      if (this.selectedTicket) {
        await this.updateTicketStatus(this.selectedTicket, 'Resuelto');
        this.selectedTicket = null;
      }
    },
    async cancelTicket() {
      if (this.selectedTicket) {
        await this.updateTicketStatus(this.selectedTicket, 'Cerrado');
        this.selectedTicket = null;
      }
    },
    filterTicketsByStatus(status) {
      this.selectedStatus = status;
    },
    updateStatusCounts() {
      this.statuses.forEach(status => {
        status.count = this.tickets.filter(ticket =>
            ticket.estado === status.title &&
            (!this.selectedArea || ticket.area === this.selectedArea)
        ).length;
      });
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

.ticket-list {
  display: flex;
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
</style>