import { createApp } from 'vue'
import App from './App.vue'
import store from './store';

import './assets/main.css'  // Import Tailwind CSS


const app = createApp(App);
store.dispatch('mapSettings/loadSettings').catch(console.error);
store.dispatch('devices/loadGeocodeCache').catch(console.error);


app.use(store);  // This makes the store available throughout your app
app.mount('#app');

window.addEventListener('beforeunload', () => {
  store.dispatch('devices/persistGeocodeCache');
});