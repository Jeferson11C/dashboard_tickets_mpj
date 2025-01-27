<template>
  <div class="sidebar">
    <h1>MPJ Dashboard</h1>
    <p>Welcome, Agent</p>
    <button @click="goToTicketPanel">ticket</button>
    <button @click="goToAttentionPanel">Panel de Atención</button>
    <button @click="goToAdminPanel">Administrador</button>
  </div>
</template>

<script>
export default {
  name: "sidebar",
  methods: {
    goToTicketPanel() {
      this.$router.push({ path: '/home' });
    },
    goToAttentionPanel() {
      this.$router.push({ path: '/panel' });
    },
    goToAdminPanel() {
      this.$router.push({ path: '/administrador' });
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #2c3e50;
  padding: 1em;
  border-right: 1px solid #ddd;
  height: 100vh;
  color: #fff;
}

button {
  display: block;
  width: 100%;
  margin: 1em 0;
  padding: 0.5em;
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