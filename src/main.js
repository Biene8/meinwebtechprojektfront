import { createApp } from 'vue'
import TrainingPage from './components/TrainingPage.vue'
import router from './router'; // Neu hinzugefügt

const app = createApp(TrainingPage);
app.use(router);
app.mount('#app');