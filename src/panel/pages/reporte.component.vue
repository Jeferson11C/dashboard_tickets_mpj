<template>
  <div class="reporte">
    <h1>Reporte de tickets atendidos</h1>
    <div class="general-summary">
      <h2>Resumen General</h2>
      <p>Total de tickets: {{ countTotalTickets() }}</p>
      <div class="summary">
        <div class="general-summary">
          <h3>Tickets Atendidos</h3>
          <p>Total de tickets atendidos: {{ countTotalTicketsAttended() }}</p>
          <p>Total de tickets atendidos hoy: {{ countTotalTicketsAttendedToday() }}</p>
          <p>Tickets atendidos esta semana: {{ countTotalTicketsAttendedThisWeek() }}</p>
          <p>Tickets atendidos este mes: {{ countTotalTicketsAttendedThisMonth() }}</p>
        </div>
        <div class="resolved-tickets">
          <h3>Tickets Resueltos</h3>
          <p>Total de tickets resueltos: {{ countTotalTicketsByStatus('Resuelto') }}</p>
          <p>Tickets resueltos hoy: {{ countTotalTicketsByDay('Resuelto') }}</p>
          <p>Tickets resueltos esta semana: {{ countTotalTicketsByWeek('Resuelto') }}</p>
          <p>Tickets resueltos este mes: {{ countTotalTicketsByMonth('Resuelto') }}</p>
        </div>
        <div class="canceled-tickets">
          <h3>Tickets Cancelados</h3>
          <p>Total de tickets cancelados: {{ countTotalTicketsByStatus('Cancelado') }}</p>
          <p>Tickets cancelados hoy: {{ countTotalTicketsByDay('Cancelado') }}</p>
          <p>Tickets cancelados esta semana: {{ countTotalTicketsByWeek('Cancelado') }}</p>
          <p>Tickets cancelados este mes: {{ countTotalTicketsByMonth('Cancelado') }}</p>
        </div>
      </div>
      <pv-button icon="pi pi-download" @click="downloadPDF" />
    </div>

    <AreaReport v-for="area in areas" :key="area.id" :area="area" :tickets="tickets" />
  </div>
</template>

<script>
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import TicketApiService from '../../public/services/ticket-api.service';
import AreaReport from '../components/AreaReport.component.vue';

export default {
  name: "reporte",
  components: {
    AreaReport
  },
  data() {
    return {
      tickets: [],
      areas: []
    };
  },
  mounted() {
    this.fetchTickets();
    this.fetchAreas();
  },
  methods: {
    async fetchTickets() {
      try {
        const response = await TicketApiService.getAll();
        this.tickets = response.data;
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
    countTotalTickets() {
      return this.tickets.length;
    },
    countTotalTicketsAttended() {
      return this.tickets.filter(ticket => ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado').length;
    },
    countTotalTicketsAttendedToday() {
      const today = new Date().toISOString().split('T')[0];
      return this.tickets.filter(ticket => ticket.fecha.split('T')[0] === today && (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado')).length;
    },
    countTotalTicketsAttendedThisWeek() {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
      const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
      return this.tickets.filter(ticket => {
        const ticketDate = new Date(ticket.fecha);
        return ticketDate >= startOfWeek && ticketDate <= endOfWeek && (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado');
      }).length;
    },
    countTotalTicketsAttendedThisMonth() {
      const currentMonth = new Date().getMonth();
      return this.tickets.filter(ticket => new Date(ticket.fecha).getMonth() === currentMonth && (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado')).length;
    },
    countTotalTicketsByDay(status) {
      const today = new Date().toISOString().split('T')[0];
      return this.tickets.filter(ticket => ticket.fecha.split('T')[0] === today && ticket.estado === status).length;
    },
    countTotalTicketsByWeek(status) {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
      const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
      return this.tickets.filter(ticket => {
        const ticketDate = new Date(ticket.fecha);
        return ticketDate >= startOfWeek && ticketDate <= endOfWeek && ticket.estado === status;
      }).length;
    },
    countTotalTicketsByMonth(status) {
      const currentMonth = new Date().getMonth();
      return this.tickets.filter(ticket => new Date(ticket.fecha).getMonth() === currentMonth && ticket.estado === status).length;
    },
    countTotalTicketsByStatus(status) {
      return this.tickets.filter(ticket => ticket.estado === status).length;
    },
    downloadPDF() {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.text('Reporte General de Tickets', 10, 10);

      const areas = [...new Set(this.tickets.map(ticket => ticket.areaNombre))];

      areas.forEach((area, index) => {
        if (index > 0) {
          doc.addPage();
        }
        doc.text(`Área: ${area}`, 10, 20);
        doc.autoTable({
          startY: 30,
          head: [['Número de Ticket', 'Fecha', 'Documento', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Estado']],
          body: this.tickets
              .filter(ticket => ticket.areaNombre === area)
              .map(ticket => [
                ticket.numeroTicket,
                ticket.fecha,
                ticket.documento,
                ticket.nombres,
                ticket.apePaterno,
                ticket.apeMaterno,
                ticket.estado
              ])
        });
      });

      doc.save('reporte_general.pdf');
    }
  }
}
</script>

<style scoped>
.reporte {
  display: flex;
  flex-direction: column;
  align-items: center;
}

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