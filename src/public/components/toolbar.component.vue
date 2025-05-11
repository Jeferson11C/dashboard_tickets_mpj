<template>
  <div class="toolbar">
    <div class="toolbar-content">
      <div class="municipality-logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
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
        <button class="menu-toggle" @click="toggleMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
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
  data() {
    return {
      menuOpen: false
    };
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
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
      this.$emit('toggle-menu', this.menuOpen);
    }
  }
}
</script>

<style scoped>
.toolbar {
  width: 100%;
  background: linear-gradient(to right, #12467a, #2980b9);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
}

.toolbar-content {
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.5rem;
}

.municipality-logo {
  display: flex;
  align-items: center;
  margin-right: 1rem;
}

.municipality-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  flex-grow: 1;
}

.user-container {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 0.5rem 1rem;
  gap: 1rem;
  transition: all 0.3s ease;
}

.user-container:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffffff;
  color: #12467a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
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
  font-size: 0.8rem;
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

.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.menu-toggle:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .municipality-title {
    font-size: 1.1rem;
  }

  .toolbar-content {
    padding: 0.8rem 1rem;
  }

  .user-container {
    padding: 0.4rem 0.8rem;
  }

  .meta-text {
    display: none;
  }

  .meta-divider {
    display: none;
  }

  .user-meta {
    gap: 0.8rem;
  }
}

@media (max-width: 576px) {
  .municipality-title {
    font-size: 0.9rem;
  }

  .avatar {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }

  .user-name {
    font-size: 0.85rem;
  }

  .user-info {
    display: none;
  }

  .menu-toggle {
    display: block;
  }
}

@media (max-width: 400px) {
  .municipality-title {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>