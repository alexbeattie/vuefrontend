// store/modules/devices.js

const state = () => ({
  devices: [],
  selectedDevice: null,
  addressMap: {},
  error: null,
  loading: false
});

const mutations = {
  SET_DEVICES(state, payload) {
    console.log('SET_DEVICES mutation called with:', payload);
    try {
      // Ensure we always have an array
      const deviceArray = Array.isArray(payload) ? payload : [payload];
      console.log('Processing devices array:', deviceArray.length, 'devices');
      state.devices = deviceArray;
      console.log('Devices set in state:', state.devices.length);
    } catch (error) {
      console.error('Error in SET_DEVICES:', error);
      state.devices = [];
    }
  },
  SET_SELECTED_DEVICE(state, deviceId) {
    state.selectedDevice = deviceId;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  UPDATE_DEVICE(state, updatedDevice) {
    const index = state.devices.findIndex(d => d.device_id === updatedDevice.device_id);
    if (index !== -1) {
      state.devices.splice(index, 1, updatedDevice);
    } else {
      state.devices.push(updatedDevice);
    }
  },
  UPDATE_ADDRESS(state, { deviceId, address }) {
    state.addressMap[deviceId] = address;
  }
};

const actions = {
  async fetchDevices({ commit }) {
    commit('SET_LOADING', true);
    try {
      console.log('Fetching devices from Go server...');
      const response = await fetch('http://localhost:8080/api/v1/devices');

      // Log the response status
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw API response:', JSON.stringify(data, null, 2));

      // If data is returning as a single device, wrap it in an array
      if (data && !Array.isArray(data) && data.device_id) {
        console.log('Converting single device to array');
        commit('SET_DEVICES', [data]);
      }
      // If data is returning as an array
      else if (Array.isArray(data)) {
        console.log('Setting devices array:', data.length, 'devices');
        commit('SET_DEVICES', data);
      }
      // If data has a devices property
      else if (data && data.devices) {
        console.log('Setting devices from object:', data.devices.length, 'devices');
        commit('SET_DEVICES', data.devices);
      } else {
        console.error('Unexpected data structure:', data);
        commit('SET_DEVICES', []);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },

  updateDevice({ commit }, device) {
    commit('UPDATE_DEVICE', device);
  },

  selectDevice({ commit }, deviceId) {
    commit('SET_SELECTED_DEVICE', deviceId);
  },

  // Add the updateAddress action
  updateAddress({ commit }, { deviceId, address }) {
    commit('UPDATE_ADDRESS', { deviceId, address });
  }
};

const getters = {
  hasDevices: (state) => {
    const result = state.devices && state.devices.length > 0;
    console.log('hasDevices getter:', {
      hasDevices: result,
      deviceCount: state.devices?.length
    });
    return result;
  },
  getDeviceById: (state) => (id) => {
    return state.devices.find(device => device.device_id === id);
  },
  getAddressForDevice: (state) => (id) => {
    return state.addressMap[id] || 'Loading address...';
  },
  isDeviceSelected: (state) => (id) => {
    return state.selectedDevice === id;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};