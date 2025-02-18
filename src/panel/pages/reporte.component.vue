<template>
  <div class="reporte">
    <h1 class="main-title">Reporte de tickets atendidos</h1>

    <div class="filters">
      <div class="filter">
        <label for="month">Mes:</label>
        <select id="month" v-model="selectedMonth">
          <option value="">Todos</option>
          <option v-for="(month, index) in months" :key="index" :value="index + 1">{{ month }}</option>
        </select>
      </div>
      <div class="filter">
        <label for="year">Año:</label>
        <select id="year" v-model="selectedYear">
          <option value="">Todos</option>
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
    </div>

    <div v-if="userRole === 'Administrador'" class="general-summary">
      <h2 class="summary-title">Resumen General</h2>
      <p class="total-tickets">Total de tickets: <span>{{ countTotalTickets() }}</span></p>
      <div class="summary">
        <div class="card attended">
          <h3><i class="pi pi-check-circle"></i> Tickets Atendidos</h3>
          <div class="stats">
            <p>Total de tickets atendidos: <span>{{ countTotalTicketsAttended() }}</span></p>
            <p>Total de tickets atendidos hoy: <span>{{ countTotalTicketsAttendedToday() }}</span></p>
            <p>Tickets atendidos esta semana: <span>{{ countTotalTicketsAttendedThisWeek() }}</span></p>
            <p>Tickets atendidos este mes: <span>{{ countTotalTicketsAttendedThisMonth() }}</span></p>
          </div>
        </div>
        <div class="card resolved">
          <h3><i class="pi pi-check"></i> Tickets Resueltos</h3>
          <div class="stats">
            <p>Total de tickets resueltos: <span>{{ countTotalTicketsByStatus('Resuelto') }}</span></p>
            <p>Tickets resueltos hoy: <span>{{ countTotalTicketsByDay('Resuelto') }}</span></p>
            <p>Tickets resueltos esta semana: <span>{{ countTotalTicketsByWeek('Resuelto') }}</span></p>
            <p>Tickets resueltos este mes: <span>{{ countTotalTicketsByMonth('Resuelto') }}</span></p>
          </div>
        </div>
        <div class="card canceled">
          <h3><i class="pi pi-times-circle"></i> Tickets Cancelados</h3>
          <div class="stats">
            <p>Total de tickets cancelados: <span>{{ countTotalTicketsByStatus('Cancelado') }}</span></p>
            <p>Tickets cancelados hoy: <span>{{ countTotalTicketsByDay('Cancelado') }}</span></p>
            <p>Tickets cancelados esta semana: <span>{{ countTotalTicketsByWeek('Cancelado') }}</span></p>
            <p>Tickets cancelados este mes: <span>{{ countTotalTicketsByMonth('Cancelado') }}</span></p>
          </div>
        </div>
      </div>
      <pv-button icon="pi pi-download" label="Descargar PDF" class="download-btn" @click="downloadPDF" />
      <pv-button icon="pi pi-file-excel" label="Descargar Excel" class="download-btn" @click="downloadExcel" />
    </div>

    <AreaReport v-for="area in filteredAreas" :key="area.id" :area="area" :tickets="filteredTickets" />
  </div>
</template>

<script>
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import TicketApiService from '../../public/services/ticket-api.service';
import AreaReport from '../components/AreaReport.component.vue';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

export default {
  name: "reporte",
  components: {
    AreaReport
  },
  data() {
    return {
      tickets: [],
      areas: [],
      selectedMonth: '',
      selectedYear: '',
      userRole: localStorage.getItem('userRole'),
      userArea: localStorage.getItem('userArea'),
      months: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ],
      years: []
    };
  },
  mounted() {
    this.fetchTickets();
    this.fetchAreas();
    this.generateYears();
  },
  computed: {
    filteredTickets() {
      return this.tickets.filter(ticket => {
        const ticketDate = dayjs(ticket.updatedAt);
        const matchesMonth = !this.selectedMonth || ticketDate.month() + 1 === parseInt(this.selectedMonth);
        const matchesYear = !this.selectedYear || ticketDate.year() === parseInt(this.selectedYear);
        return matchesMonth && matchesYear;
      });
    },
    filteredAreas() {
      if (this.userRole === 'Administrador') {
        return this.areas.filter(area => area.nombre.toLowerCase() !== 'general');
      } else if (this.userRole === 'Recepcionista') {
        return this.areas.filter(area => area.nombre === this.userArea && area.nombre.toLowerCase() !== 'general');
      }
      return [];
    }
  },
  methods: {
    async fetchTickets() {
      try {
        const response = await TicketApiService.getAll();
        this.tickets = response.data;
        this.generateYears(); // Call generateYears after loading the tickets
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
    generateYears() {
      const yearsSet = new Set();
      this.tickets.forEach(ticket => {
        const year = dayjs(ticket.updatedAt).year();
        yearsSet.add(year);
      });
      this.years = Array.from(yearsSet).sort((a, b) => b - a);
    },
    countTotalTickets() {
      return this.filteredTickets.length;
    },
    countTotalTicketsAttended() {
      return this.filteredTickets.filter(ticket => ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado').length;
    },
    countTotalTicketsAttendedToday() {
      const today = new Date().toISOString().split('T')[0];
      return this.filteredTickets.filter(ticket => ticket.updatedAt && ticket.updatedAt.split('T')[0] === today && (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado')).length;
    },
    countTotalTicketsAttendedThisWeek() {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
      const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
      return this.filteredTickets.filter(ticket => {
        const ticketDate = new Date(ticket.updatedAt);
        return ticket.updatedAt && ticketDate >= startOfWeek && ticketDate <= endOfWeek && (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado');
      }).length;
    },
    countTotalTicketsAttendedThisMonth() {
      const currentMonth = new Date().getMonth();
      return this.filteredTickets.filter(ticket => ticket.updatedAt && new Date(ticket.updatedAt).getMonth() === currentMonth && (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado')).length;
    },
    countTotalTicketsByDay(status) {
      const today = new Date().toISOString().split('T')[0];
      return this.filteredTickets.filter(ticket => ticket.updatedAt && ticket.updatedAt.split('T')[0] === today && ticket.estado === status).length;
    },
    countTotalTicketsByWeek(status) {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
      const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
      return this.filteredTickets.filter(ticket => {
        const ticketDate = new Date(ticket.updatedAt);
        return ticket.updatedAt && ticketDate >= startOfWeek && ticketDate <= endOfWeek && ticket.estado === status;
      }).length;
    },
    countTotalTicketsByMonth(status) {
      const currentMonth = new Date().getMonth();
      return this.filteredTickets.filter(ticket => ticket.updatedAt && new Date(ticket.updatedAt).getMonth() === currentMonth && ticket.estado === status).length;
    },
    countTotalTicketsByStatus(status) {
      return this.filteredTickets.filter(ticket => ticket.estado === status).length;
    },
    downloadPDF() {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.text('Reporte General de Tickets', 10, 10);

      const areas = [...new Set(this.filteredTickets.map(ticket => ticket.areaNombre))];

      areas.forEach((area, index) => {
        if (index > 0) {
          doc.addPage();
        }
        doc.text(`Área: ${area}`, 10, 20);
        doc.autoTable({
          startY: 30,
          head: [['Número de Ticket', 'Fecha','Fecha de atencion', 'Documento', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Estado']],
          body: this.filteredTickets
              .filter(ticket => ticket.areaNombre === area)
              .map(ticket => [
                ticket.numeroTicket,
                ticket.fecha,
                ticket.updatedAt,
                ticket.documento,
                ticket.nombres,
                ticket.apePaterno,
                ticket.apeMaterno,
                ticket.estado
              ])
        });
      });

      doc.save('reporte_general.pdf');
    },
    downloadExcel() {
      const ws = XLSX.utils.json_to_sheet(this.filteredTickets.map(ticket => ({
        'Número de Ticket': ticket.numeroTicket,
        'Área': ticket.areaNombre,
        'Fecha': ticket.fecha,
        'Fecha de atencion': ticket.updatedAt,
        'Documento': ticket.documento,
        'Nombres': ticket.nombres,
        'Apellido Paterno': ticket.apePaterno,
        'Apellido Materno': ticket.apeMaterno,
        'Estado': ticket.estado
      })));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Tickets');

      XLSX.writeFile(wb, 'reporte_general.xlsx');
    }
  }
}
</script>

<style scoped>
.reporte {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #f8f9fa;
}

.main-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.general-summary {
  width: 100%;
  margin-bottom: 2rem;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.summary-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
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

.filters {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter label {
  font-size: 1rem;
  color: #34495e;
}

.filter select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
}


</style>