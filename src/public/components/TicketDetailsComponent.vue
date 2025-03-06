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

          // Emit an event to notify that the ticket has been transferred
          this.$emit('ticket-transferred', this.localSelectedTicket);

        } catch (error) {
          console.error('Error transferring ticket:', error);
          if (error.response && error.response.data) {
            console.error('Error details:', error.response.data);
          }
        }
      }
    },
    confirmTransfer() {
      this.showTransferSuccessModal = false;
      this.$emit('confirm-transfer');
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
        const nombreCompleto = localStorage.getItem('userFullName');
        const userId = localStorage.getItem('userId');
        if (!nombreCompleto || !userId) {
          console.error('Nombre completo or userId is not found in localStorage');
          return;
        }
        const comment = {
          ticketId: this.selectedTicket.id,
          coment: this.observation,
          numeroTicket: this.selectedTicket.numeroTicket,
          estado: this.actionType === 'resolve' ? 'Resuelto' : 'Cancelado',
          userId: parseInt(userId, 10),
          nombreCompleto: nombreCompleto
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
    },
    formatDate(dateString) {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleString('es-ES', options);
    }
  }
};
</script>

<template>
  <div class="ticket-details" v-if="selectedTicket">

    <div class="ticket-content">
      <div class="ticket-info">
        <h3>Detalles del Ticket</h3>
        <p><strong>Número de Ticket:</strong> {{ selectedTicket.numeroTicket }}</p>
        <p><strong>Área:</strong> {{ selectedTicket.areaNombre }}</p>
        <p><strong>Documento:</strong> {{ selectedTicket.documento }}</p>
        <p><strong>Nombre:</strong> {{ selectedTicket.nombres }} {{ selectedTicket.apePaterno }} {{ selectedTicket.apeMaterno }}</p>
        <p><strong>Fecha:</strong> {{ formatDate(selectedTicket.fecha) }}</p>
        <p v-if="selectedTicket.estado === 'Resuelto' || selectedTicket.estado === 'Cancelado'">
          <strong>Atendido:</strong> {{ formatDate(selectedTicket.updatedAt) }}
        </p>
        <p><strong>Estado:</strong> <span class="ticket-status" :class="'status-' + selectedTicket.estado.toLowerCase()">{{ selectedTicket.estado }}</span></p>

        <div v-if="selectedTicket.estado === 'Resuelto' || selectedTicket.estado === 'Cancelado'">
          <h4>Observaciones:</h4>
          <ul class="comments-list">
            <li v-for="comment in comments" :key="comment.id">{{ comment.coment }}</li>
          </ul>
        </div>
      </div>

      <div class="actions-column" v-if="selectedTicket.estado !== 'Resuelto' && selectedTicket.estado !== 'Cancelado'">
        <button class="action-btn reopen-btn" v-if="selectedTicket.estado === 'Abierto'" @click="$emit('reopen-ticket')">Reabrir</button>
        <button class="action-btn resolve-btn" @click="showObservationModal('resolve')">Resolver</button>
        <button class="action-btn cancel-btn" @click="showObservationModal('cancel')">Cancelar</button>
        <div class="transfer-container">
          <button class="action-btn transfer-btn" @click="toggleTransferDropdown">Transferir</button>
          <div v-if="showTransferDropdown" class="transfer-dropdown">
            <select v-model="selectedArea" class="area-select">
              <option v-for="area in areas" :key="area.id" :value="area.nombre">{{ area.nombre }}</option>
            </select>
            <button class="action-btn confirm-btn" @click="transferTicket">Confirmar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de observación simplificado -->
    <div v-if="showObservationModalVisible" class="modal">
      <div class="modal-content">
        <h3>{{ actionType === 'resolve' ? 'Resolver Ticket' : 'Cancelar Ticket' }}</h3>
        <textarea v-model="observation" placeholder="Ingrese una observación"></textarea>
        <div class="modal-buttons">
          <button class="action-btn confirm-btn" @click="submitObservation">Aceptar</button>
          <button class="action-btn cancel-btn" @click="closeObservationModal">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal de transferencia exitosa simplificado -->
    <div v-if="showTransferSuccessModal" class="modal">
      <div class="modal-content">
        <h3>Transferido exitosamente</h3>
        <pv-button class="action-btn confirm-btn" @click="confirmTransfer">Aceptar</pv-button>
      </div>
    </div>
  </div>
  <div v-else class="no-ticket-selected">
    <div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 5v2"></path><path d="M15 11v2"></path><path d="M15 17v2"></path>
        <path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"></path>
      </svg>
      <h4>Seleccione un ticket para atender</h4>
      <p>Los detalles del ticktet y opciones de atencion apareceran aquí </p>
    </div>
  </div>
</template>

<style scoped>

.no-ticket-selected {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.empty-state {
  width: 100vh;
  height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2.5rem;
  background-color: #f8fafc;
  border: 3px dashed #1457ff;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.empty-state svg {
  margin-bottom: 1.5rem;
  color: #94a3b8;
}

.empty-state h4 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: #334155;
  font-weight: 600;
  font-size: 1.25rem;
}

.empty-state p {
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  font-size: 0.9rem;
}


.ticket-details {
  background-color: white;
  border-radius: 10px;
  padding: 50px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin: 0 auto; /* Centrar horizontalmente */
  justify-content: center; /* Centrar contenido */
}

.ticket-content {
  display: flex;
}

.ticket-info {
  flex: 1;
}

.ticket-details h3 {
  color: #1e293b;
  margin: 0 0 16px 0;
  font-size: 24px;
}


.ticket-details p {
  color: #475569;
  margin: 8px 0;
  font-size: 20px;
}

.ticket-details strong {
  color: #1e293b;
}

.ticket-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
}

.status-abierto {
  background-color: #dbeafe;
  color: #1e40af;

}

.status-resuelto {
  background-color: #d1fae5;
  color: #065f46;
}

.status-cancelado {
  background-color: #fee2e2;
  color: #b91c1c;
}

.comments-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.comments-list li {
  padding: 8px;
  margin-bottom: 8px;
  background-color: #f8fafc;
  border-radius: 4px;
  font-size: 14px;
}

.actions-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 16px;
  width: 150px;
}

.action-btn {
  width: 100%;
  text-align: center;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 8px;
}

:deep(.resolve-btn) {
  background-color: #10b981;
  color: white;
}

:deep(.resolve-btn:hover) {
  background-color: #059669;
}

:deep(.cancel-btn) {
  background-color: #ef4444;
  color: white;
}

:deep(.cancel-btn:hover) {
  background-color: #dc2626;
}

:deep(.reopen-btn) {
  background-color: #3b82f6;
  color: white;
}

:deep(.reopen-btn:hover) {
  background-color: #2563eb;
}

:deep(.transfer-btn) {
  background-color: #f59e0b;
  color: white;
}

:deep(.transfer-btn:hover) {
  background-color: #d97706;
}

:deep(.confirm-btn) {
  background-color: #3b82f6;
  color: white;
}

.transfer-container {
  position: relative;
}

.transfer-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.area-select {
  width: 100%;
  padding: 6px;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
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
  z-index: 20;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 16px;
}

.modal-content textarea {
  width: 100%;
  height: 100px;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}


/* Media queries for responsive design */
@media (max-width: 768px) {
  .ticket-details {
    width: 90%;
    padding: 20px;
  }

  .ticket-details h3 {
    font-size: 20px;
  }

  .ticket-details h4 {
    font-size: 16px;
  }

  .ticket-details p {
    font-size: 14px;
  }

  .ticket-status {
    font-size: 14px;
  }

  .comments-list li {
    font-size: 12px;
  }

  .action-btn {
    font-size: 14px;
  }
}

</style>