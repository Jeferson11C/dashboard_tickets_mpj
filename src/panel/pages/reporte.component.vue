<template>
  <div class="reporte">
    <div class="report-header">
      <h1 class="main-title">Reporte de tickets atendidos</h1>
      <div class="filters-container">
        <div class="filters">
          <div class="filter">
            <label for="month">Mes:</label>
            <select id="month" v-model="selectedMonth" class="filter-select">
              <option value="">Todos</option>
              <option v-for="(month, index) in months" :key="index" :value="index + 1">{{ month }}</option>
            </select>
          </div>
          <div class="filter">
            <label for="year">Año:</label>
            <select id="year" v-model="selectedYear" class="filter-select">
              <option value="">Todos</option>
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>
        <div class="export-buttons" v-if="userRole === 'Administrador'">
          <pv-button icon="pi pi-download" label="Descargar PDF" class="download-btn pdf-btn" @click="downloadPDF" />
          <pv-button icon="pi pi-file-excel" label="Descargar Excel" class="download-btn excel-btn" @click="downloadExcel" />
        </div>
      </div>
    </div>

    <div v-if="userRole === 'Administrador'" class="general-summary">
      <div class="summary-header">
        <h2 class="summary-title">Resumen General</h2>
        <div class="total-tickets-badge">
          Total de tickets: <span>{{ countTotalTickets() }}</span>
        </div>
      </div>

      <div class="summary-dashboard">
        <div class="card attended">
          <div class="card-header">
            <i class="pi pi-check-circle"></i>
            <h3>Tickets Atendidos</h3>
          </div>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">Total:</span>
              <span class="stat-value">{{ countTotalTicketsAttended() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Hoy:</span>
              <span class="stat-value">{{ countTotalTicketsAttendedToday() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Esta semana:</span>
              <span class="stat-value">{{ countTotalTicketsAttendedThisWeek() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Este mes:</span>
              <span class="stat-value">{{ countTotalTicketsAttendedThisMonth() }}</span>
            </div>
          </div>
        </div>

        <div class="card resolved">
          <div class="card-header">
            <i class="pi pi-check"></i>
            <h3>Tickets Resueltos</h3>
          </div>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">Total:</span>
              <span class="stat-value">{{ countTotalTicketsByStatus('Resuelto') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Hoy:</span>
              <span class="stat-value">{{ countTotalTicketsByDay('Resuelto') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Esta semana:</span>
              <span class="stat-value">{{ countTotalTicketsByWeek('Resuelto') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Este mes:</span>
              <span class="stat-value">{{ countTotalTicketsByMonth('Resuelto') }}</span>
            </div>
          </div>
        </div>

        <div class="card canceled">
          <div class="card-header">
            <i class="pi pi-times-circle"></i>
            <h3>Tickets Cancelados</h3>
          </div>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">Total:</span>
              <span class="stat-value">{{ countTotalTicketsByStatus('Cancelado') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Hoy:</span>
              <span class="stat-value">{{ countTotalTicketsByDay('Cancelado') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Esta semana:</span>
              <span class="stat-value">{{ countTotalTicketsByWeek('Cancelado') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Este mes:</span>
              <span class="stat-value">{{ countTotalTicketsByMonth('Cancelado') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="area-reports" v-if="filteredAreas.length || filteredTickets.length">
      <AreaReport v-for="area in filteredAreas" :key="area.id" :area="area" :tickets="filteredTickets" />
    </div>
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
    const currentDate = new Date();
    return {
      tickets: [],
      areas: [],
      selectedMonth: currentDate.getMonth() + 1, // Current month (1-12)
      selectedYear: currentDate.getFullYear(), // Current year
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
    formatDate(dateString) {
      if (!dateString) return '---';
      const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleString('es-ES', options);
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
          head: [['Número de Ticket', 'Fecha', 'Fecha de atencion', 'Documento', 'Nombre', 'Estado']],
          body: this.filteredTickets
              .filter(ticket => ticket.areaNombre === area)
              .map(ticket => [
                ticket.numeroTicket,
                this.formatDate(ticket.fecha),
                ticket.updatedAt ? this.formatDate(ticket.updatedAt) : '---',
                ticket.documento,
                `${ticket.nombres} ${ticket.apePaterno} ${ticket.apeMaterno}`,
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
        'Fecha': this.formatDate(ticket.fecha),
        'Fecha de atencion': ticket.updatedAt ? this.formatDate(ticket.updatedAt) : '---',
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
  flex-direction: column;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f9fafb;
  color: #1e293b;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

/* Header Styles */
.report-header {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 2rem;
}

.main-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
}

.main-title::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #1e40af);
  border-radius: 2px;
}

/* Filters and Export Buttons */
.filters-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #f8fafc;
  font-size: 0.9rem;
  color: #334155;
  min-width: 120px;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.export-buttons {
  display: flex;
  gap: 0.75rem;
}

.download-btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pdf-btn {
  background-color: #ef4444;
  border: none;
}

.pdf-btn:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.excel-btn {
  background-color: #22c55e;
  border: none;
}

.excel-btn:hover {
  background-color: #16a34a;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* General Summary Styles */
.general-summary {
  width: 100%;
  margin-bottom: 2.5rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(90deg, #1e40af, #3b82f6);
  color: white;
}

.summary-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.total-tickets-badge {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.total-tickets-badge span {
  font-weight: 700;
  margin-left: 0.25rem;
}

.summary-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.card {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
}

.card-header i {
  font-size: 1.75rem;
  margin-right: 1rem;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.attended .card-header i {
  color: #10b981;
}

.resolved .card-header i {
  color: #3b82f6;
}

.canceled .card-header i {
  color: #ef4444;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  padding: 0.75rem;
  border-radius: 0.5rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.attended .stat-value {
  color: #059669;
}

.resolved .stat-value {
  color: #2563eb;
}

.canceled .stat-value {
  color: #dc2626;
}

/* Area Reports Section */
.area-reports {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }

  .export-buttons {
    justify-content: center;
    margin-top: 1rem;
  }

  .summary-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}
</style>