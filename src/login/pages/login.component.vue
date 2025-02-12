<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-left">
        <img src="https://apps.munijaen.gob.pe/intranet/images/logo.png?n=Vs.024" alt="Logo Municipalidad" class="logo" />
        <h2>MUNICIPALIDAD PROVINCIAL DE JAÉN</h2>
      </div>
      <div class="login-right">
        <h1>INICIAR SESIÓN</h1>
        <form @submit.prevent="login">
          <div class="input-group">
            <label for="username">Nombre de usuario</label>
            <input type="text" v-model="username" id="username" required />
          </div>
          <div class="input-group">
            <label for="password">Contraseña</label>
            <input type="password" v-model="password" id="password" required />
          </div>
          <button type="submit" class="login-button">INGRESAR</button>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </form>
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
      username: '',
      password: '',
      errorMessage: ''
    };
  },
  methods: {
    async login() {
      try {
        const response = await LoginApiService.signIn(this.username, this.password);
        const user = response.data;

        if (user && user.token && user.id) {
          localStorage.setItem('token', user.token);
          localStorage.setItem('userId', user.id);

          const userInfoResponse = await UserApiService.fetchUserById(user.id);
          const userInfo = userInfoResponse.data;

          if (userInfo && userInfo.rol && userInfo.area) {
            localStorage.setItem('userRole', userInfo.rol);
            localStorage.setItem('userArea', userInfo.area);
            localStorage.setItem('userFullName', userInfo.nombreCompleto);
            localStorage.setItem('userUserName', userInfo.username); // Store the username

            console.log('User logged in successfully');

            this.$emit('user-logged-in', user);
            this.$router.push({ name: 'home' });
          } else {
            throw new Error('Invalid user info');
          }
        } else {
          throw new Error('Invalid user data');
        }
      } catch (error) {
        console.error('Error during login:', error);
        this.errorMessage = 'Nombre de usuario o contraseña incorrectos';
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
  background-color: #f4f4f4;
}

.login-card {
  display: flex;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 800px;
  max-width: 90%;
}

.login-left {
  background-color: #0056a4;
  color: #fff;
  padding: 2em;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.login-left .logo {
  max-width: 100px;
  margin-bottom: 1em;
}

.login-left h2 {
  font-size: 1.5rem;
  line-height: 1.4;
}

.login-right {
  flex: 1;
  padding: 2em;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 1.5em;
  color: #333;
  text-align: center;
}

.input-group {
  margin-bottom: 1em;
}

label {
  display: block;
  margin-bottom: 0.5em;
  font-weight: bold;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75em;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.login-button {
  width: 100%;
  padding: 0.75em;
  background: linear-gradient(to right, #007bff, #0056a4);
  color: #fff;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-transform: uppercase;
}

.login-button:hover {
  background: linear-gradient(to right, #0056a4, #003e7e);
}
.error-message {
  color: red;
  margin-top: 1em;
  text-align: center;
}

</style>