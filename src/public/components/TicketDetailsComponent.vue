<template>
  <div class="ticket-details" v-if="selectedTicket">
    <h3>Detalles del Ticket</h3>
    <p><strong>Número de Ticket:</strong> {{ selectedTicket.numeroTicket }}</p>
    <p><strong>Área:</strong> {{ selectedTicket.areaNombre }}</p>
    <p><strong>Fecha:</strong> {{ selectedTicket.fecha }}</p>
    <p><strong>Nombre:</strong> {{ selectedTicket.nombres }} {{ selectedTicket.apePaterno }} {{ selectedTicket.apeMaterno }}</p>
    <p><strong>Estado:</strong> {{ selectedTicket.estado }}</p>
    <div v-if="selectedTicket.estado === 'Resuelto' || selectedTicket.estado === 'Cancelado'">
      <h4>Observaciones:</h4>
      <ul>
        <li v-for="comment in comments" :key="comment.id">{{ comment.coment }}</li>
      </ul>
    </div>
    <div class="actions" v-if="selectedTicket.estado !== 'Resuelto' && selectedTicket.estado !== 'Cancelado'">
      <pv-button @click="showObservationModal('resolve')">Resolver</pv-button>
      <pv-button @click="showObservationModal('cancel')">Cancelar</pv-button>
      <pv-button v-if="selectedTicket.estado === 'Abierto'" @click="$emit('reopen-ticket')">Reabrir</pv-button>
      <div class="transfer">
        <pv-button @click="toggleTransferDropdown">Transferir</pv-button>
        <div v-if="showTransferDropdown" class="dropdown">
          <select v-model="selectedArea">
            <option v-for="area in areas" :key="area.id" :value="area.nombre">{{ area.nombre }}</option>
          </select>
          <pv-button @click="transferTicket">Confirmar Transferencia</pv-button>
        </div>
      </div>
    </div>
    <div v-if="showObservationModalVisible" class="modal">
      <div class="modal-content">
        <h3>{{ actionType === 'resolve' ? 'Resolver Ticket' : 'Cancelar Ticket' }}</h3>
        <textarea v-model="observation" placeholder="Ingrese una observación"></textarea>
        <pv-button @click="submitObservation">Aceptar</pv-button>
        <pv-button @click="closeObservationModal">Cancelar</pv-button>
      </div>
    </div>
    <div v-if="showTransferSuccessModal" class="modal">
      <div class="modal-content">
        <h3>Transferido exitosamente</h3>
        <pv-button @click="closeTransferSuccessModal">Aceptar</pv-button>
      </div>
    </div>
  </div>
</template>

<script>
import CommentApiService from '../services/comment-api.service';
import TicketApiService from '../services/ticket-api.service';
import WebSocketService from '../../shared/WebSocket.Service';

export default {
  name: "TicketDetailsComponent",
  props: {
    selectedTicket: Object,
  },
  data() {
    return {
      localSelectedTicket: { ...this.selectedTicket },
      showObservationModalVisible: false,
      showTransferDropdown: false,
      showTransferSuccessModal: false,
      observation: '',
      actionType: '',
      comments: [],
      areas: [],
      selectedArea: '',
      webSocketService: null,
      tickets: []
    };
  },
  watch: {
    selectedTicket: {
      immediate: true,
      handler(newTicket) {
        if (newTicket) {
          this.localSelectedTicket = { ...newTicket };
          this.fetchComments(newTicket.id);
        }
      }
    }
  },
  mounted() {
    this.setupWebSocketConnection();
    this.fetchAreas();
  },
  beforeDestroy() {
    if (this.webSocketService) {
      this.webSocketService.close();
    }
  },
  methods: {
    async fetchComments(ticketId) {
      try {
        const response = await CommentApiService.getCommentsByTicketId(ticketId);
        this.comments = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Error fetching comments:', error);
        this.comments = [];
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
    setupWebSocketConnection() {
      this.webSocketService = new WebSocketService();
      this.webSocketService.connect();
    },
    toggleTransferDropdown() {
      this.showTransferDropdown = !this.showTransferDropdown;
    },
    async transferTicket() {
      if (this.localSelectedTicket && this.selectedArea) {
        try {
          const previousArea = this.localSelectedTicket.areaNombre;

          // Update the ticket's area
          await TicketApiService.updateArea(this.localSelectedTicket.id, this.selectedArea);
          console.log('Area updated successfully');

          // Update the ticket's status to "En espera"
          await TicketApiService.updateStatus(this.localSelectedTicket.id, "En espera");
          console.log('Status updated successfully');

          // Fetch the updated ticket data
          const updatedTicketResponse = await TicketApiService.getById(this.localSelectedTicket.id);
          const updatedTicket = updatedTicketResponse.data;

          // Update the local ticket in the frontend
          this.localSelectedTicket = updatedTicket;

          this.showTransferSuccessModal = true;
          this.showTransferDropdown = false;

          // Send the updated ticket information via WebSocket
          const message = JSON.stringify({
            entityName: "Ticket",
            action: "Updated",
            entity: this.localSelectedTicket
          });
          this.webSocketService.sendMessage(message);

          // Notify parent component about the updated ticket
          this.$emit('ticket-updated', this.localSelectedTicket);

        } catch (error) {
          console.error('Error transferring ticket:', error);
          if (error.response && error.response.data) {
            console.error('Error details:', error.response.data);
          }
        }
      }
    },
    closeTransferSuccessModal() {
      this.showTransferSuccessModal = false;
      this.$emit('ticket-updated', this.selectedTicket);
    },
    showObservationModal(actionType) {
      this.actionType = actionType;
      this.showObservationModalVisible = true;
    },
    closeObservationModal() {
      this.showObservationModalVisible = false;
      this.observation = '';
      this.actionType = '';
    },
    async submitObservation() {
      if (this.selectedTicket) {
        const username = localStorage.getItem('userUserName');
        const userId = localStorage.getItem('userId');
        if (!username || !userId) {
          console.error('Username or userId is not found in localStorage');
          return;
        }
        const comment = {
          ticketId: this.selectedTicket.id,
          coment: this.observation,
          numeroTicket: this.selectedTicket.numeroTicket,
          estado: this.actionType === 'resolve' ? 'Resuelto' : 'Cancelado',
          userId: parseInt(userId, 10),
          username: username
        };
        console.log('Submitting comment:', comment); // Log the request payload
        try {
          // Submit the comment
          const response = await CommentApiService.createComment(comment);
          this.comments.push(response.data);

          // Update the ticket status
          const newStatus = this.actionType === 'resolve' ? 'Resuelto' : 'Cancelado';
          await TicketApiService.updateStatus(this.selectedTicket.id, newStatus);

          // Update the selected ticket's status
          this.selectedTicket.estado = newStatus;

          // Send the updated ticket information via WebSocket
          const message = JSON.stringify({
            entityName: "Ticket",
            action: "Updated",
            entity: this.selectedTicket
          });
          console.log('Sending WebSocket message:', message); // Log the WebSocket message
          this.webSocketService.sendMessage(message);

          this.closeObservationModal();
        } catch (error) {
          console.error('Error submitting observation:', error);
        }
      }
    }
  }
};
</script>

<style scoped>
.ticket-details {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.ticket-details h3 {
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
}

.ticket-details p {
  color: #475569;
  margin: 0.75rem 0;
  font-size: 1rem;
}

.ticket-details strong {
  color: #1e293b;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.transfer {
  position: relative;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 0.5rem;
  z-index: 10;
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  padding: 2.5rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
}

.modal-content textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.modal-content button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
  margin: 0 0.5rem;
}

.modal-content button:first-of-type {
  background-color: #3b82f6;
  color: white;
}
</style>