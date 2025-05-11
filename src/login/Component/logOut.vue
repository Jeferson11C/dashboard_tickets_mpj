<template>
  <div class="logout-container">
    <button class="logout-button" @click="logout">
      <i class="pi pi-sign-out"></i> Cerrar sesión
    </button>
    <div v-if="isModalVisible" class="modal">
      <div class="modal-content">
        <div class="modal-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <h2>{{ modalMessage }}</h2>
        <button class="modal-button" @click="logout">Salir</button>
      </div>
    </div>
  </div>
</template>

<script>
import { logout } from '../../shared/interceptor.js';
import axios from 'axios';
import WebSocketService from '../../shared/websocket.service';
import inactivityService from '../services/inactivityService.js';

export default {
  name: "logOut",
  data() {
    return {
      isModalVisible: false,
      modalMessage: '',
      cancelTokenSource: axios.CancelToken.source(),
      webSocketService: new WebSocketService()
    };
  },
  mounted() {
    this.webSocketService.connect();
    this.webSocketService.onMessage(this.handleWebSocketMessage);
    this.checkUserStatus();
    inactivityService.on('timeout', this.showSessionExpiredModal);
  },
  beforeDestroy() {
    this.webSocketService.disconnect();
    inactivityService.stopTimer();
  },
  methods: {
    async logout() {
      try {
        await logout(); // Call the logout function from interceptor.js
        this.redirectToLogin();
      } catch (error) {
        console.error('Error during logout:', error);
      }
    },
    redirectToLogin() {
      this.isModalVisible = false;
      this.$router.push({name: 'login'});
    },
    handleWebSocketMessage(message) {
      const data = JSON.parse(message.data);
      const currentUserId = localStorage.getItem('userId'); // Assuming user ID is stored in local storage
      if (data.event === 'userStatusUpdated' && data.data.id === parseInt(currentUserId) && data.data.status === 'Inactivo') {
        this.modalMessage = 'Usuario esta inactivo o ya no existe';
        this.isModalVisible = true;
        localStorage.setItem('userStatus', 'Inactivo');
        localStorage.setItem('inactiveUserId', currentUserId);
      }
    },
    checkUserStatus() {
      const userStatus = localStorage.getItem('userStatus');
      const currentUserId = localStorage.getItem('userId');
      const inactiveUserId = localStorage.getItem('inactiveUserId');
      if (userStatus === 'Inactivo' && currentUserId === inactiveUserId) {
        this.modalMessage = 'Usuario esta inactivo o ya no existe';
        this.isModalVisible = true;
      }
    },
    showSessionExpiredModal() {
      this.modalMessage = 'Su sesión ha expirado por inactividad.';
      this.isModalVisible = true;
    }
  }
}
</script>

<style scoped>
.logout-container {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #e74c3c;
  color: #ffffff;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logout-button:hover {
  background-color: #c0392b;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.logout-button:active {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 2.5rem;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-icon {
  font-size: 3rem;
  color: #e74c3c;
  margin-bottom: 1rem;
}

.modal-content h2 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.25rem;
  line-height: 1.4;
}

.modal-button {
  padding: 0.75rem 2rem;
  background-color: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modal-button:hover {
  background-color: #c0392b;
}
</style>