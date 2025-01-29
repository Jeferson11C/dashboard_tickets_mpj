<template>
  <div class="sidebar">
    <h1>MPJ Dashboard</h1>
    <p>Welcome, Agent</p>
    <button @click="goToTicketPanel">ticket</button>
    <div>
      <button @click="toggleReportesDropdown">Reportes</button>
      <div v-if="showReportesDropdown" class="dropdown">
        <button @click="goToGeneralReport">General</button>
        <button @click="goToGraficosReport">Graficos</button>
      </div>
    </div>
    <button @click="goToAdminPanel">Usuarios</button>
  </div>
</template>

<script>
export default {
  name: "sidebar",
  data() {
    return {
      showReportesDropdown: false
    };
  },
  methods: {
    toggleReportesDropdown() {
      this.showReportesDropdown = !this.showReportesDropdown;
    },
    goToTicketPanel() {
      this.$router.push({ path: '/home' });
    },
    goToGeneralReport() {
      this.$router.push({ path: '/reporte' });
    },
    goToGraficosReport() {
      this.$router.push({ path: '/grafico' });
    },
    goToAdminPanel() {
      this.$router.push({ path: '/administrador' });
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #2c3e50;
  padding: 1em;
  border-right: 1px solid #ddd;
  height: auto;
  color: #fff;
}

button {
  display: block;
  width: 100%;
  margin: 1em 0;
  padding: 0.5em;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #2980b9;
}

.dropdown {
  margin-left: 1em;
}

.dropdown button {
  width: calc(100% - 1em);
  margin: 0.5em 0;
}
</style>