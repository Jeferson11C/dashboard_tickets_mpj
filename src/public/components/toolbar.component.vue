<template>
  <div class="toolbar">
    <div class="title">DASHBOARD MUNI JAEN</div>
    <div v-if="user" class="user-info">
      <span>{{ user.nombreCompleto }} - {{ user.area }}</span>
    </div>
    <button @click="logout" class="logout-button">Salir</button>
  </div>
</template>

<script>
export default {
  name: "toolbar",
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  methods: {
    logout() {
      this.$emit('user-logged-out');
      this.$router.push({ name: 'login' });
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

.user-info {
  color: #fff;
}

.logout-button {
  padding: 0.5em 1em;
  font-size: 1em;
  cursor: pointer;
}
</style>