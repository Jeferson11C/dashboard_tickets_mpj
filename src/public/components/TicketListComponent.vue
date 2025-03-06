<script>
export default {
  name: "TicketListComponent",
  props: {
    tickets: Array,
    selectedArea: String,
    selectedStatus: String,
    selectedTicket: Object,
    selectedDate: String,
  },
  computed: {
    filteredTickets() {
      const selectedDate = this.selectedDate;
      return this.tickets
          .filter(ticket => {
            const ticketDate = this.parseAndFormatDate(ticket.fecha);
            return (!this.selectedArea || ticket.areaNombre === this.selectedArea) &&
                (ticket.estado === this.selectedStatus) &&
                (ticketDate === selectedDate);
          })
          .sort((a, b) => {
            const numA = parseInt(a.numeroTicket.split('-')[1], 10);
            const numB = parseInt(b.numeroTicket.split('-')[1], 10);
            return numA - numB;
          });
    },
    getStatusColor() {
      return (status) => {
        switch(status.toLowerCase()) {
          default: return { bg: '#f1f5f9', text: '#475569' };
        }
      };
    }
  },
  methods: {
    parseAndFormatDate(dateString) {
      const date = new Date(dateString);
      if (isNaN(date)) {
        console.error('Invalid date:', dateString);
        return null;
      }
      return date.toISOString().split('T')[0];
    },
    selectTicket(ticket) {
      this.$emit('select-ticket', ticket);
    },
    getTicketNumber(ticketString) {
      const parts = ticketString.split('-');
      return parts.length > 1 ? parts[1] : ticketString;
    },
    getRandomGradient() {
      const gradients = [
      ];
      return gradients[Math.floor(Math.random() * gradients.length)];
    }
  }
};
</script>

<template>
  <div class="ticket-list">
    <div v-if="!selectedArea" class="no-area-selected">
      <div class="empty-state">
        <svg xmlns="" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
          <path d="M9 16l2 2 4-4"></path>
        </svg>
        <h4>Seleccione su área para atender los tickets</h4>
        <p>Los tickets aparecerán aquí una vez seleccione un área</p>
      </div>
    </div>
    <div v-else class="tickets-container">
      <div
          class="ticket"
          v-for="ticket in filteredTickets"
          :key="ticket.id"
          :class="{ 'selected-ticket': selectedTicket && selectedTicket.id === ticket.id }"
          @click="selectTicket(ticket)"
      >
        <div class="ticket-stripe" :style="{background: getRandomGradient()}"></div>
        <div class="ticket-content">
          <div class="ticket-header">
            <div class="ticket-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 5v2"></path><path d="M15 11v2"></path><path d="M15 17v2"></path>
                <path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"></path>
              </svg>
              <span>Ticket</span>
            </div>
            <div class="ticket-main-row">
              <div class="ticket-number">
                <span class="prefix">{{ ticket.numeroTicket.split('-')[0] }}-</span>
                <span class="number">{{ getTicketNumber(ticket.numeroTicket) }}</span>
              </div>
              <span class="ticket-status" :style="{
                backgroundColor: getStatusColor(ticket.estado).bg,
                color: getStatusColor(ticket.estado).text
              }">
                {{ ticket.estado }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredTickets.length === 0" class="no-tickets">
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h5>No hay tickets disponibles</h5>
          <p>No se encontraron tickets para los filtros seleccionados</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket-list {
  padding: 1.5em;
  width: 100%;
  max-width: 100%;
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  background-color: #f8fafc;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.empty-state h4 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #334155;
  font-weight: 600;
}

.empty-state p {
  color: #64748b;
  margin: 0;
}

.tickets-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 480px;
  margin: 0 auto;
}

.ticket {
  position: relative;
  display: flex;
  background-color: white;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 2px solid #1457ff;
}

.ticket:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
}

.ticket-stripe {
  width: 6px;
  height: 100%;
}

.ticket-content {
  flex: 1;
  padding: 1rem;
}

.selected-ticket {
  border: 2px solid #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3), 0 10px 15px -3px rgba(0, 0, 0, 0.08);
}

.ticket-header {
  display: flex;
  flex-direction: column;
}

.ticket-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.ticket-main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.ticket-number {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.ticket-number .prefix {
  color: #64748b;
  font-weight: 500;
}

.ticket-number .number {
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}

.ticket-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  text-transform: capitalize;
}

.no-tickets {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .tickets-container {
    max-width: 100%;
  }
}
</style>