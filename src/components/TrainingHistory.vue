<template>
  <div class="training-history">
    <button @click="goToStartPage" class="button nav-button">Zur Startseite</button>
    <h1>Vergangene Trainingseinheiten</h1>
    <p v-if="trainingSessions.length === 0">Noch keine Trainingseinheiten vorhanden.</p>
    <ul v-else>
      <li v-for="session in trainingSessions" :key="session.id" class="training-session-item">
        <h3>Training vom {{ formatDate(session.startTime) }}</h3>
        <p v-if="session.endTime">Beendet um: {{ formatTime(session.endTime) }}</p>
        <p v-else>Noch nicht beendet.</p>
        <div v-if="session.exercises && session.exercises.length > 0">
          <h4>Übungen:</h4>
          <ul>
            <li v-for="exercise in session.exercises" :key="exercise.id">
              {{ exercise.name }} - {{ exercise.weight }}kg - {{ exercise.reps }} Wiederholungen
            </li>
          </ul>
        </div>
        <p v-else>Keine Übungen für dieses Training.</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'TrainingHistory',
  data() {
    return {
      trainingSessions: []
    }
  },
  async mounted() {
    await this.loadTrainingHistory();
  },
  methods: {
    async loadTrainingHistory() {
      try {
        const response = await fetch("https://meinwebtechprojekt-5pjt.onrender.com/training-sessions");
        if (response.ok) {
          const data = await response.json();
          this.trainingSessions = data;
        } else {
          console.error("Fehler beim Laden der Trainingshistorie:", response.status);
        }
      } catch (error) {
        console.error("Netzwerkfehler beim Laden der Trainingshistorie:", error);
      }
    },
    formatDate(datetime) {
      if (!datetime) return 'N/A';
      const date = new Date(datetime);
      return date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    formatTime(datetime) {
      if (!datetime) return 'N/A';
      const date = new Date(datetime);
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    },
    goToStartPage() {
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.training-history {
  text-align: center;
  padding: 20px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
}

.training-session-item {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.training-session-item h3 {
  color: #34495e;
  margin-top: 0;
}

.training-session-item ul {
  list-style: none;
  padding: 0;
}

.training-session-item li {
  background-color: #e9ecef;
  margin: 5px 0;
  padding: 8px;
  border-radius: 4px;
}

.nav-button {
  background-color: #6c757d; /* Grau */
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1em;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 20px;
}

.nav-button:hover {
  background-color: #5a6268;
}
</style>