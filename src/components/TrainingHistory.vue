<template>
  <div class="training-history">
    <div class="header">
      <button @click="goToStartPage" class="button nav-button">Zur Startseite</button>
      <h1>Vergangene Trainingseinheiten</h1>
    </div>
    
    <div v-if="loading" class="loading">
      <p>Lade Trainingshistorie...</p>
    </div>
    
    <div v-else-if="trainingSessions.length === 0" class="no-sessions">
      <p>Noch keine Trainingseinheiten vorhanden.</p>
      <router-link to="/training" class="button start-training-button">Erstes Training starten</router-link>
    </div>
    
    <div v-else class="sessions-container">
      <div v-for="session in trainingSessions" :key="session.id" class="training-session-item">
        <div class="session-header">
          <h3>Training vom {{ formatDate(session.startTime) }}</h3>
          <button @click="deleteSession(session.id)" class="button delete-session-button">Training löschen</button>
        </div>
        
        <div class="session-info">
          <p><strong>Gestartet:</strong> {{ formatDateTime(session.startTime) }}</p>
          <p v-if="session.endTime"><strong>Beendet:</strong> {{ formatDateTime(session.endTime) }}</p>
          <p v-else class="ongoing-session"><strong>Status:</strong> Noch nicht beendet</p>
          <p><strong>Dauer:</strong> {{ calculateDuration(session.startTime, session.endTime) }}</p>
        </div>
        
        <div class="exercises-section">
          <h4>Übungen ({{ session.exercises ? session.exercises.length : 0 }}):</h4>
          <div v-if="session.exercises && session.exercises.length > 0" class="exercises-list">
            <div v-for="exercise in session.exercises" :key="exercise.id" class="exercise-item">
              <h5>{{ exercise.name }}</h5>
              <div v-if="exercise.sets && exercise.sets.length > 0" class="sets-list">
                <div v-for="(set, index) in exercise.sets" :key="set.id" class="set-item">
                  <span class="set-info">Satz {{ index + 1 }}: {{ set.weight }}kg × {{ set.reps }} Wdh.</span>
                </div>
              </div>
              <div v-else class="no-sets">
                <span class="no-sets-text">Keine Sätze aufgezeichnet</span>
              </div>
            </div>
          </div>
          <div v-else class="no-exercises">
            <p>Keine Übungen für dieses Training aufgezeichnet.</p>
          </div>
        </div>
        
        <div class="session-stats">
          <div class="stat-item">
            <span class="stat-label">Gesamte Sätze:</span>
            <span class="stat-value">{{ getTotalSets(session) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Gesamtgewicht:</span>
            <span class="stat-value">{{ getTotalWeight(session) }} kg</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrainingHistory',
  data() {
    return {
      trainingSessions: [],
      loading: true
    }
  },
  async mounted() {
    await this.loadTrainingHistory();
  },
  methods: {
    async loadTrainingHistory() {
      this.loading = true;
      try {
        const response = await fetch("https://meinwebtechprojekt-5pjt.onrender.com/training-sessions");
        if (response.ok) {
          const data = await response.json();
          // Sortiere Sessions nach Datum (neueste zuerst)
          this.trainingSessions = data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        } else {
          console.error("Fehler beim Laden der Trainingshistorie:", response.status);
          alert("Fehler beim Laden der Trainingshistorie.");
        }
      } catch (error) {
        console.error("Netzwerkfehler beim Laden der Trainingshistorie:", error);
        alert("Verbindungsfehler zum Server.");
      } finally {
        this.loading = false;
      }
    },

    async deleteSession(sessionId) {
      if (!confirm('Möchten Sie diese Trainingseinheit wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        return;
      }

      try {
        const response = await fetch(`https://meinwebtechprojekt-5pjt.onrender.com/training-sessions/${sessionId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          // Session aus der Liste entfernen
          this.trainingSessions = this.trainingSessions.filter(session => session.id !== sessionId);
          
          // Prüfen ob die gelöschte Session die aktuelle war
          const currentSessionId = localStorage.getItem('currentTrainingSessionId');
          if (currentSessionId && parseInt(currentSessionId) === sessionId) {
            localStorage.removeItem('currentTrainingSessionId');
            localStorage.removeItem('sessionStartTime');
          }
          
          console.log(`Trainingseinheit ${sessionId} erfolgreich gelöscht.`);
        } else if (response.status === 404) {
          alert('Trainingseinheit nicht gefunden.');
          // Session trotzdem aus der Liste entfernen
          this.trainingSessions = this.trainingSessions.filter(session => session.id !== sessionId);
        } else {
          alert('Fehler beim Löschen der Trainingseinheit.');
        }
      } catch (error) {
        console.error('Netzwerkfehler beim Löschen:', error);
        alert('Verbindungsfehler zum Server beim Löschen.');
      }
    },

    formatDate(datetime) {
      if (!datetime) return 'N/A';
      const date = new Date(datetime);
      return date.toLocaleDateString('de-DE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
    },

    formatDateTime(datetime) {
      if (!datetime) return 'N/A';
      const date = new Date(datetime);
      return date.toLocaleString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    calculateDuration(startTime, endTime) {
      if (!startTime) return 'N/A';
      
      const start = new Date(startTime);
      const end = endTime ? new Date(endTime) : new Date();
      const durationMs = end - start;
      
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}h ${minutes}min`;
      } else {
        return `${minutes}min`;
      }
    },

    getTotalSets(session) {
      if (!session.exercises) return 0;
      return session.exercises.reduce((total, exercise) => {
        return total + (exercise.sets ? exercise.sets.length : 0);
      }, 0);
    },

    getTotalWeight(session) {
      if (!session.exercises) return 0;
      return session.exercises.reduce((total, exercise) => {
        if (!exercise.sets) return total;
        return total + exercise.sets.reduce((exerciseTotal, set) => {
          return exerciseTotal + (set.weight * set.reps);
        }, 0);
      }, 0);
    },

    goToStartPage() {
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.training-history {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.header h1 {
  margin: 0;
  flex: 1;
  text-align: center;
}

.button {
  padding: 10px 20px;
  font-size: 1em;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-block;
}

.nav-button {
  background-color: #6c757d;
  color: white;
}

.nav-button:hover {
  background-color: #5a6268;
}

.start-training-button {
  background-color: #28a745;
  color: white;
  padding: 15px 30px;
  font-size: 1.1em;
}

.start-training-button:hover {
  background-color: #218838;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #6c757d;
}

.no-sessions {
  text-align: center;
  padding: 50px;
  color: #6c757d;
}

.sessions-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.training-session-item {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.training-session-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.session-header h3 {
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.delete-session-button {
  background-color: #dc3545;
  color: white;
}

.delete-session-button:hover {
  background-color: #c82333;
}

.session-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.session-info p {
  margin: 5px 0;
}

.ongoing-session {
  color: #ffc107;
  font-weight: bold;
}

.exercises-section h4 {
  color: #495057;
  margin-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 5px;
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.exercise-item {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.exercise-item h5 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 1.1em;
}

.sets-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.set-item {
  background-color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.set-info {
  font-family: 'Courier New', monospace;
  color: #495057;
}

.no-sets, .no-exercises {
  color: #6c757d;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.no-sets-text {
  font-size: 0.9em;
}

.session-stats {
  display: flex;
  justify-content: space-around;
  background-color: #e9ecef;
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.stat-item {
  text-align: center;
  flex: 1;
  min-width: 120px;
}

.stat-label {
  display: block;
  font-size: 0.9em;
  color: #6c757d;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 1.2em;
  font-weight: bold;
  color: #2c3e50;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    text-align: center;
  }
  
  .header h1 {
    order: -1;
    margin-bottom: 15px;
  }
  
  .session-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .session-header h3 {
    text-align: center;
    margin-bottom: 10px;
  }
  
  .session-stats {
    flex-direction: column;
  }
  
  .stat-item {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .training-history {
    padding: 10px;
  }
  
  .training-session-item {
    padding: 15px;
  }
  
  .session-info {
    padding: 10px;
  }
  
  .exercise-item {
    padding: 10px;
  }
}
</style>

