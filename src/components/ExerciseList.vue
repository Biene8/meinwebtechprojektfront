<template>
  <div>
    <h2>Übungen</h2>
    <ul v-if="exercises.length">
      <li v-for="(exercise, index) in exercises" :key="exercise.id || index">
        <strong>{{ exercise.name }}</strong>
        <span v-if="exercise.weight"> - {{ exercise.weight }}kg</span>
        <span v-if="exercise.reps"> - {{ exercise.reps }} Wiederholungen</span>
      </li>
    </ul>
    <p v-else>Keine Übungen gefunden</p>
    
    <form @submit.prevent="addExercise" class="exercise-form">
      <h3>Neue Übung hinzufügen</h3>
      
      <div class="form-group">
        <label for="name">Übungsname:</label>
        <input 
          id="name"
          v-model="newExercise.name" 
          placeholder="z.B. Bankdrücken" 
          required 
        />
      </div>
      
      <div class="form-group">
        <label for="weight">Gewicht (kg):</label>
        <input 
          id="weight"
          v-model.number="newExercise.weight" 
          type="number" 
          min="0" 
          step="0.5"
          placeholder="z.B. 80" 
          required 
        />
      </div>
      
      <div class="form-group">
        <label for="reps">Wiederholungen:</label>
        <input 
          id="reps"
          v-model.number="newExercise.reps" 
          type="number" 
          min="1" 
          placeholder="z.B. 12" 
          required 
        />
      </div>
      
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
      newExercise: {
        name: '',
        weight: null,
        reps: null
      }
    }
  },
  methods: {
    addExercise() {
      if (this.newExercise.name.trim() && this.newExercise.weight && this.newExercise.reps) {
        this.$emit('add-exercise', {
          name: this.newExercise.name.trim(),
          weight: this.newExercise.weight,
          reps: this.newExercise.reps
        });
        // Formular zurücksetzen
        this.newExercise = { name: '', weight: null, reps: null };
      }
    }
  }
}
</script>

<style scoped>
.exercise-form {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-sizing: border-box;
}

button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  width: 100%;
}

button:hover {
  background-color: #0056b3;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  background: #f8f9fa;
  margin: 10px 0;
  padding: 10px;
  border-radius: 3px;
  border-left: 3px solid #007bff;
}
</style>

