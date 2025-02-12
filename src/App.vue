<template>
  <div class="app-container">
    <Sidebar v-if="showSidebar" />
    <div class="main-content">
      <Toolbar v-if="showToolbar" :user="user" />
      <router-view @user-logged-in="updateUser" /> <!-- Listen for the user-logged-in event -->
    </div>
  </div>
</template>

<script setup>
import {computed, ref, watchEffect} from 'vue';
import {useRoute} from 'vue-router';
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

<style scoped>
.app-container {
  display: flex;
  height: 98vh;
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