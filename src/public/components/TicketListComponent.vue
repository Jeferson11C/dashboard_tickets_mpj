<template>
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
  </div>
</template>

<script>
export default {
  name: "TicketListComponent",
  props: {
    tickets: Array,
    selectedArea: String,
    selectedStatus: String,
    selectedTicket: Object,
  },
  computed: {
    filteredTickets() {
      return this.tickets
          .filter(ticket => {
            return (!this.selectedArea || ticket.areaNombre === this.selectedArea) &&
                (ticket.estado === this.selectedStatus) &&
                (ticket.estado !== 'Abierto');
          })
          .sort((a, b) => {
            const numA = parseInt(a.numeroTicket.split('-')[1], 10);
            const numB = parseInt(b.numeroTicket.split('-')[1], 10);
            return numA - numB;
          });
    }
  },
  methods: {
    selectTicket(ticket) {
      this.$emit('select-ticket', ticket);
    }
  }
};
</script>

<style scoped>
.ticket-list {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
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
  background-color: white;
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
</style>