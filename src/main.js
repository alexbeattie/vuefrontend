import { createApp } from 'vue'
import App from './App.vue'
import store from './store';

import './assets/main.css'  // Import Tailwind CSS


const app = createApp(App);
app.use(store);  // This makes the store available throughout your app
app.mount('#app');
