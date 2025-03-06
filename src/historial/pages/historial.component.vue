<template>
  <div class="historial">
    <div class="p-4 max-w-7xl mx-auto h-screen">
      <!-- Fila de botones por área -->
      <div v-if="userRole === 'Administrador'" class="area-buttons-container mb-4 flex flex-wrap gap-2">
        <button
            v-for="area in areas"
            :key="area.id"
            @click="selectArea(area.nombre)"
            :class="[
            'area-button px-4 py-2 rounded-lg font-medium transition-all',
            selectedArea === area.nombre
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ area.nombre }}
        </button>
      </div>

      <div v-if="error" class="p-4 bg-red-100 text-red-700 rounded-lg">{{ error }}</div>
      <div v-else>
        <div v-if="loading" class="loading-spinner">
          <pv-progress-spinner />
          Cargando historial...
        </div>
        <div v-else>
          <div v-if="!filteredTicketsByArea[selectedArea]?.length" class="p-4 bg-yellow-100 text-yellow-700 rounded-lg">
            Aún no hay historial
          </div>
          <div
              v-for="(tickets, area) in filteredTicketsByArea"
              :key="area"
              class="ticket-area mb-6 h-full">
            <div class="area-header mb-4 bg-gray-50 p-4 rounded-t-lg border-b">
              <h2 class="text-xl font-semibold text-gray-800">{{ area }}</h2>
            </div>

            <div class="table-container">
              <pv-data-table
                  :value="tickets"
                  dataKey="id"
                  class="ticket-table"
                  scrollable
                  scrollDirection="vertical"
                  filterDisplay="row"
                  :filters="filtersByArea[area]"
                  :loading="loading"
              >
                <pv-column field="numeroTicket" header="N° Ticket" :showFilterMenu="false">
                  <template #filter="{ filterModel, filterCallback }">
                    <pv-input-text
                        v-model="filtersByArea[area]['numeroTicket'].value"
                        placeholder="Buscar por número"
                        class="p-inputtext-sm w-full"
                        @input="filterCallback()"
                        @clear="clearFilter(area, 'numeroTicket', filterCallback)"
                        :showClear="true"
                    />
                  </template>
                </pv-column>

                <pv-column field="nombres" header="Creado por" :showFilterMenu="false">
                  <template #filter="{ filterModel, filterCallback }">
                    <pv-input-text
                        v-model="filtersByArea[area]['nombres'].value"
                        placeholder="Buscar por nombre"
                        class="p-inputtext-sm w-full"
                        @input="filterCallback()"
                    />
                  </template>
                </pv-column>

                <pv-column field="fecha" header="Fecha de creación" :showFilterMenu="false">
                  <template #body="{ data }">
                    <span class="text-gray-700">{{ formatDateTime(data.fecha) }}</span>
                  </template>
                  <template #filter="{ filterModel, filterCallback }">
                    <input type="date" v-model="filtersByArea[area]['fecha'].value" @change="filterCallback()" />
                  </template>
                </pv-column>

                <pv-column field="updatedAt" header="Fecha de atención" :showFilterMenu="false">
                  <template #body="{ data }">
                    <span class="text-gray-700">{{ formatDateTime(data.updatedAt) }}</span>
                  </template>
                  <template #filter="{ filterModel, filterCallback }">
                    <input type="date" v-model="filtersByArea[area]['updatedAt'].value" @change="filterCallback()" />
                  </template>
                </pv-column>

                <pv-column field="estado" header="Estado" :showFilterMenu="false">
                  <template #body="{ data }">
                    <span :class="getStatusClass(data.estado)">
                      {{ data.estado }}
                    </span>
                  </template>
                  <template #filter="{ filterModel, filterCallback }">
                    <select
                        v-model="filtersByArea[area]['estado'].value"
                        @change="filterCallback()"
                        class="w-full p-2 border rounded-md text-sm bg-blue"
                    >
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
                  <template #filter="{ filterModel, filterCallback }">
                    <pv-input-text
                        v-model="filtersByArea[area]['atendidoPor'].value"
                        placeholder="Buscar por atención"
                        class="p-inputtext-sm w-full"
                        @input="filterCallback()"
                    />
                  </template>
                </pv-column>
              </pv-data-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TicketApiService from '../../public/services/ticket-api.service';
import CommentApiService from '../../public/services/comment-api.service';
import WebSocketService from '../../shared/websocket.service';

export default {
  name: "historial",
  data() {
    return {
      areas: [],
      ticketsByArea: {},
      filtersByArea: {},
      error: null,
      loading: false,
      userRole: localStorage.getItem('userRole') || '',
      userArea: localStorage.getItem('userArea') || '',
      statuses: ['En Espera', 'Abierto', 'Resuelto', 'Cancelado'],
      selectedArea: null,
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
  computed: {
    filteredTicketsByArea() {
      if (this.selectedArea === null) {
        return this.ticketsByArea;
      }

      const result = {};
      if (this.ticketsByArea[this.selectedArea]) {
        result[this.selectedArea] = this.ticketsByArea[this.selectedArea];
      }
      return result;
    }
  },
  methods: {
    selectArea(area) {
      this.selectedArea = area;
    },
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
    },
    async fetchAreas() {
      try {
        const response = await TicketApiService.getAreas();
        this.areas = response.data.filter(area => area.nombre.toLowerCase() !== 'general');
        if (this.areas.length > 0) {
          this.selectedArea = this.areas[0].nombre;
        }
      } catch (error) {
        console.error('Error fetching areas:', error);
        this.error = 'Error al cargar las áreas. Por favor, intente nuevamente.';
      }
    },
    setupWebSocket() {
      const webSocketService = new WebSocketService();
      webSocketService.onMessage((message) => {
        const data = JSON.parse(message.data);
        if (data.entityName === 'Area' && data.action === 'Created') {
          this.areas.push(data.entity);
        }
      });
    },
    filterCallback() {
      const filteredTickets = {};

      for (const area in this.ticketsByArea) {
        filteredTickets[area] = this.ticketsByArea[area].filter(ticket => {
          const creationDate = this.parseAndFormatDate(ticket.fecha);
          const updateDate = this.parseAndFormatDate(ticket.updatedAt);
          const filterCreationDate = this.filtersByArea[area]['fecha'].value;
          const filterUpdateDate = this.filtersByArea[area]['updatedAt'].value;

          const matchesCreationDate = !filterCreationDate || creationDate === filterCreationDate;
          const matchesUpdateDate = !filterUpdateDate || updateDate === filterUpdateDate;

          return matchesCreationDate && matchesUpdateDate;
        });
      }

      this.filteredTicketsByArea = filteredTickets;
    },
    parseAndFormatDate(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      if (isNaN(date)) {
        console.error('Invalid date:', dateString);
        return null;
      }
      return date.toISOString().split('T')[0];
    },

  },
  async created() {
    this.loading = true;
    try {
      await this.fetchAreas();
      const response = await TicketApiService.getAll();
      const tickets = response.data;

      for (const ticket of tickets) {
        try {
          const commentsResponse = await CommentApiService.getCommentsByTicketId(ticket.id);
          ticket.comments = commentsResponse.data.length > 0
              ? commentsResponse.data
              : [{coment: "----"}];
          ticket.atendidoPor = commentsResponse.data.length > 0
              ? commentsResponse.data[0].nombreCompleto
              : "";
        } catch (error) {
          ticket.comments = [{coment: "---"}];
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
          this.filtersByArea[ticket.areaNombre] = {
            'numeroTicket': {value: null, matchMode: 'contains'},
            'nombres': {value: null, matchMode: 'contains'},
            'fecha': {value: null, matchMode: 'contains'},
            'updatedAt': {value: null, matchMode: 'contains'},
            'estado': {value: null, matchMode: 'equals'},
            'atendidoPor': {value: null, matchMode: 'contains'}
          };
        }
        acc[ticket.areaNombre].push(ticket);
        acc[ticket.areaNombre].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        return acc;
      }, {});

      if (this.userRole === 'Recepcionista') {
        this.selectedArea = this.userArea;
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      this.error = 'Error al cargar los tickets. Por favor, intente nuevamente.';
    } finally {
      this.loading = false;
    }

    this.setupWebSocket();
  }
}
</script>

<style scoped>
.historial {
  width: 100%;
}

.table-container {
  height: calc(130vh - 200px);
  overflow-x: hidden; /* Hide horizontal scroll */
  overflow-y: auto; /* Allow vertical scroll */
  display: flex;
  flex-direction: column;
}

:deep(.p-datatable) {
  display: flex;
  flex-direction: column;
  height: 100%;
}


:deep(.p-datatable .p-datatable-wrapper) {
  flex: 1;
  overflow: auto;
  scrollbar-width: thin;
}

:deep(.p-datatable .p-datatable-thead) {
  position: sticky;
  top: 0;
  z-index: 1;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  position: sticky;
  top: 0;
  background-color: #e2e8f0;
  z-index: 1;
}

.loading-spinner {
  text-align: center;
  font-size: 1.5rem;
  color: #333;
}

.ticket-area:hover {
  transform: translateY(-2px);
}

.area-header {
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
  padding: 1.25rem 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.area-header h2 {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
}

/* Estilos para la fila de botones de área */
.area-buttons-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.area-button {
  font-weight: 500;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.area-button:hover {
  transform: translateY(-1px);
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: linear-gradient(to bottom, #e2e8f0, #cbd5e1);
  color: #1e293b;
  padding: 1rem;
  font-weight: 600;
  border-bottom: 2px solid #94a3b8;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: normal !important;
  line-height: 1.2;
  height: auto;
  min-height: 60px;
  vertical-align: middle;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: all 0.2s ease-in-out;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0e2e5;
  color: #334155;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #c3c8cd;
}

/* Column widths */
:deep(.p-datatable .p-datatable-thead > tr > th:nth-child(1)),
:deep(.p-datatable .p-datatable-tbody > tr > td:nth-child(1)) {
  width: 8%;
  min-width: 100px;
}

:deep(.p-datatable .p-datatable-thead > tr > th:nth-child(2)),
:deep(.p-datatable .p-datatable-tbody > tr > td:nth-child(2)) {
  width: 12%;
  min-width: 120px;
}

:deep(.p-datatable .p-datatable-thead > tr > th:nth-child(5)),
:deep(.p-datatable .p-datatable-tbody > tr > td:nth-child(5)) {
  width: 10%;
  min-width: 100px;
}

:deep(.p-datatable .p-datatable-thead > tr > th:nth-child(6)),
:deep(.p-datatable .p-datatable-tbody > tr > td:nth-child(6)) {
  width: 25%;
  min-width: 200px;
}

:deep(.p-datatable .p-datatable-thead > tr > th:nth-child(7)),
:deep(.p-datatable .p-datatable-tbody > tr > td:nth-child(7)) {
  width: 15%;
  min-width: 130px;
}
/* Input Styles */
:deep(.p-inputtext-sm) {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease-in-out;
  width: 100%;
}

.comment-list {
  max-height: 120px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.comment-list::-webkit-scrollbar {
  width: 6px;
}

.comment-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.comment-list::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.comment-item {
  padding: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
}


.p-4 {
  padding: 0.75rem !important;
}

.max-w-7xl {
  max-width: 98% !important;
  margin: 0 auto;
}

/* Responsive adjustments */
@media (max-width: 1366px) {
  :deep(.p-datatable .p-datatable-thead > tr > th) {
    font-size: 0.7rem;
    padding: 0.75rem 0.5rem;
    min-height: 30px;
  }

  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.75rem 0.5rem;
  }
}

@media (max-width: 768px) {
  .max-w-7xl {
    max-width: 100% !important;
  }

  .ticket-area {
    margin: 0 0.25rem 1.5rem 0.25rem;
  }

  .area-buttons-container {
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
}
</style>