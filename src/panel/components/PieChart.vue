<template>
  <div class="pie-chart-container">
    <pie-chart :chart-data="chartData" :options="chartOptions"></pie-chart>
  </div>
</template>

<script>
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

export default {
  name: 'PieChart',
  components: {
    PieChart: Pie
  },
  props: {
    chartData: {
      type: Object,
      required: true
    },
    chartOptions: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.pie-chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>