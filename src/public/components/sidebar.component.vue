<template>
  <div class="sidebar">
    <h1>MPJ Dashboard</h1>
    <p>Welcome, Agent</p>

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

</style>