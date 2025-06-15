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
    fetch("https://meinwebtechprojekt.onrender.com")
        .then(response => response.json())
        .then(data => {
          this.exerciseList = data;
        })
        .catch(error => {
          console.error("Fehler beim Laden der Übungen:", error);
        });
  },
  methods: {
    addExercise(exercise) {
      this.exerciseList.push(exercise);
      // Optional: POST-Request ans Backend
    }
  }
}
</script>