<template>
  <div>
    <button class="logout-button" @click="logout">
      <i class="pi pi-sign-out"></i> Cerrar sesión
    </button>
    <div v-if="isModalVisible" class="modal">
      <div class="modal-content">
        <h2>{{ modalMessage }}</h2>
        <button @click="logout">Salir</button>
      </div>
    </div>
  </div>
</template>

<script>
import { logout } from '../../shared/interceptor.js';
import axios from 'axios';
import WebSocketService from '../../shared/websocket.service';

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
  },
  beforeDestroy() {
    this.webSocketService.disconnect();
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
    }
  }
}
</script>

<style scoped>
.logout-button {
  margin-top: auto;
  background-color: #e74c3c;
  color: #ffffff;
  padding: 0.75em;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: #c0392b;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: red;
}

.modal-content {
  background: #fff;
  padding: 2em;
  border-radius: 8px;
  text-align: center;
}

.modal-content h2 {
  margin-bottom: 1em;
}

.modal-content button {
  padding: 0.75em 1.5em;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.modal-content button:hover {
  background-color: #2980b9;
}
</style>