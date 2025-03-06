<template>
  <div class="app-container">
    <Sidebar v-if="showSidebar" />
    <div class="main-content">
      <Toolbar v-if="showToolbar" :user="user" />
      <router-view @user-logged-in="updateUser" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import Toolbar from './public/components/toolbar.component.vue';
import Sidebar from './public/components/sidebar.component.vue';

const route = useRoute();
const showSidebar = computed(() => route.path !== '/');
const showToolbar = computed(() => route.path !== '/');

const user = ref({
  id: localStorage.getItem('userId'),
  nombreCompleto: localStorage.getItem('userFullName'),
  area: localStorage.getItem('userArea'),
  rol: localStorage.getItem('userRole')
});

function updateUser() {
  user.value = {
    id: localStorage.getItem('userId'),
    nombreCompleto: localStorage.getItem('userFullName'),
    area: localStorage.getItem('userArea'),
    rol: localStorage.getItem('userRole')
  };
}

watchEffect(() => {
  user.value = {
    id: localStorage.getItem('userId'),
    nombreCompleto: localStorage.getItem('userFullName'),
    area: localStorage.getItem('userArea'),
    rol: localStorage.getItem('userRole')
  };
});
</script>

<style>
:root {
  height: 100%;
  width: 100%;
}

html, body {
  height: 100%;
  margin: 0;
}

#app {
  height: 100%;
}
</style>

<style scoped>
.app-container {
  display: flex;
  height: 100vh; /* Toma toda la altura de la pantalla */
  width: 100%;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto; /* Hide overflow for the main content */
}

.main-content > *:not(:first-child) {
  flex: 1;
  overflow: auto; /* Asegura que el contenido de las páginas sea desplazable si es necesario */
  scrollbar-width: thin;
}


</style>
