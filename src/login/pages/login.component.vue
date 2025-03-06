<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-left">
        <div class="logo-container">
          <img src="../../assets/logo.png" alt="Logo Municipalidad" class="logo" />
        </div>
        <h2>MUNICIPALIDAD PROVINCIAL DE JAÉN</h2>
        <p class="tagline">Sistema de Atencion de Tickets</p>
      </div>
      <div class="login-right">
        <div class="login-form-wrapper">
          <h1>INICIAR SESIÓN</h1>
          <form @submit.prevent="login" class="login-form">
            <div class="input-group">
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <input type="text" v-model="dni" id="dni" placeholder="DNI" required maxlength="8" @input="validateNumericInput"/>
              </div>
            </div>
            <div class="input-group">
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input :type="showPassword ? 'text' : 'password'" v-model="password" id="password" placeholder="Contraseña" required/>
                <button type="button" class="toggle-password" @click="togglePasswordVisibility" tabindex="-1">
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>
            <button type="submit" class="login-button">
              INGRESAR
            </button>
            <p v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoginApiService from '../services/login-api.service';
import UserApiService from '../../administrador/services/user-api.service';

export default {
  name: "login",
  data() {
    return {
      dni: '',
      password: '',
      errorMessage: '',
      showPassword: false
    };
  },
  methods: {
    validateNumericInput() {
      // Replace any non-numeric characters
      this.dni = this.dni.replace(/[^0-9]/g, '');
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async login() {
      try {
        if (this.dni.length !== 8) {
          this.errorMessage = 'El DNI debe contener 8 dígitos';
          return;
        }

        const response = await LoginApiService.signIn(this.dni, this.password);
        const user = response.data;

        if (user && user.token && user.id) {
          const userInfoResponse = await UserApiService.fetchUserById(user.id);
          const userInfo = userInfoResponse.data;

          if (userInfo && userInfo.rol && userInfo.area) {
            if (userInfo.estado === 'Inactivo') {
              this.errorMessage = 'Usuario temporalmente inactivo';
              return;
            }

            localStorage.setItem('token', user.token);
            localStorage.setItem('accessToken', user.token);
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userRole', userInfo.rol);
            localStorage.setItem('userArea', userInfo.area);
            if (userInfo && userInfo.nombreCompleto) {
              localStorage.setItem('userFullName', userInfo.nombreCompleto);
            } else {
              console.error('User full name is missing');
            }

            console.log('User logged in successfully');

            this.$emit('user-logged-in', user);
            this.$router.push({name: 'home'});
          } else {
            throw new Error('Invalid user info');
          }
        } else {
          throw new Error('Invalid user data');
        }
      } catch (error) {
        console.error('Error during login:', error);
        if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = 'DNI o contraseña incorrectos';
        }
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url('../../assets/fondo.jpg');
  background-size: cover;
  background-position: center;

}

.login-card {
  display: flex;
  background: white;
  border-radius: 16px;
  width: 900px;
  max-width: 95%;
  height: 500px;
}

.login-left {
  background: linear-gradient(to bottom right, #0056a4, #003e7e);
  color: white;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2em;
}

.logo-container {
  background: white;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-left .logo {
  max-width: 80px;
}

.login-left h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5em;
}

.tagline {
  color: rgba(255,255,255,0.7);
  font-size: 1rem;
}

.login-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2em;
}

.login-form-wrapper {
  width: 100%;
  max-width: 350px;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1.5em;
  color: #333;
  text-align: center;
}

.input-group {
  margin-bottom: 1.2em;
}

.input-wrapper {
  position: relative;
}

input {
  width: 100%;
  padding: 0.8em 1em;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;

}

input:focus {
  outline: none;
  border-color: #0056a4;
  box-shadow: 0 0 0 3px rgba(0,86,164,0.1);
}

.login-button {
  width: 100%;
  padding: 0.9em;
  background: linear-gradient(to right, #007bff, #0056a4);
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-transform: uppercase;
}

.login-button:hover {
  background: linear-gradient(to right, #0056a4, #003e7e);
  box-shadow: 0 6px 8px rgba(0,0,0,0.15);
}

.error-message {
  color: #dc3545;
  margin-top: 1em;
  text-align: center;
  font-size: 1rem;
}
.input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
}

input {
  padding-left: 40px;
  width: 100%;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
}
</style>