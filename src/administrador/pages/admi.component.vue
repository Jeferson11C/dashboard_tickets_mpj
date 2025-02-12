<template>
  <div class="admi">
    <button @click="toggleCreateUserForm">Crear Usuario</button>
    <userCreate v-if="showCreateUserForm" @userCreated="addUserToList" />

    <pv-dialog v-model:visible="showUpdateUserForm" modal :style="{ width: '50vw' }">
      <updateUser :user="selectedUser" @userUpdated="updateUserInList" @closeModal="showUpdateUserForm = false" />
    </pv-dialog>

    <div class="filters">
      <pv-dropdown v-model="selectedArea" :options="areas" optionLabel="nombre" placeholder="Filtrar por Área" @change="filterUsersByArea" />
      <pv-dropdown v-model="selectedRole" :options="roles" placeholder="Filtrar por Rol" @change="filterUsersByRole" />
    </div>
    <h2>Lista de Usuarios</h2>
    <div class="card">
      <pv-data-table :value="filteredUsers" tableStyle="min-width: 50rem">
        <Column field="nombreCompleto" header="Nombre Completo"></Column>
        <Column field="username" header="Nombre de Usuario"></Column>
        <Column field="password" header="Contraseña"></Column>
        <Column field="rol" header="Rol"></Column>
        <Column field="area" header="Área"></Column>
        <Column header="Acciones">
          <template #body="slotProps">
            <pv-button icon="pi pi-pencil" @click="editUser(slotProps.data)" class="p-button-rounded p-button-info p-mr-2"></pv-button>
            <pv-button icon="pi pi-trash" @click="deleteUser(slotProps.data.id)" class="p-button-rounded p-button-danger"></pv-button>
          </template>
        </Column>
      </pv-data-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import UserApiService from '../services/user-api.service';
import userCreate from '../components/userCreate.component.vue';
import updateUser from '../components/updateUser.component.vue';

const showCreateUserForm = ref(false);
const showUpdateUserForm = ref(false);
const users = ref([]);
const filteredUsers = ref([]);
const areas = ref([]);
const roles = ref(['Seleccione una opción', 'Administrador', 'Recepcionista']);
const selectedArea = ref(null);
const selectedRole = ref(null);
const selectedUser = ref(null);

const toggleCreateUserForm = () => {
  showCreateUserForm.value = !showCreateUserForm.value;
};

const fetchUsers = async () => {
  try {
    const response = await UserApiService.fetchUsers();
    users.value = response.data;
    filteredUsers.value = users.value;
    console.log('Usuarios obtenidos:', users.value);
  } catch (error) {
    console.error('Error fetching users:', error);
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
    users.value = users.value.filter(user => user.id !== id);
    filterUsers();
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

const addUserToList = (newUser) => {
  users.value.push(newUser);
  filterUsers();
};

const updateUserInList = (updatedUser) => {
  const index = users.value.findIndex(user => user.id === updatedUser.id);
  if (index !== -1) {
    users.value[index] = updatedUser;
    filterUsers();
  }
  showUpdateUserForm.value = false; // Cierra el modal después de actualizar
};

const filterUsers = () => {
  filteredUsers.value = users.value.filter(user => {
    const matchesArea = selectedArea.value ? user.area === selectedArea.value.nombre : true;
    const matchesRole = selectedRole.value ? user.rol === selectedRole.value : true;
    return matchesArea && matchesRole;
  });
};

const filterUsersByArea = () => {
  filterUsers();
};

const filterUsersByRole = () => {
  filterUsers();
};

const editUser = (user) => {
  selectedUser.value = { ...user }; // Copia el usuario seleccionado
  showUpdateUserForm.value = true; // Abre el modal de edición
};

onMounted(() => {
  fetchUsers();
  fetchAreas();
});
</script>

<style scoped>
.admi {
  padding: 1em;
}

.admi > button {
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
}

.admi > button:hover {
  background-color: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.filters {
  display: flex;
  gap: 1.5rem;
  margin: 2rem 0;
  align-items: center;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: darkgrey;
  color: #2c3e50;
  padding: 1rem 1.5rem;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem 1.5rem;
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

:deep(.p-button-info:hover) {
  background-color: #2980b9;
  border-color: #2980b9;
}

:deep(.p-button-danger) {
  background-color: #e74c3c;
  border-color: #e74c3c;
}

:deep(.p-button-danger:hover) {
  background-color: #c0392b;
  border-color: #c0392b;
}

:deep(.pi) {
  font-size: 1rem;
}

@media screen and (max-width: 768px) {
  .admi {
    padding: 1rem;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  :deep(.p-dropdown) {
    width: 100%;
  }
}
</style>