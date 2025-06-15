<template>
  <div id="app">
    <h1>Gym Tracker</h1>
    <ExerciseList :exercises="exerciseList" @add-exercise="addExercise" />
  </div>
</template>

<script>
import ExerciseList from './components/ExerciseList.vue'

export default {
  name: 'App',
  components: { ExerciseList },
  data() {
    return {
      exerciseList: []
    }
  },
  mounted() {
    this.loadExercises();
  },
  methods: {
    async loadExercises() {
      try {
        const response = await fetch("https://meinwebtechprojekt.onrender.com" )

        //fetch("https://meinwebtechprojekt.onrender.com/exercises");
        if (response.ok) {
          const data = await response.json();
          this.exerciseList = data;
        } else {
          console.error("Fehler beim Laden der Übungen:", response.status);
        }
      } catch (error) {
        console.error("Fehler beim Laden der Übungen:", error);
      }
    },

    async addExercise(exercise) {
      try {
        const response = await fetch("https://meinwebtechprojekt.onrender.com", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

