<template>
  <div>
    <h2>Übungen</h2>
    <ul>
      <li v-for="exercise in exercises" :key="exercise.id" class="exercise-item">
        <span>{{ exercise.name }} - {{ exercise.weight }}kg - {{ exercise.reps }} Wiederholungen</span>
        <button @click="$emit('delete-exercise', exercise.id)" class="delete-button">Löschen</button>
      </li>
    </ul>

    <h3>Übung hinzufügen</h3>
    <form @submit.prevent="submitExercise">
      <div>
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="newExercise.name" required>
      </div>
      <div>
        <label for="weight">Gewicht (kg):</label>
        <input type="number" id="weight" v-model.number="newExercise.weight" required>
      </div>
      <div>
        <label for="reps">Wiederholungen:</label>
        <input type="number" id="reps" v-model.number="newExercise.reps" required>
      </div>
      <button type="submit">Hinzufügen</button>
    </form>
  </div>
</template>

<script>
export default {
  props: ['exercises'],
  data() {
    return {
      newExercise: {
        name: '',
        weight: null,
        reps: null
      }
    }
  },
  methods: {
    submitExercise() {
      this.$emit('add-exercise', { ...this.newExercise });
      // Formular zurücksetzen
      this.newExercise.name = '';
      this.newExercise.weight = null;
      this.newExercise.reps = null;
    }
  }
}
</script>

<style scoped>
.exercise-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #e0e0e0;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 5px;
}

.delete-button {
  background-color: #dc3545; /* Rot */
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-button:hover {
  background-color: #c82333;
}

form div {
  margin-bottom: 10px;
}

form label {
  display: inline-block;
  width: 100px;
  text-align: right;
  margin-right: 10px;
}

form input[type="text"],
form input[type="number"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 150px;
}

form button[type="submit"] {
  background-color: #28a745; /* Grün */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

form button[type="submit"]:hover {
  background-color: #218838;
}
</style>