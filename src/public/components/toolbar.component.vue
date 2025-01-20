<template>
  <div class="toolbar">
    <div class="title">DASHBOARD MUNI JAEN</div>
    <button @click="logout" class="logout-button">Salir</button>
  </div>
</template>

<script>
export default {
  name: "toolbar",
  methods: {
    logout() {
      // Lógica para cerrar sesión
      console.log("Logout clicked");
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  background-color: #2c3e50;
  border-bottom: 1px solid #ddd;
  color: #fff;
}
.title {
  font-size: 1.5em;
}
.logout-button {
  padding: 0.5em 1em;
  font-size: 1em;
  cursor: pointer;
}
</style>