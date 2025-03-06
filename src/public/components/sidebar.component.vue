<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <img src="../../assets/logo.png" alt="Logo Municipalidad" class="logo" />
    </div>
    <nav class="sidebar-nav">
      <button
          class="nav-button"
          :class="{ active: isActive('/home') }"
          @click="goToTicketPanel"
      >
        <i class="icon">🎫</i>
        <span class="button-text">Ticket</span>
      </button>

      <div class="nav-section">
        <button
            class="nav-button"
            :class="{ active: isReportActive() }"
            @click="toggleReportesDropdown"
        >
          <i class="icon">📊</i>
          <span class="button-text">Reportes</span>
          <i class="dropdown-icon">{{ showReportesDropdown ? '▲' : '▼' }}</i>
        </button>

        <transition name="slide">
          <div v-if="showReportesDropdown" class="dropdown">
            <button
                class="dropdown-button"
                :class="{ active: isActive('/reporte') }"
                @click="goToGeneralReport"
            >
              <i class="icon">📑</i>
              <span class="button-text">General</span>
            </button>
            <button
                class="dropdown-button"
                :class="{ active: isActive('/grafico') }"
                @click="goToGraficosReport"
            >
              <i class="icon">📉</i>
              <span class="button-text">Gráficos</span>
            </button>
          </div>
        </transition>
      </div>

      <button
          class="nav-button"
          :class="{ active: isActive('/historial') }"
          @click="goToHistorial"
      >
        <i class="icon">📑</i>
        <span class="button-text">Historial</span>
      </button>

      <button
          v-if="isAdmin"
          class="nav-button"
          :class="{ active: isActive('/administrador') }"
          @click="goToAdminPanel"
      >
        <i class="icon">👤</i>
        <span class="button-text">Usuarios</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <log-out @user-logged-out="handleLogout" class="logout-button"></log-out>
    </div>
  </div>
</template>

<script>
import logOut from "../../login/Component/logOut.vue";

export default {
  name: "Sidebar",
  components: { logOut },
  data() {
    return {
      showReportesDropdown: false,
      isAdmin: false,
    };
  },
  created() {
    this.checkUserRole();
    // Expande el menú de reportes si estamos en una página de reportes
    this.setInitialDropdownState();
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
    handleLogout() {
      this.$emit('user-logged-out');
    },
    isActive(route) {
      return this.$route.path === route;
    },
    isReportActive() {
      return this.$route.path === '/reporte' || this.$route.path === '/grafico';
    },
    setInitialDropdownState() {
      if (this.isReportActive()) {
        this.showReportesDropdown = true;
      }
    }
  },
};
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: linear-gradient(135deg, #34495e 0%, #3498db 100%);
  color: #ecf0f1;
  height: auto;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  text-align: center;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  max-width: 120px;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  flex-grow: 1;
}

.nav-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.8rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: #ecf0f1;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  text-align: left;
  font-size: 1rem;
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateX(3px);
}

.nav-button.active {
  background-color: #1457ff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.icon {
  margin-right: 0.8rem;
  font-size: 1.2rem;
  min-width: 24px;
  display: inline-flex;
  justify-content: center;
}

.dropdown-icon {
  margin-left: auto;
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.button-text {
  flex-grow: 1;
}

.dropdown {
  margin-top: 0.3rem;
  margin-left: 1.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  overflow: hidden;

}

.dropdown-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.7rem 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  color: #ecf0f1;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 1rem;
}

.dropdown-button:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.dropdown-button.active {
  background-color: #1457ff;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.logout-button {
  width: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 100px;
  }

  .nav-button, .dropdown-button {
    justify-content: center;
    padding: 0.8rem;
  }

  .button-text, .dropdown-icon {
    display: none;
  }

  .icon {
    margin-right: 0;
  }

  .logo {
    max-width: 50px; /* Adjust the logo size */
  }
}

@media (max-width: 576px) {
  .sidebar {
    width: 60px;
  }

  .button-text, .dropdown-icon {
    display: none;
  }

  .icon {
    margin-right: 0;
  }

  .nav-button, .dropdown-button {
    justify-content: center;
    padding: 0.8rem;
  }

  .dropdown {
    margin-left: 0;
  }

  .sidebar-header {
    padding: 1rem 0.5rem;
  }

  .logo {
    max-width: 40px;
  }
}
</style>