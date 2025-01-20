<template>
  <div class="app-container">
    <Sidebar />
    <div class="main-content">
      <Toolbar />
      <router-view /> <!-- Aquí se mostrará el contenido de cada página -->
    </div>
  </div>
</template>

<script setup>
import Toolbar from './public/components/toolbar.component.vue'
import Sidebar from './public/components/sidebar.component.vue'
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto; /* Asegura que el contenido sea desplazable si es necesario */
}

.main-content > *:not(:first-child) {
  flex: 1;
  overflow: auto; /* Asegura que el contenido de las páginas sea desplazable si es necesario */
}
</style>