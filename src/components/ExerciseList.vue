<template>
  <div class="exercise-list">
    <h2>Meine Übungen</h2>
    <ul>
      <li v-for="exercise in exercises" :key="exercise.name" class="exercise-item">
        <div class="exercise-name">{{ exercise.name }}</div>
        <div class="exercise-details">
          Gewicht: {{ exercise.weight }}kg | Wiederholungen: {{ exercise.reps }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['exercises']
}
</script>

<style scoped>
.exercise-list {
  margin-top: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.exercise-list h2 {
  margin-bottom: 15px;
  font-size: 24px;
  color: #333;
}

.exercise-item {
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.exercise-item:last-child {
  border-bottom: none;
}

.exercise-name {
  font-weight: bold;
  font-size: 18px;
}

.exercise-details {
  color: #555;
  font-size: 14px;
  margin-top: 4px;
}
</style>
