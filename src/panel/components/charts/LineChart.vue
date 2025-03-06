<template>
  <div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import { Chart as ChartJS, Title,LineController, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler } from 'chart.js';
import { defineComponent, onMounted, ref, watch } from "vue";

ChartJS.register(Title, Tooltip, Legend,LineController, LineElement, CategoryScale, LinearScale, PointElement, Filler);

export default defineComponent({
  name: "LineChart",
  props: {
    chartId: {
      type: String,
      default: "line-chart",
    },
    chartData: {
      type: Object,
      required: true,
    },
    chartOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const canvas = ref(null);
    let chartInstance = null;

    onMounted(() => {
      if (canvas.value) {
        chartInstance = new ChartJS(canvas.value.getContext("2d"), {
          type: "line",
          data: props.chartData,
          options: props.chartOptions,
        });
      }
    });

    watch(
        () => props.chartData,
        (newData, oldData) => {
          if (chartInstance && JSON.stringify(newData) !== JSON.stringify(oldData)) {
            chartInstance.data = newData;
            chartInstance.update();
          }
        },
        { deep: true }
    );

    return { canvas };
  },
  methods: {
    updateGradients(chartData) {
      if (this.chartInstance) {
        chartInstance.data = chartData;
        chartInstance.update();
      }
    }
  }
});
</script>