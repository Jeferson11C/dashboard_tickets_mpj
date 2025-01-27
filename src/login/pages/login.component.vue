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
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import LoginApiService from '../services/login-api.service';

export default {
  name: "login",
  data() {
    return {
      username: '',
      password: '',
      users: []
    };
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await LoginApiService.fetchUsers();
        this.users = response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    async login() {
      const user = this.users.find(user => user.username === this.username && user.password === this.password);
      if (user) {
        console.log('Login successful:', user);
        this.$emit('user-logged-in', user);
        this.$router.push({ name: 'home' });
      } else {
        console.error('Invalid username or password');
      }
    }
  },
  mounted() {
    this.fetchUsers();
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
</style>