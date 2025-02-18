<template>
  <div class="edit-user-modal">
    <h3>Editar Usuario</h3>
    <form @submit.prevent="updateUser">
      <div class="form-row">
        <div class="form-group">
          <label for="dni">DNI: </label>
          <input type="text" id="dni" v-model="user.dni" readonly />
        </div>
        <div class="form-group">
          <label for="nombreCompleto">Nombre Completo</label>
          <input type="text" id="nombreCompleto" v-model="user.nombreCompleto" readonly />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="username">Nombre de Usuario</label>
          <input type="text" id="username" v-model="user.username" required />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" v-model="user.password" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="area">Área</label>
          <div class="select-wrapper">
            <select v-model="user.area" required>
              <option v-for="area in areas" :key="area.nombre" :value="area.nombre">{{ area.nombre }}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="rol">Rol</label>
          <div class="select-wrapper">
            <select v-model="user.rol" required>
              <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="form-button">
        <button type="submit">Guardar</button>
        <button type="button" @click="closeModal">Cancelar</button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import UserApiService from '../services/user-api.service';
import WebSocketService from '../../shared/websocket.service';

export default {
  name: 'updateUser',
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  emits: ['userUpdated', 'closeModal'],
  setup(props, { emit }) {
    const roles = ref(['Seleccione una opción', 'Administrador', 'Recepcionista']);
    const areas = ref([]);
    const user = ref({ ...props.user });
    const webSocketService = new WebSocketService();
    webSocketService.connect();

    const fetchAreas = async () => {
      try {
        const response = await UserApiService.getAreas();
        areas.value = response.data;
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };

    const updateUser = async () => {
      if (!user.value.id) {
        console.error('User ID is missing');
        return;
      }
      try {
        const userData = {
          username: user.value.username,
          password: user.value.password,
          rol: user.value.rol,
          area: user.value.area,
          estado: user.value.estado || 'Activo',
        };
        console.log('Sending user data:', userData);
        await UserApiService.updateUser(user.value.id, userData);
        webSocketService.sendMessage(JSON.stringify({ event: 'userUpdated', data: userData }));
        emit('userUpdated', user.value);
      } catch (error) {
        console.error('Error updating user:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Validation errors:', error.response.data.errors);
        }
      }
    };

    const closeModal = () => {
      emit('closeModal');
    };

    watch(() => props.user, (newUser) => {
      if (newUser) {
        user.value = { ...newUser };
      }
    }, { immediate: true });

    onMounted(() => {
      fetchAreas();
    });

    return {
      roles,
      areas,
      user,
      updateUser,
      closeModal,
    };
  },
};
</script>

<style scoped>
.edit-user-modal {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.form-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #34495e;
}

.form-group input,
.pv-dropdown {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
}

.form-button {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.form-button button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.form-button button[type='submit'] {
  background-color: #3498db;
  color: white;
}

.form-button button[type='submit']:hover {
  background-color: #2980b9;
}

.form-button button[type='button'] {
  background-color: #e74c3c;
  color: white;
}

.form-button button[type='button']:hover {
  background-color: #c0392b;
}
</style>