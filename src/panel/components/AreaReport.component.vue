
<template>
  <div v-if="area.nombre.toLowerCase() !== 'general'" class="general-summary">
    <h2 class="area-title">{{ area.nombre }}</h2>
    <p class="total-tickets">Total de tickets: <span>{{ countTicketsByArea(area.nombre) }}</span></p>
    <div class="summary">
      <div class="card attended">
        <h3><i class="pi pi-check-circle"></i> Tickets Atendidos</h3>
        <div class="stats">
          <p>Total de tickets atendidos: <span>{{ countTicketsAttended(area.nombre) }}</span></p>
          <p>Total de tickets atendidos hoy: <span>{{ countTicketsAttendedToday(area.nombre) }}</span></p>
          <p>Total de tickets atendidos esta semana: <span>{{ countTicketsAttendedThisWeek(area.nombre) }}</span></p>
          <p>Total de tickets atendidos este mes: <span>{{ countTicketsAttendedThisMonth(area.nombre) }}</span></p>
        </div>
      </div>
      <div class="card resolved">
        <h3><i class="pi pi-check"></i> Tickets Resueltos</h3>
        <div class="stats">
          <p>Total de tickets resueltos: <span>{{ countTicketsByStatus(area.nombre, 'Resuelto') }}</span></p>
          <p>Tickets resueltos hoy: <span>{{ countTicketsByDay(area.nombre, 'Resuelto') }}</span></p>
          <p>Tickets resueltos esta semana: <span>{{ countTicketsByWeek(area.nombre, 'Resuelto') }}</span></p>
          <p>Tickets resueltos este mes: <span>{{ countTicketsByMonth(area.nombre, 'Resuelto') }}</span></p>
        </div>
      </div>
      <div class="card canceled">
        <h3><i class="pi pi-times-circle"></i> Tickets Cancelados</h3>
        <div class="stats">
          <p>Total de tickets cancelados: <span>{{ countTicketsByStatus(area.nombre, 'Cancelado') }}</span></p>
          <p>Tickets cancelados hoy: <span>{{ countTicketsByDay(area.nombre, 'Cancelado') }}</span></p>
          <p>Tickets cancelados esta semana: <span>{{ countTicketsByWeek(area.nombre, 'Cancelado') }}</span></p>
          <p>Tickets cancelados este mes: <span>{{ countTicketsByMonth(area.nombre, 'Cancelado') }}</span></p>
        </div>
      </div>
    </div>
    <pv-button icon="pi pi-download" label="Descargar PDF" class="download-btn" @click="downloadPDF" />
  </div>
</template>

<script>
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default {
  name: "AreaReport",
  props: {
    area: Object,
    tickets: Array
  },
  methods: {
    countTicketsByDay(area, status) {
      const today = new Date().toISOString().split('T')[0];
      return this.tickets.filter(ticket => ticket.updatedAt && ticket.updatedAt.split('T')[0] === today && ticket.estado === status && ticket.areaNombre === area).length;
    },
    countTicketsByWeek(area, status) {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
      const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
      return this.tickets.filter(ticket => {
        const ticketDate = new Date(ticket.updatedAt);
        return ticket.updatedAt && ticketDate >= startOfWeek && ticketDate <= endOfWeek && ticket.estado === status && ticket.areaNombre === area;
      }).length;
    },
    countTicketsByMonth(area, status) {
      const currentMonth = new Date().getMonth();
      return this.tickets.filter(ticket => ticket.updatedAt && new Date(ticket.updatedAt).getMonth() === currentMonth && ticket.estado === status && ticket.areaNombre === area).length;
    },
    countTicketsByArea(area) {
      return this.tickets.filter(ticket => ticket.areaNombre === area).length;
    },
    countTicketsAttended(area) {
      return this.tickets.filter(ticket => (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado') && ticket.areaNombre === area).length;
    },
    countTicketsAttendedToday(area) {
      const today = new Date().toISOString().split('T')[0];
      return this.tickets.filter(ticket => ticket.updatedAt && ticket.updatedAt.split('T')[0] === today && (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado') && ticket.areaNombre === area).length;
    },
    countTicketsAttendedThisWeek(area) {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
      const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
      return this.tickets.filter(ticket => {
        const ticketDate = new Date(ticket.updatedAt);
        return ticket.updatedAt && ticketDate >= startOfWeek && ticketDate <= endOfWeek && (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado') && ticket.areaNombre === area;
      }).length;
    },
    countTicketsAttendedThisMonth(area) {
      const currentMonth = new Date().getMonth();
      return this.tickets.filter(ticket => ticket.updatedAt && new Date(ticket.updatedAt).getMonth() === currentMonth && (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado') && ticket.areaNombre === area).length;
    },
    countTicketsByStatus(area, status) {
      return this.tickets.filter(ticket => ticket.estado === status && ticket.areaNombre === area).length;
    },
    downloadPDF() {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.text(`Reporte de tickets - ${this.area.nombre}`, 10, 10);
      doc.autoTable({
        head: [['Número de Ticket', 'Fecha', 'Fecha de atencion', 'Documento', 'Nombre', 'Estado']],
        body: this.tickets.filter(ticket => ticket.areaNombre === this.area.nombre).map(ticket => [
          ticket.numeroTicket,
          ticket.fecha,
          ticket.updatedAt,
          ticket.documento,
          `${ticket.nombres} ${ticket.apePaterno} ${ticket.apeMaterno}`,
          ticket.estado
        ])
      });
      doc.save(`reporte_${this.area.nombre}.pdf`);
    }
  }
}
</script>

<style scoped>
.general-summary {
  width: 100%;
  margin-bottom: 2rem;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.area-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.total-tickets {
  font-size: 1.25rem;
  color: #34495e;
  margin-bottom: 2rem;
}

.total-tickets span {
  font-weight: bold;
  color: #3b82f6;
}

.summary {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  width: 100%;
}

.card {
  flex: 1;
  padding: 1.5rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #ffffff, #f9fafb);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.card h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.card h3 i {
  margin-right: 0.75rem;
  font-size: 1.75rem;
}

.attended h3 i {
  color: #10b981;
}

.resolved h3 i {
  color: #3b82f6;
}

.canceled h3 i {
  color: #ef4444;
}

.stats p {
  font-size: 1rem;
  color: #475569;
  margin: 0.75rem 0;
}

.stats span {
  font-weight: bold;
  color: #1e293b;
}

.download-btn {
  margin-top: 2rem;
  background-color: #3b82f6;
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.download-btn:hover {
  background-color: #2563eb;
}
</style>