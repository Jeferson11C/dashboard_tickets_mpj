<template>
  <div class="grafico-container">
    <h1 class="main-title">Gráfica de Tickets Atendidos</h1>

    <div class="panel-container" v-if="userRole === 'Administrador'">
      <!-- Panel de filtros integrado en el gráfico -->
      <div class="filter-panel">
        <h4 class="filter-title">Distribución de Tickets Resueltos y Cancelados por Área</h4>
        <div class="filters-grid">
          <div class="filter-item">
            <label for="day">Día:</label>
            <select id="day" v-model="selectedDay" class="filter-select" :disabled="!selectedMonth">
              <option value="">Todos</option>
              <option v-for="day in availableDays" :key="`day-${day}`" :value="day">{{ day }}</option>
            </select>
            <small v-if="!selectedMonth" class="hint-text">Selecciona un mes primero</small>
          </div>
          <div class="filter-item">
            <label for="month">Mes:</label>
            <select id="month" v-model="selectedMonth" class="filter-select">
              <option value="">Todos</option>
              <option v-for="(month, index) in months" :key="`month-${index}`" :value="index + 1">{{ month }}</option>
            </select>
          </div>
          <div class="filter-item">
            <label for="year">Año:</label>
            <select id="year" v-model="selectedYear" class="filter-select">
              <option v-for="year in years" :key="`year-${year}`" :value="year">{{ year }}</option>
            </select>
          </div>
          <div class="filter-item">
            <button @click="resetFilters" class="reset-button">
              Restablecer Filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Gráfico mejorado -->
      <div class="chart-wrapper">
        <div class="chart-container">
          <BarChart ref="chart" v-if="hasData" :chartData="chartData" :chartOptions="chartOptions" />
          <div v-else class="no-data-container">
            <div class="no-data-message">
              <i class="no-data-icon">📊</i>
              <p>No hay datos disponibles para el período seleccionado.</p>
              <button @click="resetFilters" class="reset-button">Mostrar todos los datos</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Component -->
    <Dashboard />
    <month-graf />

  </div>
</template>

<script>
import BarChart from '../components/charts/BarChart.vue';
import Dashboard from '../components/Graficos/Dashboard.vue';
import TicketApiService from '../../public/services/ticket-api.service';
import WebSocketService from '../../shared/websocket.service';
import dayjs from 'dayjs';
import MonthGraf from "../components/Graficos/monthGraf.vue";

export default {
  name: "Grafico",
  components: {
    MonthGraf,
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
            data: [],
            borderRadius: 6
          },
          {
            label: 'Tickets Cancelados',
            backgroundColor: '#e74c3c',
            data: [],
            borderRadius: 6
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 12,
                family: "'Poppins', sans-serif"
              },
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14,
              family: "'Poppins', sans-serif"
            },
            bodyFont: {
              size: 12,
              family: "'Poppins', sans-serif"
            },
            padding: 12,
            cornerRadius: 6
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                family: "'Poppins', sans-serif"
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              font: {
                family: "'Poppins', sans-serif"
              }
            },
            grid: {
              display: false
            }
          }
        },
        animation: {
          duration: 800,
          easing: 'easeOutQuart'
        }
      },
      selectedDay: dayjs().date(),
      selectedMonth: dayjs().month() + 1,
      selectedYear: dayjs().year(),
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
    selectedDay() {
      this.updateChartData();
    },
    selectedMonth() {
      this.updateChartData();
    },
    selectedYear() {
      this.updateChartData();
    }
  },
  computed: {
    availableDays() {
      if (!this.selectedMonth) return [];

      const month = parseInt(this.selectedMonth);
      const year = this.selectedYear ? parseInt(this.selectedYear) : new Date().getFullYear();

      // Determinar el número de días en el mes seleccionado
      // El día 0 del siguiente mes es el último día del mes actual
      const daysInMonth = new Date(year, month, 0).getDate();

      // Crear un array con los días disponibles
      return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    },
    filteredTickets() {
      return this.tickets.filter(ticket => {
        const ticketDate = dayjs(ticket.updatedAt);
        const matchesDay = !this.selectedDay || ticketDate.date() === parseInt(this.selectedDay);
        const matchesMonth = !this.selectedMonth || ticketDate.month() + 1 === parseInt(this.selectedMonth);
        const matchesYear = !this.selectedYear || ticketDate.year() === parseInt(this.selectedYear);
        return matchesDay && matchesMonth && matchesYear;
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
        this.areas = response.data.filter(area => area.nombre !== 'General');
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
        console.log('Tickets obtenidos:', filteredTickets.length);
        const labels = this.areas.map(area => area.nombre);
        const resolvedData = this.areas.map(area =>
            filteredTickets.filter(ticket => ticket.areaNombre === area.nombre && ticket.estado === 'Resuelto').length
        );
        const canceledData = this.areas.map(area =>
            filteredTickets.filter(ticket => ticket.areaNombre === area.nombre && ticket.estado === 'Cancelado').length
        );

        // Update chartData to trigger reactivity
        this.chartData = {
          labels: labels,
          datasets: [
            {
              label: 'Tickets Resueltos',
              backgroundColor: '#2ecc71',
              data: resolvedData,
              borderRadius: 6
            },
            {
              label: 'Tickets Cancelados',
              backgroundColor: '#e74c3c',
              data: canceledData,
              borderRadius: 6
            }
          ]
        };
      } else {
        console.log('No se obtuvieron tickets para el filtro aplicado.');
        this.chartData = {
          labels: [],
          datasets: [
            {
              label: 'Tickets Resueltos',
              backgroundColor: '#2ecc71',
              data: [],
              borderRadius: 6
            },
            {
              label: 'Tickets Cancelados',
              backgroundColor: '#e74c3c',
              data: [],
              borderRadius: 6
            }
          ]
        };
      }
    },
    resetFilters() {
      const currentDate = dayjs();
      this.selectedDay = currentDate.date();
      this.selectedMonth = currentDate.month() + 1;
      this.selectedYear = currentDate.year();
      this.updateChartData();
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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.grafico-container {
  padding: 2rem;
  background-color: #f5f7fa;
  border-radius: 1.5rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  font-family: 'Poppins', sans-serif;
}

.main-title {
  font-size: 2.2rem;
  color: #1a237e;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 400;
  letter-spacing: -0.5px;
}

.panel-container {
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  overflow: hidden;
}

.filter-panel {
  background-color: #f8f9ff;
  border-radius: 0.8rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e0e6f3;

}

.filter-title {
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.filter-title::before {
  content: '📊';
  margin-right: 0.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-item label {
  font-size: 0.9rem;
  color: #555;
  font-weight: 500;
}

.filter-select {
  padding: 0.65rem;
  border: 1px solid #e0e6f3;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  background-color: white;
  transition: all 0.2s ease;
  font-family: 'Poppins', sans-serif;
}

.filter-select:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.15);
}

.filter-select:disabled {
  background-color: #f0f2f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.hint-text {
  font-size: 0.8rem;
  color: #6c7ae0;
  margin-top: 0.25rem;
}

.reset-button {
  background-color: #6c7ae0;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.65rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  margin-top: auto;
}

.reset-button:hover {
  background-color: #5a68c0;
  box-shadow: 0 4px 10px rgba(108, 122, 224, 0.2);
}

.chart-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-container {
  height: 300px;
  background-color: #ffffff;
  padding: 1rem;
  border-radius: 0.8rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid #f0f3fa;
}

.no-data-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.no-data-message {
  text-align: center;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-data-icon {
  font-size: 3rem;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .grafico-container {
    padding: 1.5rem;
  }

  .main-title {
    font-size: 1.8rem;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 300px;
  }
}
</style>