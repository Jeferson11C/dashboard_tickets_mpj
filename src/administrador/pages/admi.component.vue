<template>
  <div class="admi">
    <div class="fixed-content">
      <button @click="toggleCreateUserForm">Crear Usuario</button>
      <userCreate v-if="showCreateUserForm" @userCreated="addUserToList" />
      <div v-if="showUpdateUserForm || showConfirmStatusModal || showUserCreatedModal || showDeleteUserModal || showUserUpdatedModal" class="modal-overlay"></div>

      <pv-dialog v-model:visible="showUpdateUserForm" modal class="update-dialog" :style="{ width: '50vw' }" :closable="false">
        <updateUser :user="selectedUser" @userUpdated="updateUserInList" @closeModal="showUpdateUserForm = false" />
      </pv-dialog>

      <pv-dialog v-model:visible="showConfirmStatusModal" modal :style="{ width: '30vw', zIndex: 1000, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }" :closable="false">
        <template #header>
          <div class="modal-header">
            <i class="pi pi-sync header-icon"></i>
            <h3>Confirmar Cambio de Estado</h3>
          </div>
        </template>
        <template #footer>
          <div class="button-container">
            <button class="confirm-button" @click="confirmStatusChange">
              <i class="pi pi-check"></i> Confirmar
            </button>
            <button class="cancel-button" @click="cancelStatusChange">
              <i class="pi pi-times"></i> Cancelar
            </button>
          </div>
        </template>
      </pv-dialog>

      <!-- Modal de Usuario Creado -->
      <pv-dialog v-model:visible="showUserCreatedModal" modal :style="{ width: '30vw', zIndex: 1000, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }" :closable="false">
        <template #header>
          <div class="modal-header">
            <i class="pi pi-check-circle header-icon success-icon"></i>
            <p>El usuario ha sido creado exitosamente.</p>
          </div>
        </template>
        <template #footer>
          <div class="button-container">
            <button class="close-button" @click="showUserCreatedModal = false">
              <i class="pi pi-check"></i> Cerrar
            </button>
          </div>
        </template>
      </pv-dialog>

      <!-- Modal de Eliminación de Usuario -->
      <pv-dialog v-model:visible="showDeleteUserModal" modal :style="{ width: '30vw', zIndex: 1000, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }" :closable="false">
        <template #header>
          <div class="modal-header">
            <i class="pi pi-trash header-icon danger-icon"></i>
            <h3>Confirmar Eliminación de Usuario</h3>
          </div>
        </template>
        <template #footer>
          <div class="button-container">
            <button class="confirm-button" @click="deleteUser">
              <i class="pi pi-check"></i> Aceptar
            </button>
            <button class="cancel-button" @click="showDeleteUserModal = false">
              <i class="pi pi-times"></i> Cancelar
            </button>
          </div>
        </template>
      </pv-dialog>

      <!-- Modal de Usuario Actualizado -->
      <pv-dialog v-model:visible="showUserUpdatedModal" modal :style="{ width: '30vw', zIndex: 1000, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }" :closable="false">
        <template #header>
          <div class="modal-header">
            <i class="pi pi-check-circle header-icon success-icon"></i>
            <h3>Usuario Actualizado</h3>
          </div>
        </template>
        <template #footer>
          <div class="button-container">
            <button class="close-button" @click="showUserUpdatedModal = false">
              <i class="pi pi-check"></i> Cerrar
            </button>
          </div>
        </template>
      </pv-dialog>
    </div>

    <div class="fixed-content">
      <h2>Lista de usuarios</h2>
      <div class="table-container">
        <pv-data-table :value="filteredUsers" scrollable v-model:filters="filters" filterDisplay="row" :loading="loading" :globalFilterFields="['dni', 'nombreCompleto', 'area', 'rol', 'estado']">
          <template #empty> No users found. </template>
          <template #loading> Loading users data. Please wait. </template>
          <pv-column field="dni" header="DNI">
            <template #body="{ data }">
              {{ data.dni }}
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <pv-input-text v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Search"  />
            </template>
          </pv-column>
          <pv-column field="nombreCompleto" header="Nombre">
            <template #body="{ data }">
              {{ data.nombreCompleto }}
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <pv-input-text v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Search"  />
            </template>
          </pv-column>
          <pv-column field="ventanilla" header="Ventana">
            <template #body="{ data }">
              {{ data.ventanilla }}
            </template>
          </pv-column>
          <pv-column field="rol" header="Rol">
            <template #body="{ data }">
              {{ data.rol }}
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <div class="select-wrapper">
                <select v-model="filterModel.value" @change="filterCallback()" class="w-full">
                  <option value="">Todos</option>
                  <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
                </select>
              </div>
            </template>
          </pv-column>
          <pv-column field="area" header="Área">
            <template #body="{ data }">
              {{ data.area }}
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <div class="select-wrapper">
                <select v-model="filterModel.value" @change="filterCallback()" class="w-full">
                  <option value="">Todas</option>
                  <option v-for="area in areas" :key="area.nombre" :value="area.nombre">{{ area.nombre }}</option>
                </select>
              </div>
            </template>
          </pv-column>
          <pv-column field="estado" header="Estado">
            <template #body="slotProps">
              <div :class="statusClass(slotProps.data.estado)">
                {{ slotProps.data.estado }}
              </div>
              <div class="select-wrapper">
                <select v-model="tempStatus.value" @change="showStatusChangeModal(slotProps.data.id, $event.target.value)" class="w-full">
                  <option v-for="status in statuses" :key="status" :value="status" :class="statusClass(status)">
                    {{ status }}
                  </option>
                </select>
              </div>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <div class="select-wrapper">
                <select v-model="filterModel.value" @change="filterCallback()" class="w-full">
                  <option value="">Todos</option>
                  <option v-for="status in statuses" :key="status" :value="status" :class="statusClass(status)">
                    {{ status }}
                  </option>
                </select>
              </div>
            </template>
          </pv-column>
          <pv-column header="Acciones">
            <template #body="slotProps">
              <div style="display: flex; flex-direction: column; align-items: center;">
                <pv-button icon="pi pi-pencil" @click="editUser(slotProps.data)" class="p-button-rounded p-button-info mb-2"></pv-button>
                <pv-button icon="pi pi-trash" @click="confirmDeleteUser(slotProps.data.id)" class="p-button-rounded p-button-danger"></pv-button>
              </div>
            </template>
          </pv-column>
        </pv-data-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import UserApiService from '../services/user-api.service';
import WebSocketService from '../../shared/websocket.service';
import userCreate from '../components/userCreate.component.vue';
import updateUser from '../components/updateUser.component.vue';

const showCreateUserForm = ref(false);
const showUpdateUserForm = ref(false);
const showConfirmStatusModal = ref(false);
const showUserCreatedModal = ref(false);
const showDeleteUserModal = ref(false);
const showUserUpdatedModal = ref(false);
const users = ref([]);
const filteredUsers = ref([]);
const areas = ref([]);
const roles = ref(['Administrador', 'Recepcionista']);
const selectedArea = ref(null);
const selectedRole = ref(null);
const selectedUser = ref(null);
const userIdToUpdate = ref(null);
const userIdToDelete = ref(null);
const newStatus = ref('');
const newUser = ref(null);
const tempStatus = ref('');
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  dni: { value: null, matchMode: 'startsWith' },
  nombreCompleto: { value: null, matchMode: 'startsWith' },
  rol: { value: null, matchMode: 'equals' },
  area: { value: null, matchMode: 'equals' },
  estado: { value: null, matchMode: 'equals' }
});
const loading = ref(false);
const statuses = ['Activo', 'Inactivo'];

const webSocketService = new WebSocketService();
webSocketService.connect();

webSocketService.onMessage((message) => {
  const data = JSON.parse(message.data);
  if (data.event === 'userCreated') {
    addUserToList(data.data);
  } else if (data.event === 'userDeleted') {
    removeUserFromList(data.data.id);
  }
});

// Add this new method to handle clearing filters
const clearFilter = (field, callback) => {
  if (filters.value[field]) {
    filters.value[field].value = null;
    callback();
  }
};

const toggleCreateUserForm = () => {
  showCreateUserForm.value = !showCreateUserForm.value;
};

const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await UserApiService.fetchUsers();
    users.value = response.data;
    filteredUsers.value = users.value;
    loading.value = false;
    console.log('Usuarios obtenidos:', users.value);
  } catch (error) {
    console.error('Error fetching users:', error);
    loading.value = false;
  }
};

// Rest of your methods remain the same...
const fetchAreas = async () => {
  try {
    const response = await UserApiService.getAreas();
    areas.value = response.data;
  } catch (error) {
    console.error('Error fetching areas:', error);
  }
};

const deleteUser = async () => {
  try {
    await UserApiService.deleteUser(userIdToDelete.value);
    webSocketService.sendMessage(JSON.stringify({ event: 'userDeleted', data: { id: userIdToDelete.value } }));
    showDeleteUserModal.value = false;
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

const confirmDeleteUser = (id) => {
  userIdToDelete.value = id;
  showDeleteUserModal.value = true;
};

const addUserToList = (newUser) => {
  users.value.push(newUser);
  filterUsers();
  showUserCreatedModal.value = true;
};

const removeUserFromList = (id) => {
  users.value = users.value.filter(user => user.id !== id);
  filterUsers();
};

const updateUserInList = (updatedUser) => {
  const index = users.value.findIndex(user => user.id === updatedUser.id);
  if (index !== -1) {
    users.value[index] = updatedUser;
    filterUsers();
  }
  showUpdateUserForm.value = false;
  showUserUpdatedModal.value = true;
};

const showStatusChangeModal = (id, status) => {
  userIdToUpdate.value = id;
  tempStatus.value = status;
  showConfirmStatusModal.value = true;
};

const confirmStatusChange = async () => {
  try {
    await UserApiService.updateUserStatus(userIdToUpdate.value, tempStatus.value);
    const updatedUser = users.value.find(user => user.id === userIdToUpdate.value);
    if (updatedUser) {
      updatedUser.estado = tempStatus.value;
      webSocketService.sendMessage(JSON.stringify({ event: 'userStatusUpdated', data: { id: userIdToUpdate.value, status: tempStatus.value } }));
    }
    showConfirmStatusModal.value = false;
  } catch (error) {
    console.error('Error updating user status:', error);
  }
};

const cancelStatusChange = () => {
  tempStatus.value = '';
  showConfirmStatusModal.value = false;
};

const filterUsers = () => {
  filteredUsers.value = users.value.filter(user => {
    const matchesArea = selectedArea.value ? user.area === selectedArea.value.nombre : true;
    const matchesRole = selectedRole.value ? user.rol === selectedRole.value : true;
    return matchesArea && matchesRole;
  });
};

const statusClass = (status) => {
  return {
    'status-active': status === 'Activo',
    'status-inactive': status === 'Inactivo'
  };
};

const editUser = (user) => {
  selectedUser.value = { ...user };
  showUpdateUserForm.value = true;
};

onMounted(() => {
  fetchUsers();
  fetchAreas();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
}

.status-active {
  background-color: green;
  color: white;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.status-inactive {
  background-color: red;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.select-wrapper {
  background-color: #ffffff;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ced4da;
}

.fixed-content > button {
  padding: 0.75rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 50;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: fit-content;
}

.fixed-content > button:hover {
  background-color: #25912a;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #2c3e50;
  margin: 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.fixed-content {
  width: 100%;
  padding: 0.3em;
  overflow: hidden;
  box-sizing: border-box;
}

.table-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  box-sizing: border-box;
}

:deep(.p-datatable) {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  table-layout: auto; /* Ensure table layout is auto */
}

:deep(.p-datatable .p-datatable-wrapper) {
  flex: 1;
  overflow: hidden; /* Prevent horizontal scroll */
}

:deep(.p-datatable .p-datatable-thead > tr > th),
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.5rem;
  font-size: 0.85rem;
  white-space: normal; /* Allow text to wrap */
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  position: sticky;
  top: 0;
  background-color: #e2e8f0;
  z-index: 1;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: linear-gradient(to bottom, #a3bfda, #cbd5e1);
  color: #1e293b;
  padding: 0.5rem;
  font-weight: 600;
  border-bottom: 2px solid #94a3b8;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  line-height: 1.2;
  height: auto;
  min-height: 40px;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: all 0.2s ease-in-out;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.5rem;
  border-bottom: 1px solid #f0e2e5;
  color: #334155;
  vertical-align: middle;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #c3c8cd;
}
:deep(.p-button-rounded) {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0 0.5rem;
}

/* Button styles for modals */
.confirm-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-button:hover {
  background-color: #45a049;
  transform: translateY(-2px);
}

.confirm-button i {
  margin-right: 0.5rem;
}

.cancel-button {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-button:hover {
  background-color: #e53935;
  transform: translateY(-2px);
}

.cancel-button i {
  margin-right: 0.5rem;
}

.close-button {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.close-button i {
  margin-right: 0.5rem;
}

/* Nuevos estilos para modales mejorados */
.modal-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.header-icon {
  font-size: 1.5rem;
  margin-right: 0.75rem;
  color: #3f51b5;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>