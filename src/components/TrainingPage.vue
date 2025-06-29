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

    <div v-if="currentTrainingSessionId" class="exercises-section">
      <h2>Übungen</h2>

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

      <div v-if="exerciseList.length > 0" class="exercises-list">
        <div v-for="exercise in exerciseList" :key="exercise.id" class="exercise-card">
          <div class="exercise-header">
            <input
                v-model="exercise.name"
                @blur="updateExercise(exercise)"
                type="text"
                class="exercise-name-input"
            />
            <button @click="deleteExercise(exercise.id)" class="button delete-button">Löschen</button>
          </div>

          <div class="exercise-content">
            <!-- Bestehende Sätze anzeigen -->
            <div v-if="exercise.sets && exercise.sets.length > 0" class="sets-list">
              <h4>Sätze:</h4>
              <div v-for="(set, index) in exercise.sets" :key="set.id" class="set-item">
                <span>Satz {{ index + 1 }}:</span>
                <input
                    v-model.number="set.weight"
                    @blur="updateSet(exercise.id, set)"
                    type="number"
                    placeholder="Gewicht"
                    class="set-weight-input"
                />
                <span>kg,</span>
                <input
                    v-model.number="set.reps"
                    @blur="updateSet(exercise.id, set)"
                    type="number"
                    placeholder="Wdh."
                    class="set-reps-input"
                />
                <span>Wdh.</span>
                <button @click="deleteSet(exercise.id, set.id)" class="button delete-set-button">×</button>
              </div>
            </div>
            <div v-else class="no-sets">
              <p>Noch keine Sätze hinzugefügt</p>
            </div>

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
      <div v-else class="no-exercises">
        <p>Noch keine Übungen hinzugefügt</p>
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
        this.newSetData[exerciseId] = { weight: null, reps: null };
      }
      this.newSetData[exerciseId].weight = parseFloat(value) || 0;
    },

    setNewSetReps(exerciseId, value) {
      if (!this.newSetData[exerciseId]) {
        this.newSetData[exerciseId] = { weight: null, reps: null };
      }
      this.newSetData[exerciseId].reps = parseInt(value) || 0;
    },

    async startNewTraining() {
      try {
        const response = await fetch("https://meinwebtechprojekt-5pjt.onrender.com/training-sessions", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

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
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/training-sessions/${this.currentTrainingSessionId}`);
        if (response.ok) {
          const sessionData = await response.json();
          this.exerciseList = sessionData.exercises || [];

          this.exerciseList.forEach(exercise => {
            if (!this.newSetData[exercise.id]) {
              this.newSetData[exercise.id] = { weight: null, reps: null };
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

      const exerciseData = {
        name: this.newExercise.name,
        sets: [
          {
            weight: parseFloat(this.newExercise.weight) || 0,
            reps: parseInt(this.newExercise.reps) || 0
          }
        ]
      };

      try {
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/training-sessions/${this.currentTrainingSessionId}/exercises`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exerciseData)
        });

        if (response.ok) {
          const savedExercise = await response.json();
          this.exerciseList.push(savedExercise);

          this.newSetData[savedExercise.id] = { weight: null, reps: null };

          this.newExercise = { name: '', weight: null, reps: null };

          await this.loadExercisesForCurrentSession();
        } else {
          const errorData = await response.json();
          console.error('Fehler beim Speichern der Übung:', response.status, errorData);
          alert('Fehler beim Speichern der Übung: ' + (errorData.message || 'Unbekannter Fehler'));
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
          body: JSON.stringify({ name: exercise.name })
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
            weight: parseFloat(weight) || 0,
            reps: parseInt(reps) || 0
          })
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
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/sets/${set.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weight: parseFloat(set.weight) || 0,
            reps: parseInt(set.reps) || 0
          })
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
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/sets/${setId}`, {
          method: 'DELETE'
        });

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
        });

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
        });

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
          const errorData = await response.json();
          console.error('Fehler beim Beenden des Trainings:', response.status, errorData);
          alert('Fehler beim Beenden des Trainings: ' + (errorData.message || 'Unbekannter Fehler'));
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.header-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
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
  background-color: #6c757d;
  cursor: not-allowed;
}

.training-status {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.active-training {
  color: #28a745;
}

.no-training {
  color: #6c757d;
  text-align: center;
}

.start-new-training-button {
  background-color: #28a745;
  color: white;
  margin-top: 10px;
}

.start-new-training-button:hover {
  background-color: #218838;
}

.exercises-section h2 {
  color: #343a40;
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 10px;
}

.add-exercise-form {
  background-color: #e9ecef;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.add-exercise-form h3 {
  margin-top: 0;
  color: #495057;
}

.form-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.exercise-input, .weight-input, .reps-input {
  flex: 1;
  min-width: 150px;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.add-button {
  background-color: #007bff;
  color: white;
  white-space: nowrap;
}

.add-button:hover {
  background-color: #0056b3;
}

.exercises-list {
  display: grid;
  gap: 20px;
}

.exercise-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dee2e6;
}

.exercise-name-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  margin-right: 10px;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover {
  background-color: #c82333;
}

.sets-list h4 {
  margin: 0 0 10px 0;
  color: #495057;
}

.set-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.set-weight-input, .set-reps-input {
  width: 60px;
  padding: 4px;
  border: 1px solid #ced4da;
  border-radius: 3px;
  text-align: center;
}

.delete-set-button {
  background-color: #dc3545;
  color: white;
  padding: 2px 6px;
  font-size: 12px;
  min-width: auto;
}

.delete-set-button:hover {
  background-color: #c82333;
}

.no-sets {
  color: #6c757d;
  font-style: italic;
  margin: 10px 0;
}

.add-set-form {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
}

.new-set-weight, .new-set-reps {
  width: 100px;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.add-set-button {
  background-color: #28a745;
  color: white;
  white-space: nowrap;
}

.add-set-button:hover {
  background-color: #218838;
}

.no-exercises {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 40px;
}

@media (max-width: 768px) {
  .form-group {
    flex-direction: column;
  }
  
  .exercise-input, .weight-input, .reps-input {
    min-width: auto;
  }
  
  .exercise-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .exercise-name-input {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .add-set-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .new-set-weight, .new-set-reps {
    width: auto;
  }
}
</style>

