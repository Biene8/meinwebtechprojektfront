<template>
  <div class="start-page">
    <h1>Willkommen beim Gym Tracker!</h1>
    <p>Verfolge deine Fortschritte und bleibe motiviert.</p>
    <div class="button-container">
      <router-link to="/training" class="button start-training-button">Training starten</router-link>
      <router-link to="/history" class="button view-history-button">Trainings einsehen</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StartPage'
}
</script>

<style scoped>
.start-page {
  text-align: center;
  padding: 50px 20px;
  background-color: #f4f4f4;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h1 {
  color: #2c3e50;
  font-size: 2.5em;
  margin-bottom: 20px;
}

p {
  color: #555;
  font-size: 1.2em;
  margin-bottom: 40px;
}

.button-container {
  display: flex;
  gap: 20px;
}

.button {
  display: inline-block;
  padding: 15px 30px;
  font-size: 1.1em;
  font-weight: bold;
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.button:hover {
  transform: translateY(-2px);
}

.start-training-button {
  background-color: #4CAF50; /* Grünton */
  color: white;
  border: none;
}

.start-training-button:hover {
  background-color: #45a049;
}

.view-history-button {
  background-color: #008CBA; /* Blauton */
  color: white;
  border: none;
}

.view-history-button:hover {
  background-color: #007B9E;
}
</style>