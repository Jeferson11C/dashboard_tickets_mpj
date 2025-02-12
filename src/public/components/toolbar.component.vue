<template>
  <div class="toolbar">
    <div class="title">Municipalidad de Jaen</div>
    <div v-if="user" class="user-info">
      <span>
        <span>👤</span> {{ user.nombreCompleto }}
        <span>🏢</span> {{ user.area }}
        <span>🪪</span> {{ user.rol }}
      </span>
      <button class="logout-button" @click="logout">
        <i class="pi pi-sign-out"></i> Cerrar sesión
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Toolbar",
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  methods: {
    logout() {
      console.clear(); // Clear the console
      console.log('Logout successful'); // Display logout message
      localStorage.removeItem('token'); // Remove the token
      localStorage.removeItem('userId'); // Remove the user id
      localStorage.removeItem('userRole'); // Remove the user role
      localStorage.removeItem('userArea'); // Remove the user area
      localStorage.removeItem('userFullName'); // Remove the user full name
      this.$emit('user-logged-out');
      this.$router.push({ name: 'login' }); // Redirect to login page
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em 2em;
  background-color: #2c3e50;
  border-bottom: 1px solid #34495e;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.5em;
  font-weight: bold;
  letter-spacing: 1px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1em;
  font-size: 0.9em;
}

.user-info span {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.logout-button {
  background-color: #ffffff;
  color: #666666;
  border: none;
  padding: 0.5em 1em;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.logout-button:hover {
  background-color: #ffffff;
}

/* Responsividad */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 1em;
  }

  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5em;
    margin-top: 0.5em;
  }

  .logout-button {
    width: 100%;
    justify-content: center;
  }
}
</style>