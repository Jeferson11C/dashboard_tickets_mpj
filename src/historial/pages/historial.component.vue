<template>
  <div class="p-4 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Historial de Tickets</h1>
    <div v-if="error" class="p-4 bg-red-100 text-red-700 rounded-lg">{{ error }}</div>
    <div v-else>
      <div v-for="(tickets, area) in ticketsByArea" :key="area" class="ticket-area mb-6">
        <div class="area-header mb-4 bg-gray-50 p-4 rounded-t-lg border-b">
          <h2 class="text-xl font-semibold text-gray-800">{{ area }}</h2>
        </div>

        <pv-data-table
            :value="tickets"
            dataKey="id"
            class="ticket-table"
            scrollable
            scrollDirection="horizontal"
            paginator
            :rows="5"
            :rowsPerPageOptions="[5, 10, 15, 20]"
            :filters="filters"
            filterDisplay="row"
            :loading="loading"
        >
          <pv-column field="numeroTicket" header="Número de Ticket" :showFilterMenu="false">
            <template #filter="{ filterModel }">
              <pv-input-text
                  v-model="filters['numeroTicket'].value"
                  placeholder="Buscar por número"
                  class="p-inputtext-sm w-full"
              />
            </template>
          </pv-column>

          <pv-column field="nombres" header="Creado por" :showFilterMenu="false">
            <template #filter="{ filterModel }">
              <pv-input-text
                  v-model="filters['nombres'].value"
                  placeholder="Buscar por nombre"
                  class="p-inputtext-sm w-full"
              />
            </template>
          </pv-column>

          <pv-column field="fecha" header="Fecha de creación" :showFilterMenu="false">
            <template #body="{ data }">
              <span class="text-gray-700">{{ formatDateTime(data.fecha) }}</span>
            </template>
            <template #filter="{ filterModel }">
              <calendar
                  v-model="filters['fecha'].value"
                  placeholder="Buscar fecha"
                  class="p-calendar-sm w-full"
                  showIcon
              />
            </template>
          </pv-column>

          <pv-column field="updatedAt" header="Fecha de atención" :showFilterMenu="false">
            <template #body="{ data }">
              <span class="text-gray-700">{{ formatDateTime(data.updatedAt) }}</span>
            </template>
            <template #filter="{ filterModel }">
              <calendar
                  v-model="filters['updatedAt'].value"
                  placeholder="Buscar fecha"
                  class="p-calendar-sm w-full"
                  showIcon
              />
            </template>
          </pv-column>

          <pv-column field="estado" header="Estado" :showFilterMenu="false">
            <template #body="{ data }">
      <span :class="getStatusClass(data.estado)">
        {{ data.estado }}
      </span>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <select v-model="filters['estado'].value" @change="filterCallback()" class="w-full p-2 border rounded-md text-sm bg-white">
                <option value="">Todos</option>
                <option v-for="status in statuses" :key="status" :value="status">
                  {{ status }}
                </option>
              </select>
            </template>
          </pv-column>

          <pv-column header="Comentarios" class="comments-column">
            <template #body="{ data }">
              <ul class="comment-list">
                <li v-for="(comment, index) in data.comments"
                    :key="index"
                    class="comment-item py-1 px-2 text-sm text-gray-600"
                >
                  {{ comment.coment }}
                </li>
              </ul>
            </template>
          </pv-column>

          <pv-column field="atendidoPor" header="Atendido por" :showFilterMenu="false">
            <template #filter="{ filterModel }">
              <pv-input-text
                  v-model="filters['atendidoPor'].value"
                  placeholder="Buscar por atención"
                  class="p-inputtext-sm w-full"
              />
            </template>
          </pv-column>
        </pv-data-table>
      </div>
    </div>
  </div>
</template>

<script>
import TicketApiService from '../../public/services/ticket-api.service';
import CommentApiService from '../../public/services/comment-api.service';

export default {
  name: "historial",
  data() {
    return {
      ticketsByArea: {},
      error: null,
      loading: false,
      userRole: localStorage.getItem('userRole') || '',
      userArea: localStorage.getItem('userArea') || '',
      statuses: ['En Espera', 'Abierto', 'Resuelto', 'Cancelado'],
      filters: {
        'numeroTicket': { value: null, matchMode: 'contains' },
        'nombres': { value: null, matchMode: 'contains' },
        'fecha': { value: null, matchMode: 'contains' },
        'updatedAt': { value: null, matchMode: 'contains' },
        'estado': { value: null, matchMode: 'equals' },
        'atendidoPor': { value: null, matchMode: 'contains' }
      }
    };
  },
  methods: {
    formatDateTime(dateString) {
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
    getStatusClass(status) {
      const statusClasses = {
        'En Espera': 'bg-blue-100 text-blue-800',
        'Abierto': 'bg-green-100 text-green-800',
        'Resuelto': 'bg-purple-100 text-purple-800',
        'Cancelado': 'bg-red-100 text-red-800'
      };
      return `px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
    }
  },
  async created() {
    this.loading = true;
    try {
      const response = await TicketApiService.getAll();
      const tickets = response.data;

      for (const ticket of tickets) {
        try {
          const commentsResponse = await CommentApiService.getCommentsByTicketId(ticket.id);
          ticket.comments = commentsResponse.data.length > 0
              ? commentsResponse.data
              : [{ coment: "Aún no ha sido atendido" }];
          ticket.atendidoPor = commentsResponse.data.length > 0
              ? commentsResponse.data[0].username
              : "";
        } catch (error) {
          ticket.comments = [{ coment: "Aún no ha sido atendido" }];
          console.error(`Error loading comments for ticket ${ticket.id}:`, error);
        }
      }

      const filteredTickets = this.userRole === 'Administrador'
          ? tickets.filter(ticket => ticket.areaNombre.toLowerCase() !== 'general')
          : tickets.filter(ticket => ticket.areaNombre === this.userArea &&
              ticket.areaNombre.toLowerCase() !== 'general');

      this.ticketsByArea = filteredTickets.reduce((acc, ticket) => {
        if (!acc[ticket.areaNombre]) {
          acc[ticket.areaNombre] = [];
        }
        acc[ticket.areaNombre].push(ticket);
        return acc;
      }, {});
    } catch (error) {
      console.error('Error loading tickets:', error);
      this.error = 'Error al cargar los tickets. Por favor, intente nuevamente.';
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style scoped>
.ticket-area {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.ticket-table {
  width: 100%;
}

:deep(.p-datatable) {
  width: 100%;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f8fafc;
  color: #1e293b;
  padding: 1rem;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f1f5f9;
}

:deep(.p-inputtext-sm) {
  font-size: 0.875rem;
  padding: 0.4rem 0.8rem;
}

:deep(.p-dropdown-sm) {
  font-size: 0.875rem;
}

:deep(.p-calendar-sm) {
  width: 100%;
}

.comment-list {
  max-height: 100px;
  overflow-y: auto;
}

.comment-item {
  border-bottom: 1px solid #f1f5f9;
}

.comment-item:last-child {
  border-bottom: none;
}

:deep(.p-paginator) {
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 0.5rem;
}

:deep(.p-datatable-loading-overlay) {
  background: rgba(255, 255, 255, 0.8);
}

:deep(.p-datatable-loading-icon) {
  color: #3b82f6;
}


</style>