<script setup>
import { ref, onMounted } from 'vue';
import UserApiService from '../services/user-api.service';
import WebSocketService from '../../shared/websocket.service';
import userCreate from '../components/userCreate.component.vue';
import updateUser from '../components/updateUser.component.vue';

const showCreateUserForm = ref(false);
const showUpdateUserForm = ref(false);
const showConfirmStatusModal = ref(false);
const users = ref([]);
const filteredUsers = ref([]);
const areas = ref([]);
const roles = ref(['Administrador', 'Recepcionista']);
const selectedArea = ref(null);
const selectedRole = ref(null);
const selectedUser = ref(null);
const userIdToUpdate = ref(null);
const newStatus = ref('');
const filters = ref({
  global: { value: null, matchMode: 'contains' },
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

const fetchAreas = async () => {
  try {
    const response = await UserApiService.getAreas();
    areas.value = response.data;
  } catch (error) {
    console.error('Error fetching areas:', error);
  }
};

const deleteUser = async (id) => {
  try {
    await UserApiService.deleteUser(id);
    webSocketService.sendMessage(JSON.stringify({ event: 'userDeleted', data: { id } }));
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

const addUserToList = (newUser) => {
  users.value.push(newUser);
  filterUsers();
};

const removeUserFromList = (id) => {
  users.value = users.value.filter(user => user.id !== id);
  filterUsers();
};

const updateUserInList = (updatedUser) => {
  const index = users.value.findIndex(user => user.id === updatedUser.id);
  if (index !== -1) {
    // Recompute nombreCompleto from the separate fields
    users.value[index] = updatedUser;
    filterUsers();
  }
  showUpdateUserForm.value = false; // Close the modal after updating
};

const showStatusChangeModal = (id, status) => {
  userIdToUpdate.value = id;
  newStatus.value = status;
  showConfirmStatusModal.value = true;
};

const confirmStatusChange = async () => {
  try {
    await UserApiService.updateUserStatus(userIdToUpdate.value, newStatus.value);
    const updatedUser = users.value.find(user => user.id === userIdToUpdate.value);
    if (updatedUser) {
      updatedUser.estado = newStatus.value;
      webSocketService.sendMessage(JSON.stringify({ event: 'userStatusUpdated', data: { id: userIdToUpdate.value, status: newStatus.value } }));
    }
    showConfirmStatusModal.value = false;
  } catch (error) {
    console.error('Error updating user status:', error);
  }
};

const filterUsers = () => {
  filteredUsers.value = users.value.filter(user => {
    const matchesArea = selectedArea.value ? user.area === selectedArea.value.nombre : true;
    const matchesRole = selectedRole.value ? user.rol === selectedRole.value : true;
    return matchesArea && matchesRole;
  });
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

<template>
  <div class="admi">
    <div class="fixed-content">
      <button @click="toggleCreateUserForm">Crear Usuario</button>
      <userCreate v-if="showCreateUserForm" @userCreated="addUserToList" />

      <pv-dialog v-model:visible="showUpdateUserForm" modal :style="{ width: '50vw' }">
        <updateUser :user="selectedUser" @userUpdated="updateUserInList" @closeModal="showUpdateUserForm = false" />
      </pv-dialog>

      <pv-dialog v-model:visible="showConfirmStatusModal" modal :style="{ width: '30vw', zIndex: 1000, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }">
        <template #header>
          <h3>Confirmar Cambio de Estado</h3>
        </template>
        <template #footer>
          <pv-button @click="confirmStatusChange">Confirmar</pv-button>
          <pv-button @click="showConfirmStatusModal = false">Cancelar</pv-button>
        </template>
      </pv-dialog>
    </div>

    <div class="fixed-content">
      <h2>Lista de usuarios</h2>
      <pv-data-table v-model:filters="filters" :value="filteredUsers" dataKey="id" filterDisplay="row"
                     :loading="loading" :globalFilterFields="['nombreCompleto', 'area', 'rol', 'estado']"
                     class="custom-table">
        <template #empty> No users found. </template>
        <template #loading> Loading users data. Please wait. </template>
        <pv-column field="nombreCompleto" header="Nombre Completo">
          <template #body="{ data }">
            {{ data.nombreCompleto }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <pv-input-text v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Search by name" class="w-full" />
          </template>
        </pv-column>
        <pv-column field="username" header="Nombre de Usuario">
          <template #body="{ data }">
            {{ data.username }}
          </template>
        </pv-column>
        <pv-column field="password" header="Contraseña">
          <template #body="{ data }">
            {{ data.password }}
          </template>
        </pv-column>
        <pv-column field="rol" header="Rol">
          <template #body="{ data }">
            {{ data.rol }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <div class="select-wrapper">
              <select v-model="filterModel.value" @change="filterCallback()" :options="roles" placeholder="Select One" class="w-full" :showClear="true">
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
              <select v-model="filterModel.value" @change="filterCallback()" :options="areas" optionLabel="nombre" placeholder="Select One" class="w-full" :showClear="true">
                <option value="">Todas</option>
                <option v-for="area in areas" :key="area.nombre" :value="area.nombre">{{ area.nombre }}</option>
              </select>
            </div>
          </template>
        </pv-column>
        <pv-column field="estado" header="Estado">
          <template #body="slotProps">
            <div class="select-wrapper">
              <pv-dropdown :modelValue="slotProps.data.estado" :options="statuses" @change="showStatusChangeModal(slotProps.data.id, $event.value)" class="w-full" />
            </div>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <div class="select-wrapper">
              <select v-model="filterModel.value" @change="filterCallback()" :options="statuses" placeholder="Select One" class="w-full" :showClear="true">
                <option value="">Todos</option>
                <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
              </select>
            </div>
          </template>
        </pv-column>
        <pv-column header="Acciones">
          <template #body="slotProps">
            <pv-button icon="pi pi-pencil" @click="editUser(slotProps.data)" class="p-button-rounded p-button-info p-mr-2"></pv-button>
            <pv-button icon="pi pi-trash" @click="deleteUser(slotProps.data.id)" class="p-button-rounded p-button-danger"></pv-button>
          </template>
        </pv-column>
      </pv-data-table>
    </div>
  </div>
</template>

<style scoped>
.admi {
  height: 100vh;
  overflow-y: auto;
  background-color: #f8f9fa;
}

.fixed-content {
  padding: 1em;
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
  font-weight: 500;
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

:deep(.p-datatable) {
  width: 100%;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #a3bfda;
  color: #2c3e50;
  padding: 1rem;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f8f9fa;
}

:deep(.p-button-rounded) {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0 0.5rem;
}

:deep(.p-button-info) {
  background-color: #3498db;
  border-color: #3498db;
}

:deep(.p-button-danger) {
  background-color: #e74c3c;
  border-color: #e74c3c;
}

:deep(.pi) {
  font-size: 1rem;
}
</style>