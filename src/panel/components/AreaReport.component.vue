<template>
  <div class="general-summary">
    <h2>{{ area.nombre }}</h2>
    <p>Total de tickets: {{ countTicketsByArea(area.nombre) }}</p>
    <div class="summary">
      <div class="general-summary">
        <h3>Tickets Atendidos</h3>
        <p>Total de tickets atendidos: {{ countTicketsAttended(area.nombre) }}</p>
        <p>Total de tickets atendidos hoy: {{ countTicketsAttendedToday(area.nombre) }}</p>
        <p>Tickets atendidos esta semana: {{ countTicketsAttendedThisWeek(area.nombre) }}</p>
        <p>Tickets atendidos este mes: {{ countTicketsAttendedThisMonth(area.nombre) }}</p>
      </div>
      <div class="resolved-tickets">
        <h3>Tickets Resueltos</h3>
        <p>Total de tickets resueltos: {{ countTicketsByStatus(area.nombre, 'Resuelto') }}</p>
        <p>Tickets resueltos hoy: {{ countTicketsByDay(area.nombre, 'Resuelto') }}</p>
        <p>Tickets resueltos esta semana: {{ countTicketsByWeek(area.nombre, 'Resuelto') }}</p>
        <p>Tickets resueltos este mes: {{ countTicketsByMonth(area.nombre, 'Resuelto') }}</p>
      </div>
      <div class="canceled-tickets">
        <h3>Tickets Cancelados</h3>
        <p>Total de tickets cancelados: {{ countTicketsByStatus(area.nombre, 'Cancelado') }}</p>
        <p>Tickets cancelados hoy: {{ countTicketsByDay(area.nombre, 'Cancelado') }}</p>
        <p>Tickets cancelados esta semana: {{ countTicketsByWeek(area.nombre, 'Cancelado') }}</p>
        <p>Tickets cancelados este mes: {{ countTicketsByMonth(area.nombre, 'Cancelado') }}</p>
      </div>
    </div>
    <pv-button icon="pi pi-download"  @click="downloadPDF" />
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
      return this.tickets.filter(ticket => ticket.fecha.split('T')[0] === today && ticket.estado === status && ticket.areaNombre === area).length;
    },
    countTicketsByWeek(area, status) {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
      const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
      return this.tickets.filter(ticket => {
        const ticketDate = new Date(ticket.fecha);
        return ticketDate >= startOfWeek && ticketDate <= endOfWeek && ticket.estado === status && ticket.areaNombre === area;
      }).length;
    },
    countTicketsByMonth(area, status) {
      const currentMonth = new Date().getMonth();
      return this.tickets.filter(ticket => new Date(ticket.fecha).getMonth() === currentMonth && ticket.estado === status && ticket.areaNombre === area).length;
    },
    countTicketsByArea(area) {
      return this.tickets.filter(ticket => ticket.areaNombre === area).length;
    },
    countTicketsAttended(area) {
      return this.tickets.filter(ticket => (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado') && ticket.areaNombre === area).length;
    },
    countTicketsAttendedToday(area) {
      const today = new Date().toISOString().split('T')[0];
      return this.tickets.filter(ticket => ticket.fecha.split('T')[0] === today && (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado') && ticket.areaNombre === area).length;
    },
    countTicketsAttendedThisWeek(area) {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
      const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
      return this.tickets.filter(ticket => {
        const ticketDate = new Date(ticket.fecha);
        return ticketDate >= startOfWeek && ticketDate <= endOfWeek && (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado') && ticket.areaNombre === area;
      }).length;
    },
    countTicketsAttendedThisMonth(area) {
      const currentMonth = new Date().getMonth();
      return this.tickets.filter(ticket => new Date(ticket.fecha).getMonth() === currentMonth && (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado') && ticket.areaNombre === area).length;
    },
    countTicketsByStatus(area, status) {
      return this.tickets.filter(ticket => ticket.estado === status && ticket.areaNombre === area).length;
    },
    downloadPDF() {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.text(`Reporte de tickets - ${this.area.nombre}`, 10, 10);
      doc.autoTable({
        head: [['Número de Ticket', 'Área', 'Fecha', 'Documento', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Estado']],
        body: this.tickets.filter(ticket => ticket.areaNombre === this.area.nombre).map(ticket => [
          ticket.numeroTicket,
          ticket.areaNombre,
          ticket.fecha,
          ticket.documento,
          ticket.nombres,
          ticket.apePaterno,
          ticket.apeMaterno,
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
  padding: 1rem;
  background-color: #f9fafb;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.summary {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.general-summary, .resolved-tickets, .canceled-tickets {
  flex: 1;
  margin: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.general-summary h3, .resolved-tickets h3, .canceled-tickets h3 {
  margin-bottom: 1rem;
  color: #1e293b;
}

.general-summary p, .resolved-tickets p, .canceled-tickets p {
  margin: 0.5rem 0;
  color: #475569;
}
</style>