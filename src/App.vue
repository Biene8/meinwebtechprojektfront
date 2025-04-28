<template>
  <div id="app">
    <h1>Gym Tracker</h1>
    <ExerciseList :exercises="exerciseList" />
  </div>
</template>

<script>
import ExerciseList from './components/ExerciseList.vue'

export default {
  name: 'App',
  components: {
    ExerciseList
  },
  data() {
    return {
      exerciseList: [
        { name: 'Bankdrücken', weight: 80, reps: 10 },
        { name: 'Kniebeuge', weight: 100, reps: 8 },
        { name: 'Kreuzheben', weight: 120, reps: 6 }
      ]
    }
  }
}
</script>

<style>
/* Optional: bisschen Styling */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  padding: 20px;
}
</style>
