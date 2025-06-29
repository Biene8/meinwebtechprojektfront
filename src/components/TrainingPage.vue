<template>
  <div id="training-page">
    <div class="header-buttons">
      <button @click="goToStartPage" class="button nav-button">Zur Startseite</button>
      <button @click="endTraining" class="button end-training-button" :disabled="!currentTrainingSessionId">Training beenden</button>
    </div>

    <h1>Training</h1>

    <!-- Training Status -->
    <div class="training-status">
      <div v-if="currentTrainingSessionId" class="active-training">
        <p><strong>Aktives Training (ID: {{ currentTrainingSessionId }})</strong></p>
        <p>Gestartet: {{ formatTime(sessionStartTime) }}</p>
      </div>
      <div v-else class="no-training">
        <p>Kein aktives Training</p>
        <button @click="startNewTraining" class="button start-new-training-button">Neues Training starten</button>
      </div>
    </div>

    <!-- Übungen Liste -->
    <div v-if="currentTrainingSessionId" class="exercises-section">
      <h2>Übungen</h2>

      <!-- Neue Übung hinzufügen -->
      <div class="add-exercise-form">
        <h3>Neue Übung hinzufügen</h3>
        <div class="form-group">
          <input
              v-model="newExercise.name"
              type="text"
              placeholder="Übungsname (z.B. Bankdrücken)"
              class="exercise-input"
          />
          <input
              v-model.number="newExercise.weight"
              type="number"
              placeholder="Gewicht (kg)"
              class="weight-input"
          />
          <input
              v-model.number="newExercise.reps"
              type="number"
              placeholder="Wiederholungen"
              class="reps-input"
          />
          <button @click="addExercise" class="button add-button">Übung hinzufügen</button>
        </div>
      </div>

      <!-- Übungen anzeigen -->
      <div class="exercises-list">
        <div v-for="exercise in exerciseList" :key="exercise.id" class="exercise-item">
          <div class="exercise-header">
            <input
                v-model="exercise.name"
                @blur="updateExercise(exercise)"
                class="exercise-name-input"
            />
            <button @click="deleteExercise(exercise.id)" class="button delete-button">Übung löschen</button>
          </div>

          <!-- Sets für diese Übung -->
          <div class="sets-section">
            <h4>Sätze:</h4>
            <div v-if="exercise.sets && exercise.sets.length > 0" class="sets-list">
              <div v-for="(set, index) in exercise.sets" :key="set.id" class="set-item">
                <span class="set-number">Satz {{ index + 1 }}:</span>
                <input
                    v-model.number="set.weight"
                    @blur="updateSet(exercise.id, set)"
                    type="number"
                    class="set-weight-input"
                />
                <span>kg</span>
                <input
                    v-model.number="set.reps"
                    @blur="updateSet(exercise.id, set)"
                    type="number"
                    class="set-reps-input"
                />
                <span>Wdh.</span>
                <button @click="deleteSet(exercise.id, set.id)" class="button delete-set-button">×</button>
              </div>
            </div>
            <div v-else class="no-sets">
              <p>Noch keine Sätze hinzugefügt</p>
            </div>

            <!-- Neuen Satz hinzufügen -->
            <div class="add-set-form">
              <input
                  :value="getNewSetWeight(exercise.id)"
                  @input="setNewSetWeight(exercise.id, $event.target.value)"
                  type="number"
                  placeholder="Gewicht (kg)"
                  class="new-set-weight"
              />
              <input
                  :value="getNewSetReps(exercise.id)"
                  @input="setNewSetReps(exercise.id, $event.target.value)"
                  type="number"
                  placeholder="Wiederholungen"
                  class="new-set-reps"
              />
              <button @click="addSet(exercise.id)" class="button add-set-button">+ Satz hinzufügen</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrainingPage',
  data() {
    return {
      exerciseList: [],
      currentTrainingSessionId: null,
      sessionStartTime: null,
      newExercise: {
        name: '',
        weight: null,
        reps: null
      },
      newSetData: {}
    }
  },
  async mounted() {
    const savedSessionId = localStorage.getItem('currentTrainingSessionId');
    const savedStartTime = localStorage.getItem('sessionStartTime');

    if (savedSessionId) {
      this.currentTrainingSessionId = parseInt(savedSessionId);
      this.sessionStartTime = savedStartTime;
      await this.loadExercisesForCurrentSession();
    }
  },
  methods: {
    getNewSetWeight(exerciseId) {
      return this.newSetData[exerciseId] ? this.newSetData[exerciseId].weight : null;
    },

    getNewSetReps(exerciseId) {
      return this.newSetData[exerciseId] ? this.newSetData[exerciseId].reps : null;
    },

    setNewSetWeight(exerciseId, value) {
      if (!this.newSetData[exerciseId]) {
        this.$set(this.newSetData, exerciseId, { weight: null, reps: null });
      }
      this.newSetData[exerciseId].weight = parseInt(value) || null;
    },

    setNewSetReps(exerciseId, value) {
      if (!this.newSetData[exerciseId]) {
        this.$set(this.newSetData, exerciseId, { weight: null, reps: null });
      }
      this.newSetData[exerciseId].reps = parseInt(value) || null;
    },

    async startNewTraining() {
      try {
        const response = await fetch("https://meinwebtechprojekt-5pjt.onrender.com/training-sessions", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        } );

        if (response.ok) {
          const session = await response.json();
          this.currentTrainingSessionId = session.id;
          this.sessionStartTime = session.startTime;
          this.exerciseList = [];

          localStorage.setItem('currentTrainingSessionId', session.id.toString());
          localStorage.setItem('sessionStartTime', session.startTime);

          console.log("Neue Trainingseinheit gestartet:", session.id);
        } else {
          alert("Fehler beim Starten der Trainingseinheit.");
        }
      } catch (error) {
        console.error("Netzwerkfehler:", error);
        alert("Verbindungsfehler zum Server.");
      }
    },

    async loadExercisesForCurrentSession() {
      if (!this.currentTrainingSessionId) return;

      try {
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/training-sessions/${this.currentTrainingSessionId}` );
        if (response.ok) {
          const sessionData = await response.json();
          this.exerciseList = sessionData.exercises || [];

          this.exerciseList.forEach(exercise => {
            if (!this.newSetData[exercise.id]) {
              this.$set(this.newSetData, exercise.id, { weight: null, reps: null });
            }
          });
        }
      } catch (error) {
        console.error("Fehler beim Laden der Übungen:", error);
      }
    },

    async addExercise() {
      if (!this.currentTrainingSessionId) {
        alert("Bitte starten Sie zuerst ein Training.");
        return;
      }

      if (!this.newExercise.name.trim()) {
        alert("Bitte geben Sie einen Übungsnamen ein.");
        return;
      }

      try {
        const exerciseData = {
          name: this.newExercise.name,
          weight: this.newExercise.weight,
          reps: this.newExercise.reps
        };

        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/training-sessions/${this.currentTrainingSessionId}/exercises`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exerciseData )
        });

        if (response.ok) {
          const savedExercise = await response.json();
          this.exerciseList.push(savedExercise);

          this.$set(this.newSetData, savedExercise.id, { weight: null, reps: null });

          this.newExercise = { name: '', weight: null, reps: null };

          await this.loadExercisesForCurrentSession();
        } else {
          alert('Fehler beim Speichern der Übung');
        }
      } catch (error) {
        console.error('Netzwerkfehler:', error);
        alert('Verbindungsfehler zum Server');
      }
    },

    async updateExercise(exercise) {
      try {
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/exercises/${exercise.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: exercise.name } )
        });

        if (!response.ok) {
          console.error('Fehler beim Aktualisieren der Übung');
        }
      } catch (error) {
        console.error('Netzwerkfehler beim Aktualisieren:', error);
      }
    },

    async addSet(exerciseId) {
      const weight = this.getNewSetWeight(exerciseId);
      const reps = this.getNewSetReps(exerciseId);

      if (!weight || !reps) {
        alert("Bitte geben Sie Gewicht und Wiederholungen ein.");
        return;
      }

      try {
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/exercises/${exerciseId}/sets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weight: weight,
            reps: reps
          } )
        });

        if (response.ok) {
          await this.loadExercisesForCurrentSession();
          this.newSetData[exerciseId] = { weight: null, reps: null };
        } else {
          alert('Fehler beim Hinzufügen des Satzes');
        }
      } catch (error) {
        console.error('Netzwerkfehler:', error);
        alert('Verbindungsfehler zum Server');
      }
    },

    async updateSet(exerciseId, set) {
      try {
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/exercises/${exerciseId}/sets/${set.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weight: set.weight,
            reps: set.reps
          } )
        });

        if (!response.ok) {
          console.error('Fehler beim Aktualisieren des Satzes');
        }
      } catch (error) {
        console.error('Netzwerkfehler beim Aktualisieren:', error);
      }
    },

    async deleteSet(exerciseId, setId) {
      if (!confirm('Möchten Sie diesen Satz wirklich löschen?')) return;

      try {
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/exercises/${exerciseId}/sets/${setId}`, {
          method: 'DELETE'
        } );

        if (response.ok) {
          await this.loadExercisesForCurrentSession();
        } else {
          alert('Fehler beim Löschen des Satzes');
        }
      } catch (error) {
        console.error('Netzwerkfehler:', error);
        alert('Verbindungsfehler zum Server');
      }
    },

    async deleteExercise(id) {
      if (!confirm('Möchten Sie diese Übung wirklich löschen?')) return;

      try {
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/exercises/${id}`, {
          method: 'DELETE'
        } );

        if (response.ok) {
          this.exerciseList = this.exerciseList.filter(exercise => exercise.id !== id);
          delete this.newSetData[id];
        } else {
          alert('Fehler beim Löschen der Übung');
        }
      } catch (error) {
        console.error('Netzwerkfehler:', error);
        alert('Verbindungsfehler zum Server');
      }
    },

    async endTraining() {
      if (!this.currentTrainingSessionId) return;

      try {
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/training-sessions/${this.currentTrainingSessionId}/end`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        } );

        if (response.ok) {
          alert("Training erfolgreich beendet!");

          localStorage.removeItem('currentTrainingSessionId');
          localStorage.removeItem('sessionStartTime');

          this.currentTrainingSessionId = null;
          this.sessionStartTime = null;
          this.exerciseList = [];
          this.newSetData = {};

          this.$router.push('/');
        } else {
          alert('Fehler beim Beenden des Trainings');
        }
      } catch (error) {
        console.error('Netzwerkfehler:', error);
        alert('Verbindungsfehler zum Server');
      }
    },

    goToStartPage() {
      this.$router.push('/');
    },

    formatTime(datetime) {
      if (!datetime) return '';
      const date = new Date(datetime);
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }
  }
}
</script>

<style scoped>
#training-page {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.button {
  padding: 10px 20px;
  font-size: 1em;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: none;
}

.nav-button {
  background-color: #6c757d;
  color: white;
}

.nav-button:hover {
  background-color: #5a6268;
}

.end-training-button {
  background-color: #dc3545;
  color: white;
}

.end-training-button:hover:not(:disabled) {
  background-color: #c82333;
}

.end-training-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.training-status {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  text-align: center;
}

.active-training {
  color: #28a745;
}

.start-new-training-button {
  background-color: #28a745;
  color: white;
  padding: 15px 30px;
  font-size: 1.1em;
}

.start-new-training-button:hover {
  background-color: #218838;
}

.exercises-section {
  margin-top: 30px;
}

.add-exercise-form {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.exercise-input {
  flex: 2;
  min-width: 200px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.weight-input, .reps-input {
  flex: 1;
  min-width: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-button {
  background-color: #007bff;
  color: white;
}

.add-button:hover {
  background-color: #0056b3;
}

.exercise-item {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.exercise-name-input {
  font-size: 1.2em;
  font-weight: bold;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
  min-width: 200px;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover {
  background-color: #c82333;
}

.sets-section {
  margin-top: 15px;
}

.sets-list {
  margin: 15px 0;
}

.set-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  flex-wrap: wrap;
}

.set-number {
  font-weight: bold;
  min-width: 60px;
}

.set-weight-input, .set-reps-input {
  width: 80px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.delete-set-button {
  background-color: #dc3545;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  padding: 0;
  font-size: 1.2em;
}

.delete-set-button:hover {
  background-color: #c82333;
}

.add-set-form {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 15px;
  flex-wrap: wrap;
}

.new-set-weight, .new-set-reps {
  width: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-set-button {
  background-color: #28a745;
  color: white;
}

.add-set-button:hover {
  background-color: #218838;
}

.no-sets {
  color: #6c757d;
  font-style: italic;
  margin: 15px 0;
}

@media (max-width: 768px) {
  .header-buttons {
    flex-direction: column;
  }

  .form-group {
    flex-direction: column;
  }

  .exercise-input, .weight-input, .reps-input {
    width: 100%;
  }

  .exercise-header {
    flex-direction: column;
    align-items: stretch;
  }

  .set-item {
    flex-direction: column;
    align-items: stretch;
  }

  .add-set-form {
    flex-direction: column;
  }

  .new-set-weight, .new-set-reps {
    width: 100%;
  }
}
</style>
