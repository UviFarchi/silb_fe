import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import EventBus from './eventBus.js';

const app = createApp(App);

// Use the event bus for global event handling
app.config.globalProperties.$eventBus = EventBus;

app.mount('#app');
