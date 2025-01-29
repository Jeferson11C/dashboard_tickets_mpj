<template>
  <div>
    <pv-card>
      <h3>Editar Usuario</h3>
      <form @submit.prevent="updateUser">
        <div class="form-group">
          <label for="nombre">Nombre</label>
          <input type="text" id="nombre" v-model="user.nombre" required />
        </div>
        <div class="form-group">
          <label for="apePaterno">Apellido Paterno</label>
          <input type="text" id="apePaterno" v-model="user.apePaterno" required />
        </div>
        <div class="form-group">
          <label for="apeMaterno">Apellido Materno</label>
          <input type="text" id="apeMaterno" v-model="user.apeMaterno" required />
        </div>
        <div class="form-group">
          <label for="username">Nombre de Usuario</label>
          <input type="text" id="username" v-model="user.username" required />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" v-model="user.password" required />
        </div>
        <div class="form-group">
          <label for="area">Área</label>
          <pv-input-group>
            <pv-dropdown id="area" v-model="user.area" :options="areas" optionLabel="nombre" placeholder="Seleccione un área" required />
          </pv-input-group>
        </div>
        <div class="form-group">
          <label for="rol">Rol</label>
          <pv-input-group>
            <pv-dropdown id="rol" v-model="user.rol" :options="roles" placeholder="Seleccione un rol" required />
          </pv-input-group>
        </div>
        <div class="form-button">
          <button type="submit">Guardar</button>
        </div>
      </form>
    </pv-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import UserApiService from '../services/user-api.service';

export default {
  name: 'editUser',
  props: {
    user: Object,
  },
  setup(props, { emit }) {
    const roles = ref(['Seleccione una opción', 'admi', 'user']);
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
      try {
        await UserApiService.updateUser(props.user);
        emit('userUpdated', props.user);
      } catch (error) {
        console.error('Error updating user:', error);
      }
    };

    onMounted(() => {
      fetchAreas();
    });

    return {
      roles,
      areas,
      updateUser,
    };
  },
};
</script>

<style scoped>
.pv-card {
  margin-bottom: 1em;
  padding: 1em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1em;
}

.form-group label {
  display: block;
  margin-bottom: 0.5em;
}

.form-group input,
.pv-input-group {
  width: 100%;
}

.form-button {
  text-align: right;
}

.form-button button {
  padding: 0.5em 1em;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.form-button button:hover {
  background-color: #2980b9;
}
</style>