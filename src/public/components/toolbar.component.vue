<template>
  <div class="toolbar">
    <div class="title">Municipalidad de Jaén</div>
    <div v-if="user" class="user-info">
      <span>
        <span>🙍‍♂️</span> {{ user.nombreCompleto }}
        <span>🏢</span> {{ user.area }}
        <span>🪪</span> {{ user.rol }}
      </span>
      <log-out @user-logged-out="handleLogout"></log-out>
    </div>
  </div>
</template>

<script>
import logOut from '../../login/Component/logOut.vue';

export default {
  name: "Toolbar",
  components: {
    logOut
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleLogout() {
      this.$emit('user-logged-out');
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em 2em;
  background-color: #2c3e50;
  border-bottom: 1px solid #34495e;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 80px;
}

.title {
  font-size: 1.5em;
  font-weight: bold;
  letter-spacing: 1px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1em;
  font-size: 0.9em;
}

.user-info span {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 1em;
  }

  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5em;
    margin-top: 0.5em;
  }
}
</style>