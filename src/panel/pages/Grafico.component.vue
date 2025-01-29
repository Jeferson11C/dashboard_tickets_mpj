<template>
  <div>
    <h1>Reporte de Tickets Atendidos por Área</h1>
    <div style="height: 400px;">
      <BarChart :chartData="chartData" :chartOptions="chartOptions"/>
    </div>
  </div>
</template>

<script>
import BarChart from '../components/BarChart.vue'
import TicketApiService from '../../public/services/ticket-api.service'
import dayjs from 'dayjs'

export default {
  name: "Grafico",
  components: {
    BarChart
  },
  data() {
    return {
      tickets: [],
      areas: [],
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Tickets Atendidos Hoy',
            backgroundColor: '#3498db',
            data: []
          },
          {
            label: 'Tickets Atendidos Esta Semana',
            backgroundColor: '#2ecc71',
            data: []
          },
          {
            label: 'Tickets Atendidos Este Mes',
            backgroundColor: '#e74c3c',
            data: []
          },
          {
            label: 'Total de Tickets',
            backgroundColor: '#9b59b6',
            data: []
          },
          {
            label: 'Tickets Resueltos',
            backgroundColor: '#f39c12',
            data: []
          },
          {
            label: 'Tickets Cancelados',
            backgroundColor: '#e67e22',
            data: []
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false
      }
    };
  },
  async mounted() {
    await this.fetchTickets();
    await this.fetchAreas();
    this.updateChartData();
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
    countTicketsByArea(area, filterFn) {
      return this.tickets.filter(ticket => ticket.areaNombre === area && filterFn(ticket)).length;
    },
    updateChartData() {
      const today = dayjs().startOf('day');
      const startOfWeek = dayjs().startOf('week');
      const startOfMonth = dayjs().startOf('month');

      this.chartData.labels = this.areas.map(area => area.nombre);
      this.chartData.datasets[0].data = this.areas.map(area => this.countTicketsByArea(area.nombre, ticket => dayjs(ticket.fecha).isSame(today, 'day') && (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado')));
      this.chartData.datasets[1].data = this.areas.map(area => this.countTicketsByArea(area.nombre, ticket => dayjs(ticket.fecha).isSame(startOfWeek, 'week') && (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado')));
      this.chartData.datasets[2].data = this.areas.map(area => this.countTicketsByArea(area.nombre, ticket => dayjs(ticket.fecha).isSame(startOfMonth, 'month') && (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado')));
      this.chartData.datasets[3].data = this.areas.map(area => this.countTicketsByArea(area.nombre, () => true));
      this.chartData.datasets[4].data = this.areas.map(area => this.countTicketsByArea(area.nombre, ticket => ticket.estado === 'Resuelto'));
      this.chartData.datasets[5].data = this.areas.map(area => this.countTicketsByArea(area.nombre, ticket => ticket.estado === 'Cancelado'));
    }
  }
}
</script>