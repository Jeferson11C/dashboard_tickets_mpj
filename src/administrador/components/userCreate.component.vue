<template>
  <div class="create-user-modal">
    <div class="modal-header">
      <h3>Crear Usuario</h3>
    </div>

    <form @submit.prevent="createUser">
      <!-- Información Personal -->
      <h4>Información Personal</h4>
      <div class="form-row">
        <div class="form-group">
          <label for="dni">DNI</label>
          <input type="text" id="dni" v-model="user.dni" @input="validateDNI" placeholder="Ingrese DNI" :class="{ 'error': dniError }" required />
          <span v-if="dniError" class="error-message">DNI inválido</span>
        </div>
        <div class="form-group">
          <label for="nombre">Nombre</label>
          <input type="text" id="nombre" v-model="user.nombre" placeholder="Nombre" readonly required />
        </div>
        <div class="form-group">
          <label for="apePaterno">Apellido Paterno</label>
          <input type="text" id="apePaterno" v-model="user.apePaterno" placeholder="Apellido Paterno" readonly required />
        </div>
        <div class="form-group">
          <label for="apeMaterno">Apellido Materno</label>
          <input type="text" id="apeMaterno" v-model="user.apeMaterno" placeholder="Apellido Materno" readonly required />
        </div>
      </div>

      <!-- Credenciales de Acceso -->
      <h4>Credenciales de Acceso</h4>
      <div class="form-row">
        <div class="form-group">
          <label for="ventanilla">Ventanilla</label>
          <input type="text" id="ventanilla" v-model="user.ventanilla" @input="validateVentanilla" required />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="password-field">
            <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="user.password"
                required
            />
            <button type="button" class="show-password" @click="showPassword = !showPassword">
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Permisos del Sistema -->
      <h4>Permisos del Sistema</h4>
      <div class="form-row">
        <div class="form-group">
          <label for="area">Área</label>
          <select id="area" v-model="user.area" required>
            <option disabled value="">Seleccione un área</option>
            <option v-for="area in areas" :key="area.nombre" :value="area.nombre">{{ area.nombre }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="rol">Rol</label>
          <select id="rol" v-model="user.rol" required>
            <option disabled value="">Seleccione un rol</option>
            <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
          </select>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="button-group">
        <button type="button" class="btn-cancel" @click="closeModal">
          Cancelar
        </button>
        <button type="submit" class="btn-save">
          Guardar
        </button>
      </div>
    </form>
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
.create-user-modal {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 0 auto; /* Center the modal */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

h4 {
  margin: 20px 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  border-left: 3px solid #3498db;
  padding-left: 10px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
}

.form-group input[readonly] {
  background-color: #f9f9f9;
  color: #777;
}


.password-field {
  position: relative;
}

.show-password {
  position: absolute;
  right: 10px;
  top: 8px;
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 12px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.btn-save,
.btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.btn-save {
  background-color: #3498db;
  color: white;
}

.btn-save:hover {
  background-color: #2980b9;
}

.btn-cancel {
  background-color: #f1f2f6;
  color: #333;
}

.btn-cancel:hover {
  background-color: #dfe4ea;
}

/* Desactivar el icono de ojo en navegadores basados en WebKit (Chrome, Safari, etc.) */
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .button-group {
    flex-direction: column-reverse;
  }

  .btn-save,
  .btn-cancel {
    width: 100%;
  }
}
</style>