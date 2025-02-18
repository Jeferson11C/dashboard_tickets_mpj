<template>
  <div class="grafico-container" >
    <h1 class="main-title">Grafica de Tickets Atendidos </h1 >

    <div class="filters" v-if="userRole === 'Administrador'">
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
    <!-- Gráfico -->
    <div class="chart-container" v-if="userRole === 'Administrador'">
      <BarChart v-if="hasData" :chartData="chartData" :chartOptions="chartOptions" />
      <p v-else class="no-data-message">No hay datos disponibles para el mes y año seleccionados.</p>
    </div>
    <!-- Dashboard Component -->
    <Dashboard />
  </div>
</template>

<script>
import BarChart from '../components/BarChart.vue';
import Dashboard from '../components/Dashboard.vue';
import TicketApiService from '../../public/services/ticket-api.service';
import WebSocketService from '../../shared/websocket.service';
import dayjs from 'dayjs';

export default {
  name: "Grafico",
  components: {
    BarChart,
    Dashboard
  },
  data() {
    return {
      tickets: [],
      areas: [],
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Tickets Resueltos',
            backgroundColor: '#2ecc71',
            data: []
          },
          {
            label: 'Tickets Cancelados',
            backgroundColor: '#e74c3c',
            data: []
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      },
      selectedMonth: '',
      selectedYear: '',
      months: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ],
      years: [],
      hasData: false,
      socket: null,
      userRole: localStorage.getItem('userRole') // Get user role from localStorage
    };
  },
  async mounted() {
    const webSocketService = new WebSocketService(); // Create an instance of WebSocketService
    webSocketService.connect(); // Call the connect method
    this.socket = webSocketService.socket; // Assign the socket to this.socket

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.tickets = data;
      this.updateChartData();
    };

    await this.fetchTickets();
    await this.fetchAreas();
    this.generateYears();
    this.updateChartData();
  },
  watch: {
    selectedMonth() {
      this.updateChartData();
    },
    selectedYear() {
      this.updateChartData();
    }
  },
  computed: {
    filteredTickets() {
      return this.tickets.filter(ticket => {
        const ticketDate = dayjs(ticket.fecha);
        const matchesMonth = !this.selectedMonth || ticketDate.month() + 1 === parseInt(this.selectedMonth);
        const matchesYear = !this.selectedYear || ticketDate.year() === parseInt(this.selectedYear);
        return matchesMonth && matchesYear;
      });
    }
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
    generateYears() {
      const yearsSet = new Set();
      this.tickets.forEach(ticket => {
        const year = dayjs(ticket.fecha).year();
        yearsSet.add(year);
      });
      this.years = Array.from(yearsSet).sort((a, b) => b - a);
    },
    updateChartData() {
      const filteredTickets = this.filteredTickets;

      this.hasData = filteredTickets.length > 0;

      if (this.hasData) {
        this.chartData.labels = this.areas.map(area => area.nombre);

        this.chartData.datasets[0].data = this.areas.map(area =>
            filteredTickets.filter(ticket => ticket.areaNombre === area.nombre && ticket.estado === 'Resuelto').length
        );

        this.chartData.datasets[1].data = this.areas.map(area =>
            filteredTickets.filter(ticket => ticket.areaNombre === area.nombre && ticket.estado === 'Cancelado').length
        );
      } else {
        this.chartData.labels = [];
        this.chartData.datasets[0].data = [];
        this.chartData.datasets[1].data = [];
      }
    }
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close();
    }
  }
}
</script>

<style scoped>
.grafico-container {
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.main-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
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

.chart-container {
  height: 400px;
  background-color: #ffffff;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.no-data-message {
  text-align: center;
  color: #666;
  font-size: 1.2rem;
  margin-top: 2rem;
}
</style>