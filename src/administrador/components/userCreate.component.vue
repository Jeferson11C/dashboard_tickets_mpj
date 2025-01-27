<template>
  <div class="user-create">
    <h2>Crear Usuario</h2>
    <form @submit.prevent="createUser">
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
        <button type="submit">Crear</button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import UserApiService from '../services/user-api.service';

export default {
  name: 'UserCreate',
  setup() {
    const user = ref({
      nombre: '',
      apePaterno: '',
      apeMaterno: '',
      username: '',
      password: '',
      area: null,
      rol: null
    });

    const areas = ref([{ nombre: 'Seleccione una opción', id: null }]);
    const roles = ref(['Seleccione una opción', 'admi', 'user']);

    const fetchAreas = async () => {
      try {
        const response = await UserApiService.getAreas();
        areas.value = areas.value.concat(response.data);
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };

    onMounted(() => {
      fetchAreas();
    });

    return {
      user,
      areas,
      roles,
      fetchAreas
    };
  },
  methods: {
    async createUser() {
      const requestData = {
        nombre: this.user.nombre,
        apePaterno: this.user.apePaterno,
        apeMaterno: this.user.apeMaterno,
        username: this.user.username,
        password: this.user.password,
        area: this.user.area.nombre, // Extract the nombre from the area object
        rol: this.user.rol
      };

      try {
        console.log('User data being sent:', requestData); // Log the user data
        const response = await UserApiService.createUser(requestData);
        const newUser = response.data;

        this.$emit('userCreated', newUser); // Emit an event with the new user data

        this.user.id = newUser.id;
        this.user.nombre = newUser.nombre;
        this.user.apePaterno = newUser.apePaterno;
        this.user.apeMaterno = newUser.apeMaterno;
        this.user.username = newUser.username;
        this.user.password = newUser.password;
        this.user.area = newUser.area;
        this.user.rol = newUser.rol;

        console.log('User created successfully');
      } catch (error) {
        console.error('Error creating user:', error);
      }

      this.user.nombre = '';
      this.user.apePaterno = '';
      this.user.apeMaterno = '';
      this.user.username = '';
      this.user.password = '';
      this.user.area = null;
      this.user.rol = null;
    }
  }
};
</script>

<style scoped>
.user-create {
  padding: 1em;
}

form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1em;
  align-items: center;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.5em;
}

input, .p-dropdown {
  width: 100%;
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.p-dropdown-panel {
  z-index: 1000 !important;
}

.form-button {
  grid-column: span 2;
  display: flex;
  justify-content: center;
}

button {
  padding: 0.5em 1em;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #2980b9;
}
</style>