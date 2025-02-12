<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <img src="https://apps.munijaen.gob.pe/intranet/images/logo.png?n=Vs.024" alt="Logo Municipalidad" class="logo" />
    </div>
    <nav class="sidebar-nav">
      <button class="nav-button" @click="goToTicketPanel">
        <span>🎫</span> Ticket
      </button>
      <div class="nav-section">
        <button class="nav-button" @click="toggleReportesDropdown">
          <span>📊</span> Reportes
        </button>
        <div v-if="showReportesDropdown" class="dropdown">
          <button class="dropdown-button" @click="goToGeneralReport">
            <span>📑</span> General
          </button>
          <button class="dropdown-button" @click="goToGraficosReport">
            <span>📉</span> Gráficos
          </button>
        </div>
      </div>

      <button class="nav-button" @click="goToHistorial">
        <span>📑</span> Historial
      </button>

      <button v-if="isAdmin" class="nav-button" @click="goToAdminPanel">
        <span>👤</span> Usuarios
      </button>
    </nav>
  </div>
</template>

<script>
export default {
  name: "Sidebar",
  data() {
    return {
      showReportesDropdown: false,
      isAdmin: false,
    };
  },
  created() {
    this.checkUserRole();
  },
  methods: {
    toggleReportesDropdown() {
      this.showReportesDropdown = !this.showReportesDropdown;
    },
    goToTicketPanel() {
      this.$router.push({ path: "/home" });
    },
    goToGeneralReport() {
      this.$router.push({ path: "/reporte" });
    },
    goToGraficosReport() {
      this.$router.push({ path: "/grafico" });
    },
    goToHistorial() {
      this.$router.push({ path: "/historial" });
    },
    goToAdminPanel() {
      this.$router.push({ path: "/administrador" });
    },
    checkUserRole() {
      const userRole = localStorage.getItem('userRole');
      this.isAdmin = userRole === 'Administrador';
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #2c3e50;
  padding: 1.5em;
  height: auto;
  color: #fff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  text-align: center;
  margin-bottom: 2em;
}

.sidebar-header .logo {
  max-width: 100px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.nav-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75em;
  background-color: #ffffff;
  color: black;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.nav-button:hover {
  background-color: #2980b9;
}

.nav-button span {
  margin-right: 0.5em;
  font-size: 1.2em;
}

.dropdown {
  margin-top: 0.5em;
  margin-left: 1.5em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.dropdown-button {
  width: 100%;
  padding: 0.5em;
  background-color: #ffffff;
  color: black;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dropdown-button:hover {
  background-color: #3498db;
}
</style>