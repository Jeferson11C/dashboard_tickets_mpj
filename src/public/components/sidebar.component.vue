<template>
  <div class="sidebar">
    <h1>Bank Dashboard</h1>
    <p>Welcome, Agent</p>
    <div class="dropdown-container">
      <pv-input-group>
        <pv-input-group-addon>
          <i class="pi pi-map"></i>
        </pv-input-group-addon>
        <pv-dropdown v-model="selectedArea" :options="areas" optionLabel="label" placeholder="Select an Area" />
      </pv-input-group>
    </div>
  </div>
</template>

<script>
export default {
  name: "sidebar",
  data() {
    return {
      areas: [
        {label: "Rentas", value: "Rentas"},
        {label: "Secretariado", value: "Secretariado"},
        {label: "Informatica", value: "Informatica"}
      ],
      selectedArea: null
    };
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

.dropdown-container {
  border: 1px solid #ddd;
  padding: 1em;
  border-radius: 4px;
  background-color: skyblue;
  margin-top: 1em;
}
</style>