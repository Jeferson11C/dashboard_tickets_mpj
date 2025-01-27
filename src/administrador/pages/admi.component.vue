<template>
  <div class="admi">
    <h1>Panel de Administrador</h1>
    <p>¡Bienvenido, Administrador!</p>
    <button @click="toggleCreateUserForm">Crear Usuario</button>
    <userCreate v-if="showCreateUserForm" @userCreated="addUserToList" />
    <h2>Lista de Usuarios</h2>
    <div class="card">
      <pv-data-table :value="users" tableStyle="min-width: 50rem">
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

const showCreateUserForm = ref(false);
const users = ref([]);

const toggleCreateUserForm = () => {
  showCreateUserForm.value = !showCreateUserForm.value;
};

const fetchUsers = async () => {
  try {
    const response = await UserApiService.fetchUsers();
    users.value = response.data;
    console.log('Usuarios obtenidos:', users.value);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const deleteUser = async (id) => {
  try {
    await UserApiService.deleteUser(id);
    users.value = users.value.filter(user => user.id !== id);
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

const addUserToList = (newUser) => {
  users.value.push(newUser);
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.admi {
  padding: 1em;
}

button {
  padding: 0.5em;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #2980b9;
}

.p-button-info {
  background-color: #3498db;
  border-color: #3498db;
}

.p-button-info:hover {
  background-color: #2980b9;
  border-color: #2980b9;
}

.p-button-danger {
  background-color: #e74c3c;
  border-color: #e74c3c;
}

.p-button-danger:hover {
  background-color: #c0392b;
  border-color: #c0392b;
}
</style>