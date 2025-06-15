<template>
  <div>
    <h2>Übungen</h2>
    <ul v-if="exercises.length">
      <li v-for="(exercise, index) in exercises" :key="index">
        {{ exercise.name }}
      </li>
    </ul>
    <p v-else>Keine Übungen gefunden</p>
    <form @submit.prevent="addExercise">
      <input v-model="newExercise" placeholder="Neue Übung" required />
      <button type="submit">Hinzufügen</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ExerciseList',
  props: {
    exercises: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      newExercise: ''
    }
  },
  methods: {
    addExercise() {
      if (this.newExercise.trim()) {
        this.$emit('add-exercise', { name: this.newExercise.trim() });
        this.newExercise = '';
      }
    }
  }
}
</script>