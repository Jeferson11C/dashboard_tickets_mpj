<template>
  <div class="user-create">
    <div class="form-container">
      <h2 class="title">Crear Usuario</h2>
      <form @submit.prevent="createUser">
        <div class="form-grid">
          <div class="form-group">
            <label for="dni">DNI</label>
            <div class="input-wrapper">
              <input type="text" id="dni" v-model="user.dni" @input="validateDNI" placeholder="Ingrese DNI" :class="{ 'error': dniError }" required/>
              <span v-if="dniError" class="error-message">DNI inválido</span>
            </div>
          </div>

          <div class="form-group">
            <label for="nombre">Nombre</label>
            <div class="input-wrapper">
              <input type="text" id="nombre" v-model="user.nombre" placeholder="Nombre" readonly required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="apePaterno">Apellido Paterno</label>
            <div class="input-wrapper">
              <input type="text" id="apePaterno" v-model="user.apePaterno" placeholder="Apellido Paterno" readonly required/>
            </div>
          </div>

          <div class="form-group">
            <label for="apeMaterno">Apellido Materno</label>
            <div class="input-wrapper">
              <input type="text" id="apeMaterno" v-model="user.apeMaterno" placeholder="Apellido Materno" readonly required/>
            </div>
          </div>

          <div class="form-group">
            <label for="username">Nombre de Usuario</label>
            <div class="input-wrapper">
              <input type="text" id="username" v-model="user.username" placeholder="Nombre de usuario" @input="validateUsername" required/>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-wrapper">
              <input type="password" id="password" v-model="user.password" placeholder="Contraseña" required/>
            </div>
          </div>

          <div class="form-group">
            <label for="area">Área</label>
            <div class="select-wrapper">
              <select id="area" v-model="user.area" required>
                <option v-for="area in areas" :key="area.nombre" :value="area.nombre">
                  {{ area.nombre }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="rol">Rol</label>
            <div class="select-wrapper">
              <select id="rol" v-model="user.rol" required>
                <option v-for="role in roles" :key="role" :value="role">
                  {{ role }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-button">
            Crear Usuario
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import useUserCreate from '../scripts/userCreate.script.js';

export default {
  name: 'UserCreate',
  setup() {
    return useUserCreate();
  }
};
</script>

<style scoped>
.user-create {
  min-height: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
}

.form-container {
  width: 100%;
  max-width: 900px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
}

.title {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #4b5563;
  font-size: 0.875rem;
  font-weight: 500;
}

.input-wrapper {
  position: relative;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background-color: white;
}

input:focus, select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input::placeholder {
  color: #9ca3af;
}

input.error {
  border-color: #ef4444;
}

.error-message {
  position: absolute;
  bottom: -1.25rem;
  left: 0;
  color: #ef4444;
  font-size: 0.75rem;
}

.select-wrapper {
  position: relative;
}

.select-wrapper::after {
  content: '';
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #6b7280;
  pointer-events: none;
}

select {
  appearance: none;
  padding-right: 2.5rem;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.submit-button {
  padding: 0.75rem 2.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 200px;
}

.submit-button:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.submit-button:active {
  transform: translateY(0);
}

</style>