<template>
  <div class="edit-user-modal">
    <h3>Editar Usuario</h3>
    <form @submit.prevent="updateUser">
      <div class="form-row">
        <div class="form-group">
          <label for="nombre">Nombre</label>
          <input type="text" id="nombre" v-model="user.nombre" @input="validateLettersAndSpaces($event, 'nombre')" required />
        </div>
        <div class="form-group">
          <label for="apePaterno">Apellido Paterno</label>
          <input type="text" id="apePaterno" v-model="user.apePaterno" @input="validateLettersAndSpaces($event, 'apePaterno')" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="apeMaterno">Apellido Materno</label>
          <input type="text" id="apeMaterno" v-model="user.apeMaterno" @input="validateLettersAndSpaces($event, 'apeMaterno')" required />
        </div>
        <div class="form-group">
          <label for="username">Nombre de Usuario</label>
          <input type="text" id="username" v-model="user.username"  required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" v-model="user.password" required />
        </div>
        <div class="form-group">
          <label for="area">Área</label>
          <pv-dropdown id="area" v-model="user.area" :options="areas" optionLabel="nombre" placeholder="Seleccione un área" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="rol">Rol</label>
          <pv-dropdown id="rol" v-model="user.rol" :options="roles" placeholder="Seleccione un rol" required />
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
import { ref, onMounted } from 'vue';
import UserApiService from '../services/user-api.service';

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

    const fetchAreas = async () => {
      try {
        const response = await UserApiService.getAreas();
        areas.value = response.data;
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };

    const updateUser = async () => {
      console.log('User object:', props.user); // Verify that the ID is present
      if (!props.user.id) {
        console.error('User ID is missing');
        return;
      }
      try {
        const userData = {
          Id: props.user.id,
          Nombre: props.user.nombre,
          ApePaterno: props.user.apePaterno,
          ApeMaterno: props.user.apeMaterno,
          Username: props.user.username,
          Password: props.user.password,
          Rol: props.user.rol,
          Area: props.user.area?.nombre || '', // Send only the area name as a string
        };
        console.log('Sending user data:', userData); // Verify the data being sent
        await UserApiService.updateUser(props.user.id, userData); // Pass the ID and data
        emit('userUpdated', props.user);
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

    const validateLettersAndSpaces = (event, field) => {
      const regex = /^[A-Za-z\s]*$/;
      if (!regex.test(event.target.value)) {
        props.user[field] = event.target.value.replace(/[^A-Za-z\s]/g, '');
      }
    };

    const validateUsername = (event) => {
      const regex = /^[A-Za-z0-9]*$/;
      if (!regex.test(event.target.value)) {
        props.user.username = event.target.value.replace(/[^A-Za-z0-9]/g, '');
      }
    };

    onMounted(() => {
      fetchAreas();
    });

    return {
      roles,
      areas,
      updateUser,
      closeModal,
      validateLettersAndSpaces,
      validateUsername,
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