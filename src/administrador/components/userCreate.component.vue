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
    const roles = ref(['Seleccione una opción', 'Administrador', 'Recepcionista']);

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
  background-color: lightgrey;
}
.user-create {
  max-width: 700px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-create h2 {
  color: #2c3e50;
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 500;
}

form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

label {
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: 500;
}

input {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: #fff;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Estilos mejorados para los dropdowns */
:deep(.p-dropdown) {
  height: 2.3rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s;
}

:deep(.p-dropdown:not(.p-disabled)) {
  background: #fff;
}

:deep(.p-dropdown:not(.p-disabled):hover) {
  border-color: #cbd5e1;
}

:deep(.p-dropdown:not(.p-disabled).p-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

:deep(.p-dropdown-label) {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #4a5568;
  background: #fff;
}

:deep(.p-dropdown-label.p-placeholder) {
  color: #94a3b8;
}

:deep(.p-dropdown-trigger) {
  width: 2.3rem;
  background: transparent;
  padding: 0 0.5rem;
}

:deep(.p-dropdown-trigger-icon) {
  color: #64748b;
}

:deep(.p-dropdown-panel) {
  background: #fff;
  border: none;
  border-radius: 6px;
  margin-top: 4px;
  padding: 0.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

:deep(.p-dropdown-items-wrapper) {
  max-height: 200px;
}

:deep(.p-dropdown-items) {
  padding: 0.25rem;
}

:deep(.p-dropdown-item) {
  margin: 0.125rem 0;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #4a5568;
  transition: all 0.2s;
}

:deep(.p-dropdown-item:hover) {
  background-color: #f1f5f9;
  color: #2563eb;
}

:deep(.p-dropdown-item.p-highlight) {
  background-color: #e0e7ff;
  color: #2563eb;
}

.form-button {
  grid-column: span 2;
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 2rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  background-color: #2563eb;
}

/* Responsive */
@media screen and (max-width: 640px) {
  .user-create {
    margin: 1rem;
    padding: 1rem;
  }

  form {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .form-button {
    grid-column: 1;
    margin-top: 0.75rem;
  }
}
</style>