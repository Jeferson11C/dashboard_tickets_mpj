<template>
  <div v-if="area.nombre.toLowerCase() !== 'general'" class="area-dashboard">
    <div class="dashboard-header">
      <h2 class="area-title">{{ area.nombre }}</h2>
      <div class="total-tickets-pill">
        Total de tickets: <span>{{ countTicketsByArea(area.nombre) }}</span>
      </div>
    </div>

    <div class="cards-container">
      <div class="status-card attended">
        <div class="card-header">
          <i class="pi pi-check-circle"></i>
          <h3>Tickets Atendidos</h3>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total:</span>
            <span class="stat-value">{{ countTicketsAttended(area.nombre) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Hoy:</span>
            <span class="stat-value">{{ countTicketsAttendedToday(area.nombre) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Esta semana:</span>
            <span class="stat-value">{{ countTicketsAttendedThisWeek(area.nombre) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Este mes:</span>
            <span class="stat-value">{{ countTicketsAttendedThisMonth(area.nombre) }}</span>
          </div>
        </div>
      </div>

      <div class="status-card resolved">
        <div class="card-header">
          <i class="pi pi-check"></i>
          <h3>Tickets Resueltos</h3>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total:</span>
            <span class="stat-value">{{ countTicketsByStatus(area.nombre, 'Resuelto') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Hoy:</span>
            <span class="stat-value">{{ countTicketsByDay(area.nombre, 'Resuelto') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Esta semana:</span>
            <span class="stat-value">{{ countTicketsByWeek(area.nombre, 'Resuelto') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Este mes:</span>
            <span class="stat-value">{{ countTicketsByMonth(area.nombre, 'Resuelto') }}</span>
          </div>
        </div>
      </div>

      <div class="status-card canceled">
        <div class="card-header">
          <i class="pi pi-times-circle"></i>
          <h3>Tickets Cancelados</h3>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total:</span>
            <span class="stat-value">{{ countTicketsByStatus(area.nombre, 'Cancelado') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Hoy:</span>
            <span class="stat-value">{{ countTicketsByDay(area.nombre, 'Cancelado') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Esta semana:</span>
            <span class="stat-value">{{ countTicketsByWeek(area.nombre, 'Cancelado') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Este mes:</span>
            <span class="stat-value">{{ countTicketsByMonth(area.nombre, 'Cancelado') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="actions" v-if="userRole === 'Recepcionista'">
      <pv-button
          icon="pi pi-download"
          label="Descargar PDF"
          class="download-btn"
          @click="downloadPDF"
      />
    </div>
  </div>
</template>

<script>
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default {
  name: "AreaReport",
  props: {
    area: Object,
    tickets: Array
  },
  data() {
    return {
      userRole: localStorage.getItem('userRole') || ''
    };
  },
  methods: {
    countTicketsByDay(area, status) {
      const today = new Date().toISOString().split('T')[0];
      return this.tickets.filter(ticket =>
          ticket.updatedAt &&
          ticket.updatedAt.split('T')[0] === today &&
          ticket.estado === status &&
          ticket.areaNombre === area
      ).length;
    },
    countTicketsByWeek(area, status) {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return this.tickets.filter(ticket => {
        if (!ticket.updatedAt) return false;
        const ticketDate = new Date(ticket.updatedAt);
        return ticketDate >= startOfWeek &&
            ticketDate <= endOfWeek &&
            ticket.estado === status &&
            ticket.areaNombre === area;
      }).length;
    },
    countTicketsByMonth(area, status) {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      return this.tickets.filter(ticket => {
        if (!ticket.updatedAt) return false;
        const ticketDate = new Date(ticket.updatedAt);
        return ticketDate.getMonth() === currentMonth &&
            ticketDate.getFullYear() === currentYear &&
            ticket.estado === status &&
            ticket.areaNombre === area;
      }).length;
    },
    countTicketsByArea(area) {
      return this.tickets.filter(ticket => ticket.areaNombre === area).length;
    },
    countTicketsAttended(area) {
      return this.tickets.filter(ticket =>
          (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado') &&
          ticket.areaNombre === area
      ).length;
    },
    countTicketsAttendedToday(area) {
      const today = new Date().toISOString().split('T')[0];
      return this.tickets.filter(ticket =>
          ticket.updatedAt &&
          ticket.updatedAt.split('T')[0] === today &&
          (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado') &&
          ticket.areaNombre === area
      ).length;
    },
    countTicketsAttendedThisWeek(area) {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return this.tickets.filter(ticket => {
        if (!ticket.updatedAt) return false;
        const ticketDate = new Date(ticket.updatedAt);
        return ticketDate >= startOfWeek &&
            ticketDate <= endOfWeek &&
            (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado') &&
            ticket.areaNombre === area;
      }).length;
    },
    countTicketsAttendedThisMonth(area) {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      return this.tickets.filter(ticket => {
        if (!ticket.updatedAt) return false;
        const ticketDate = new Date(ticket.updatedAt);
        return ticketDate.getMonth() === currentMonth &&
            ticketDate.getFullYear() === currentYear &&
            (ticket.estado === 'Resuelto' || ticket.estado === 'Cancelado') &&
            ticket.areaNombre === area;
      }).length;
    },
    countTicketsByStatus(area, status) {
      return this.tickets.filter(ticket =>
          ticket.estado === status &&
          ticket.areaNombre === area
      ).length;
    },
    formatDate(dateString) {
      if (!dateString) return '---';
      const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleString('es-ES', options);
    },
    downloadPDF() {
      const doc = new jsPDF({orientation: 'landscape'});
      const title = `Reporte de tickets - ${this.area.nombre}`;

      // Configuración de título y estilo
      doc.setFontSize(18);
      doc.setTextColor(44, 62, 80); // #2c3e50
      doc.text(title, 14, 22);

      // Agregar fecha de generación
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, 14, 30);

      // Agregar información de resumen
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total de tickets: ${this.countTicketsByArea(this.area.nombre)}`, 14, 40);
      doc.text(`Tickets atendidos: ${this.countTicketsAttended(this.area.nombre)}`, 14, 48);
      doc.text(`Tickets resueltos: ${this.countTicketsByStatus(this.area.nombre, 'Resuelto')}`, 14, 56);
      doc.text(`Tickets cancelados: ${this.countTicketsByStatus(this.area.nombre, 'Cancelado')}`, 14, 64);

      // Tabla de tickets
      doc.autoTable({
        startY: 75,
        head: [['№ Ticket', 'Fecha Creación', 'Fecha Atención', 'Documento', 'Nombre Completo', 'Estado']],
        body: this.tickets
            .filter(ticket => ticket.areaNombre === this.area.nombre)
            .map(ticket => [
              ticket.numeroTicket,
              this.formatDate(ticket.fecha),
              this.formatDate(ticket.updatedAt),
              ticket.documento,
              `${ticket.nombres} ${ticket.apePaterno} ${ticket.apeMaterno}`,
              ticket.estado
            ]),
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246], // #3b82f6
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251] // #f9fafb
        }
      });

      doc.save(`reporte_${this.area.nombre}_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  }
}
</script>

<style scoped>
.area-dashboard {
  width: 100%;
  padding: 2rem;
  background-color: #f8fafc;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(90deg, #1e40af, #3b82f6);
  color: white;
  border-radius: 1rem;
}

.area-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.total-tickets-pill {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);
}

.total-tickets-pill span {
  font-weight: 700;
}

.cards-container {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.status-card {
  flex: 1;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.status-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

.card-header i {
  font-size: 1.75rem;
  margin-right: 1rem;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.attended .card-header i {
  color: #10b981;
}

.resolved .card-header i {
  color: #3b82f6;
}

.canceled .card-header i {
  color: #ef4444;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  padding: 0.75rem;
  border-radius: 0.5rem;

}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;

}

.attended .stat-value {
  color: #059669;
}

.resolved .stat-value {
  color: #2563eb;
}

.canceled .stat-value {
  color: #dc2626;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.download-btn {
  background-color: #dc2626;
  border: none;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);
}

.download-btn:hover {
  background-color: #2563eb;
}

@media (max-width: 768px) {
  .cards-container {
    flex-direction: column;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>