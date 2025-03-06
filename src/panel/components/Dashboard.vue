<template>
  <div class="content">
    <div class="row">
      <div class="col-12">
        <div class="chart-card">
          <card type="chart">
            <div class="card-header">
              <h5 class="card-category">Tendencia Mensual de Tickets Resueltos y Cancelados</h5>
              <div class="filters">
                <div class="filter" v-if="userRole !== 'Recepcionista'">
                  <label for="area">Área:</label>
                  <select id="area" v-model="selectedArea" class="select-filter">
                    <option value="">Todas</option>
                    <option v-for="area in areas" :key="area.id" :value="area.nombre">{{ area.nombre }}</option>
                  </select>
                </div>
                <div class="filter">
                  <label for="year">Año:</label>
                  <select id="year" v-model="selectedYear" class="select-filter">
                    <option value="">Todos</option>
                    <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                  </select>
                </div>
              </div>
            </div>
            <line-chart
                class="chart-area"
                ref="bigChart"
                chart-id="big-line-chart"
                :chart-data="bigLineChart.chartData"
                :chart-options="bigLineChart.extraOptions"
            >
            </line-chart>
          </card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Card from "../components/Charts/Card.vue";
import LineChart from "../components/LineChart.vue";
import * as chartConfigs from "../components/Charts/config";
import config from "../../config";
import TicketApiService from '../../public/services/ticket-api.service';
import WebSocketService from '../../shared/websocket.service';

export default {
  components: {
    Card,
    LineChart,
  },
  data() {
    return {
      bigLineChart: {
        allData: [],
        activeIndex: 0,
        chartData: {datasets: [{}]},
        extraOptions: {
          ...chartConfigs.purpleChartOptions,
          elements: {
            line: {
              tension: 0.4
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20,
              }
            }
          },
          maintainAspectRatio: false,
        },
        gradientColors: config.colors.primaryGradient,
        gradientStops: [1, 0.4, 0],
        categories: [],
      },
      areas: [],
      selectedArea: '',
      selectedYear: '',
      years: [],
      tickets: [],
      socket: null,
      userRole: localStorage.getItem('userRole'),
      userArea: localStorage.getItem('userArea'),
    };
  },
  methods: {
    async fetchTickets() {
      try {
        const response = await TicketApiService.getAll();
        this.tickets = response.data;
        this.generateYears();
        this.updateChartData();
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
        const year = new Date(ticket.updatedAt).getFullYear();
        yearsSet.add(year);
      });
      this.years = Array.from(yearsSet).sort((a, b) => b - a);
      // Set current year as default if available
      const currentYear = new Date().getFullYear();
      if (this.years.includes(currentYear)) {
        this.selectedYear = currentYear;
      } else if (this.years.length > 0) {
        this.selectedYear = this.years[0];
      }
    },
    updateChartData() {
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const resolvedData = Array(12).fill(0);
      const canceledData = Array(12).fill(0);

      this.tickets.forEach(ticket => {
        const updatedAt = new Date(ticket.updatedAt);
        if (isNaN(updatedAt.getTime())) return; // Skip invalid dates
        if (this.userRole === 'Recepcionista' && ticket.areaNombre !== this.userArea) return;
        if (this.selectedArea && ticket.areaNombre !== this.selectedArea) return;
        if (this.selectedYear && updatedAt.getFullYear() !== parseInt(this.selectedYear)) return;
        const month = updatedAt.getMonth();
        if (ticket.estado === 'Resuelto') {
          resolvedData[month]++;
        } else if (ticket.estado === 'Cancelado') {
          canceledData[month]++;
        }
      });

      this.bigLineChart.allData = [resolvedData, canceledData];
      this.initBigChart(0);
    },
    initBigChart(index) {
      const chartData = {
        datasets: [
          {
            label: 'Tickets Resueltos',
            fill: true,
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            borderWidth: 2,
            pointBackgroundColor: '#2ecc71',
            pointBorderColor: "rgba(255,255,255,0)",
            pointHoverBackgroundColor: '#2ecc71',
            pointBorderWidth: 20,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 15,
            pointRadius: 4,
            data: this.bigLineChart.allData[0],
          },
          {
            label: 'Tickets Cancelados',
            fill: true,
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.2)',
            borderWidth: 2,
            pointBackgroundColor: '#e74c3c',
            pointBorderColor: "rgba(255,255,255,0)",
            pointHoverBackgroundColor: '#e74c3c',
            pointBorderWidth: 20,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 15,
            pointRadius: 4,
            data: this.bigLineChart.allData[1],
          }
        ],
        labels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
      };
      if (this.$refs.bigChart) {
        this.$refs.bigChart.updateGradients(chartData);
      }

      this.bigLineChart.chartData = chartData;
      this.bigLineChart.activeIndex = index;
    },
    setupWebSocket() {
      const webSocketService = new WebSocketService();
      webSocketService.connect();
      this.socket = webSocketService.socket;

      this.socket.onopen = () => {
        console.log('WebSocket connection established');
      };

      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.entityName === 'Ticket' && message.action === 'Updated') {
          const updatedTicket = message.entity;
          this.updateSingleTicket(updatedTicket);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
      };
    },
    updateSingleTicket(ticket) {
      if (this.userRole === 'Recepcionista' && ticket.areaNombre !== this.userArea) return;
      if (this.selectedArea && ticket.areaNombre !== this.selectedArea) return;
      if (this.selectedYear && new Date(ticket.updatedAt).getFullYear() !== parseInt(this.selectedYear)) return;
      const month = new Date(ticket.updatedAt).getMonth();
      if (ticket.estado === 'Resuelto') {
        this.bigLineChart.allData[0][month]++;
      } else if (ticket.estado === 'Cancelado') {
        this.bigLineChart.allData[1][month]++;
      }
      this.initBigChart(this.bigLineChart.activeIndex);
    },
  },
  async mounted() {
    await this.fetchTickets();
    await this.fetchAreas();
    this.setupWebSocket();
  },
  watch: {
    selectedArea() {
      this.updateChartData();
    },
    selectedYear() {
      this.updateChartData();
    }
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close();
    }
  },
};
</script>

<style scoped>
.content {
  padding: 20px;
}

.row {
  margin-bottom: 20px;
}

.chart-area {
  height: 350px;
  margin-top: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.card-category {
  font-size: 1.2rem;
  color: #555;
  margin: 0;
  font-weight: 600;
}

.filters {
  display: flex;
  gap: 15px;
  align-items: center;
}

.filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  margin: 0;
}

.select-filter {
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  font-size: 0.9rem;
  min-width: 120px;
  cursor: pointer;
  color: #444;
  transition: all 0.3s ease;
}

.select-filter:hover, .select-filter:focus {
  border-color: #aaa;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.chart-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .filters {
    width: 100%;
    flex-wrap: wrap;
  }

  .filter {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}
</style>