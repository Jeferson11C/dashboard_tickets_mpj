<template>
  <div class="toolbar">
    <div class="municipality-title">Municipalidad Provincial de Jaén</div>
    <div v-if="user" class="user-container">
      <div class="avatar">
        {{ getInitials(user.nombreCompleto) }}
      </div>
      <div class="user-info">
        <div class="user-name">{{ user.nombreCompleto }}</div>
        <div class="user-meta">
          <div class="meta-item">
            <span class="meta-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <span class="meta-text">{{ user.rol }}</span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="meta-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </span>
            <span class="meta-text">{{ user.area }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Toolbar",
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  methods: {
    getInitials(name) {
      if (!name) return "JS";
      return name
          .split(' ')
          .map(part => part.charAt(0))
          .join('')
          .toUpperCase()
          .substring(0, 2);
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  background: linear-gradient(to right, #1e4d7a, #2980b9);
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.municipality-title {
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.user-container {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 0.5rem 1rem;
  gap: 1rem;
  transition: background-color 0.2s ease;
}

.user-container:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: #ffffff;
  color: #171617;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.35rem;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
}

.meta-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
}

.meta-text {
  white-space: nowrap;
}

.meta-divider {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
}

</style>

