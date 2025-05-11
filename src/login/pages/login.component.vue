<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-left">
        <div class="logo-container">
          <img src="../../assets/logo.png" alt="Logo Municipalidad" class="logo" />
        </div>
        <h2>MUNICIPALIDAD PROVINCIAL DE JAÉN</h2>
        <p class="tagline">Sistema de Atención de Tickets</p>
      </div>
      <div class="login-right">
        <div class="login-form-wrapper">
          <h1>INICIAR SESIÓN</h1>
          <form @submit.prevent="login" class="login-form">
            <div class="input-group" :class="{ 'input-error': dniError }">
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <input
                    type="text"
                    v-model="dni"
                    id="dni"
                    placeholder="DNI"
                    required
                    maxlength="8"
                    @input="validateNumericInput"
                    @focus="clearErrors"
                />
              </div>
              <small v-if="dniError" class="input-error-text">{{ dniError }}</small>
            </div>
            <div class="input-group" :class="{ 'input-error': passwordError }">
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="password"
                    id="password"
                    placeholder="Contraseña"
                    required
                    @focus="clearErrors"
                />
                <button type="button" class="toggle-password" @click="togglePasswordVisibility" tabindex="-1">
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
              <small v-if="passwordError" class="input-error-text">{{ passwordError }}</small>
            </div>

            <button type="submit" class="login-button" :disabled="isLoading">
              <span v-if="isLoading" class="loading-spinner"></span>
              <span v-else>INGRESAR</span>
            </button>

            <transition name="fade">
              <div v-if="errorMessage" class="error-alert">
                <div class="error-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <div class="error-text">{{ errorMessage }}</div>
                <button class="error-close" @click="errorMessage = ''">×</button>
              </div>
            </transition>
          </form>
        </div>
      </div>
    </div>
    <div class="copyright">© 2025 Municipalidad Provincial de Jaén - Todos los derechos reservados - JSCC</div>
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
      dniError: '',
      passwordError: '',
      showPassword: false,
      isLoading: false
    };
  },
  methods: {
    validateNumericInput() {
      this.dni = this.dni.replace(/[^0-9]/g, '');
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    clearErrors() {
      this.errorMessage = '';
      this.dniError = '';
      this.passwordError = '';
    },
    setCookie(name, value, days) {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
    },
    validateForm() {
      let isValid = true;

      if (this.dni.length !== 8) {
        this.dniError = 'El DNI debe contener 8 dígitos';
        isValid = false;
      }

      if (!this.password) {
        this.passwordError = 'Ingrese su contraseña';
        isValid = false;
      }

      return isValid;
    },
    async login() {
      this.clearErrors();

      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;

      try {
        const response = await LoginApiService.signIn(this.dni, this.password);
        const user = response.data;

        if (user && user.token && user.id && user.refreshToken) {
          const userInfoResponse = await UserApiService.fetchUserById(user.id);
          const userInfo = userInfoResponse.data;

          if (userInfo && userInfo.rol && userInfo.area) {
            if (userInfo.estado === 'Inactivo') {
              this.errorMessage = 'Usuario temporalmente inactivo';
              return;
            }

            localStorage.setItem('token', user.token);
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userRole', userInfo.rol);
            localStorage.setItem('userArea', userInfo.area);
            if (userInfo && userInfo.nombreCompleto) {
              localStorage.setItem('userFullName', userInfo.nombreCompleto);
            } else {
              console.error('User full name is missing');
            }

            // Guardar el refreshToken en una cookie
            this.setCookie('refreshToken', user.refreshToken, 7); // Guardar por 7 días

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
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
/* Estilos globales */
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: url('../../assets/fondo.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 20px;
}

.login-card {
  display: flex;
  background: white;
  border-radius: 20px;
  width: 980px;
  max-width: 100%;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
}

/* Panel izquierdo */
.login-left {
  background: linear-gradient(135deg, #0056a4, #003063);
  color: white;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 3em 2em;
  position: relative;
}

.logo-container {
  background: white;
  border-radius: 50%;
  width: 130px;
  height: 130px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border: 4px solid rgba(255, 255, 255, 0.2);
  padding: 5px;
}

.login-left .logo {
  max-width: 85px;
  transition: transform 0.3s ease;
}

.logo-container:hover .logo {
  transform: scale(1.05);
}

.login-left h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5em;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.tagline {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Panel derecho */
.login-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2.5em;
  background-color: #fff;
}

.login-form-wrapper {
  width: 100%;
  max-width: 350px;
}

h1 {
  font-size: 1.8rem;
  margin-bottom: 1.5em;
  text-align: center;
  font-weight: 700;
  position: relative;
}

h1::after {
  content: '';
  position: absolute;
  width: 60px;
  height: 4px;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 2px;
}

/* Formulario */
.input-group {
  margin-bottom: 1.5em;
}

.input-wrapper {
  position: relative;
  transition: all 0.3s ease;
}

input {
  width: 100%;
  padding: 0.9em 1em 0.9em 3em;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 86, 164, 0.1);
  background-color: #fff;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #757575;
  transition: color 0.3s ease;
}

input:focus + .input-icon {
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #757575;
  cursor: pointer;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
}

.login-button {
  width: 100%;
  padding: 1em;
  background: blue;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.login-button:hover {
  background: darkblue;
  box-shadow: 0 6px 12px rgba(0, 86, 164, 0.2);
  transform: translateY(-2px);
}

.login-button:active {
  transform: translateY(0);
  box-shadow: 0 3px 6px rgba(0, 86, 164, 0.2);
}

.login-button:disabled {
  background: #b0b0b0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Estilo para el spinner de carga */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Estilos de error */
.input-error input {
  background-color: rgba(244, 67, 54, 0.05);
}

.input-error-text {
  font-size: 0.8rem;
  margin-top: 5px;
  display: block;
  padding-left: 10px;
}

.error-alert {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-top: 20px;
  background-color: #ffebee;
  border-radius: 8px;
  color: #d32f2f;
  font-size: 0.9rem;
}

.error-icon {
  margin-right: 10px;
  display: flex;
}

.error-text {
  flex-grow: 1;
}

.error-close {
  background: none;
  border: none;
  color: #888;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin-left: 10px;
  line-height: 1;
}

.error-close:hover {
  color: #333;
}


/* Copyright */
.copyright {
  position: absolute;
  bottom: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  text-align: center;
  width: 100%;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Responsive */
@media (max-width: 900px) {
  .login-card {
    width: 90%;
    max-width: 500px;
    flex-direction: column;
    height: auto;
  }

  .login-left {
    padding: 2em 1.5em;
  }

  .login-right {
    padding: 2em 1.5em;
  }

  .logo-container {
    width: 100px;
    height: 100px;
    margin-bottom: 1rem;
  }

  .login-left .logo {
    max-width: 65px;
  }

  .login-left h2 {
    font-size: 1.4rem;
  }

  .tagline {
    font-size: 0.9rem;
  }

  h1 {
    font-size: 1.5rem;
    margin-top: 0;
    margin-bottom: 1.2em;
  }

  .input-group {
    margin-bottom: 1.2em;
  }
}

</style>