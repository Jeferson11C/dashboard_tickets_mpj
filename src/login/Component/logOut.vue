// LogoutComponent.vue
<template>
  <button class="logout-button" @click="logout">
    <i class="pi pi-sign-out"></i> Cerrar sesión
  </button>
</template>

<script>
import LoginApiService from '../services/login-api.service.js';

export default {
  name: "logOut",
  methods: {
    async logout() {
      try {
        await LoginApiService.signOut(); // Call the signOut method
        console.clear(); // Clear the console
        console.log('Logout successful'); // Display logout message
        localStorage.removeItem('token'); // Remove the token
        localStorage.removeItem('userId'); // Remove the user id
        localStorage.removeItem('userRole'); // Remove the user role
        localStorage.removeItem('userArea'); // Remove the user area
        localStorage.removeItem('userFullName'); // Remove the user full name
        this.$emit('user-logged-out');
        this.$router.push({ name: 'login' }); // Redirect to login page
        setTimeout(() => {
          history.replaceState(null, null, '/login'); // Clear history
        }, 0);
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
  }
}
</script>

<style scoped>
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
</style>