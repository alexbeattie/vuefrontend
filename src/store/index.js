import { createStore } from 'vuex';
import mapSettings from './modules/mapSettings';
import devices from './modules/devices';

// The createStore function sets up our central Vuex store.
// Think of it as creating a database that our Vue app can use.
export default createStore({
  // Modules help us organize different parts of our state.
  // It's like having different tables in a database.
  modules: {
    mapSettings,  // Handles map-related settings
    devices       // Handles device-related data
  }
});