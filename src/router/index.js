import { createRouter, createWebHistory } from 'vue-router';
import StartPage from '../components/StartPage.vue';
import TrainingPage from '../components/TrainingPage.vue';
import TrainingHistory from '../components/TrainingHistory.vue';

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

