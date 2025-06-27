import { createRouter, createWebHistory } from 'vue-router';
import StartPage from '../components/StartPage.vue'; // Wird später erstellt
import TrainingPage from '../components/TrainingPage.vue'; // Wird später erstellt (jetzige App)
import TrainingHistory from '../components/TrainingHistory.vue'; // Wird später erstellt

const routes = [
    {
        path: '/',
        name: 'StartPage',
        component: StartPage
    },
    {
        path: '/training',
        name: 'TrainingPage',
        component: TrainingPage
    },
    {
        path: '/history',
        name: 'TrainingHistory',
        component: TrainingHistory
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;