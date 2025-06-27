
<template>
  <div id="training-page">
    <div class="header-buttons">
      <button @click="goToStartPage" class="button nav-button">Zur Startseite</button>
      <button @click="endTraining" class="button end-training-button">Training beenden</button>
    </div>

    <h1>Aktuelles Training</h1>
    <p v-if="currentTrainingSessionId">Training ID: {{ currentTrainingSessionId }}</p>
    <p v-else>Starte ein neues Training...</p>

    <ExerciseList :exercises="exerciseList" @add-exercise="addExercise" @delete-exercise="deleteExercise" />
  </div>
</template>

<script>
import ExerciseList from './ExerciseList.vue';

export default {
  name: 'TrainingPage',
  components: { ExerciseList },
  data() {
    return {
      exerciseList: [],
      currentTrainingSessionId: null
    }
  },
  async mounted() {
    console.log("TrainingPage mounted.");
    // Beim Laden der Trainingsseite, starte eine neue Session, wenn keine vorhanden ist.
    // Dies geschieht, wenn der Nutzer von der Startseite auf 'Training starten' klickt
    // und auf diese Seite navigiert wird.
    if (!this.currentTrainingSessionId) {
      console.log("currentTrainingSessionId ist null, starte neue Session...");
      await this.startNewTrainingSession();
    }
    // Lade Übungen für die aktuelle Session, falls vorhanden
    if (this.currentTrainingSessionId) {
      console.log("currentTrainingSessionId gesetzt, lade Übungen...");
      await this.loadExercisesForCurrentSession();
    }
  },
  methods: {
    async startNewTrainingSession() {
      console.log("Versuche, neue Trainingseinheit zu starten...");
      try {
        const response = await fetch("https://meinwebtechprojekt-5pjt.onrender.com/training-sessions", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const session = await response.json();
          this.currentTrainingSessionId = session.id;
          this.exerciseList = []; // Leere die Liste für das neue Training
          console.log("Neue Trainingseinheit gestartet mit ID:", this.currentTrainingSessionId);
        } else {
          console.error("Fehler beim Starten der Trainingseinheit (Response):", response.status);
          alert("Fehler beim Starten der Trainingseinheit. Bitte versuchen Sie es erneut.");
        }
      } catch (error) {
        console.error("Netzwerkfehler beim Starten der Trainingseinheit (Catch):", error);
        alert("Verbindungsfehler zum Server beim Starten der Trainingseinheit.");
      }
    },

    async loadExercisesForCurrentSession() {
      if (!this.currentTrainingSessionId) return;
      try {
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/training-sessions/${this.currentTrainingSessionId}`);
        if (response.ok) {
          const sessionData = await response.json();
          this.exerciseList = sessionData.exercises || [];
        } else {
          console.error("Fehler beim Laden der Übungen für Session:", response.status);
        }
      } catch (error) {
        console.error("Netzwerkfehler beim Laden der Übungen:", error);
      }
    },

    async addExercise(exercise) {
      if (!this.currentTrainingSessionId) {
        alert("Bitte starten Sie zuerst ein Training.");
        return;
      }
      try {
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/training-sessions/${this.currentTrainingSessionId}/exercises`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exercise)
        });

        if (response.ok) {
          const savedExercise = await response.json();
          this.exerciseList.push(savedExercise);
          console.log("Übung erfolgreich gespeichert:", savedExercise);
        } else {
          console.error('Fehler beim Speichern der Übung:', response.status);
          alert('Fehler beim Speichern der Übung');
        }
      } catch (error) {
        console.error('Netzwerkfehler:', error);
        alert('Verbindungsfehler zum Server');
      }
    },

    async deleteExercise(id) {
      try {
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/exercises/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          this.exerciseList = this.exerciseList.filter(exercise => exercise.id !== id);
          console.log(`Übung mit ID ${id} erfolgreich gelöscht.`);
        } else if (response.status === 404) {
          console.error(`Übung mit ID ${id} nicht gefunden.`);
          alert(`Übung mit ID ${id} nicht gefunden.`);
        } else {
          console.error('Fehler beim Löschen der Übung:', response.status);
          alert('Fehler beim Löschen der Übung');
        }
      } catch (error) {
        console.error('Netzwerkfehler beim Löschen:', error);
        alert('Verbindungsfehler zum Server beim Löschen');
      }
    },

    async endTraining() {
      if (!this.currentTrainingSessionId) {
        alert("Kein aktives Training zum Beenden.");
        return;
      }
      try {
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/training-sessions/${this.currentTrainingSessionId}/end`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          console.log(`Trainingseinheit ${this.currentTrainingSessionId} erfolgreich beendet.`);
          alert("Training erfolgreich beendet!");
          this.currentTrainingSessionId = null;
          this.exerciseList = [];
          this.$router.push('/');
        } else {
          console.error('Fehler beim Beenden des Trainings:', response.status);
          alert('Fehler beim Beenden des Trainings');
        }
      } catch (error) {
        console.error('Netzwerkfehler beim Beenden des Trainings:', error);
        alert('Verbindungsfehler zum Server beim Beenden des Trainings');
      }
    },

    goToStartPage() {
      this.$router.push('/');
    }
  }
}
</script>

<style>
#training-page {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.header-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 20px;
}

.button {
  padding: 10px 20px;
  font-size: 1em;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.nav-button {
  background-color: #6c757d;
  color: white;
  border: none;
}

.nav-button:hover {
  background-color: #5a6268;
}

.end-training-button {
  background-color: #dc3545;
  color: white;
  border: none;
}

.end-training-button:hover {
  background-color: #c82333;
}
</style>


