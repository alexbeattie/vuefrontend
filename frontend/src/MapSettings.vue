<template>
  <div class="fixed top-4 right-4 bg-white rounded-lg shadow-lg w-80 z-50 map-settings">
    <!-- <div class="flex justify-between items-center p-4 border-b settings-header">
      <h2 class="text-lg font-semibold">Map Settings</h2>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 close-button">
        <span class="sr-only">Close</span>
        ×
      </button>
    </div> -->
    <!-- <div class="p-4 space-y-6"> -->
      <!-- Map Type Selection -->
      <!-- <div class="space-y-2">
        <label class="flex items-center space-x-2 p-2 cursor-pointer">
          <input
            type="radio"
            v-model="localSettings.mapType"
            value="roadmap"
            class="w-4 h-4"
            @change="handleChange"
          />
          <span>Google streets</span>
        </label>
        <label class="flex items-center space-x-2 p-2 cursor-pointer">
          <input
            type="radio"
            v-model="localSettings.mapType"
            value="satellite"
            class="w-4 h-4"
            @change="handleChange"
          />
          <span>Google satellite</span>
        </label>
      </div> -->

      <!-- Theme Selection
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium">App Theme</span>
          <select 
            v-model="localSettings.theme" 
            class="border rounded p-1"
            @change="handleChange"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div> -->

      <!-- Map Features -->
      <!-- <div class="space-y-4"> -->
        <!-- <label class="flex items-center justify-between cursor-pointer">
          <span>Traffic</span>
          <input
          type="checkbox"
          :checked="localSettings.showTraffic"
          @change="handleTrafficChange"
          class="w-4 h-4"
        />
        </label> -->
        <!-- <label class="flex items-center justify-between cursor-pointer">
          <span>Weather</span>
          <input
            type="checkbox"
            v-model="localSettings.showWeather"
            class="w-4 h-4"
            @change="handleChange"
          />
        </label> -->
      <!-- </div> -->

      <!-- Device Settings -->
      <!-- <div class="space-y-4"> -->
        <!-- <h3 class="font-medium">DEVICES</h3> -->
       <!-- <label class="flex items-center justify-between cursor-pointer">
        <span>Show devices</span>
        <input
          type="checkbox"
          v-model="localSettings.showDevices"
          class="w-4 h-4"
          @change="handleChange"
        />
      </label> -->
        <!-- <label class="flex items-center justify-between cursor-pointer">
          <span>Show labels</span>
          <input
            type="checkbox"
            v-model="localSettings.showLabels"
            class="w-4 h-4"
            @change="handleChange"
          />
        </label> -->
        <!-- <label class="flex items-center justify-between cursor-pointer">
          <span>Show driver name in label</span>
          <input
            type="checkbox"
            v-model="localSettings.showDriverNames"
            class="w-4 h-4"
            @change="handleChange"
          />
        </label> -->
      <!-- </div> -->
    <!-- </div> -->
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'MapSettings',
  
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },

  emits: ['update:modelValue', 'close'],

  data() {
    return {
      // localSettings: { ...this.modelValue }
    }
  },

  computed: {
    ...mapState('mapSettings', {
      // mapSettings: state => state.settings
    })
  },

  watch: {
    modelValue: {
      // handler(newValue) {
      //   this.localSettings = { ...newValue };
      // },
      deep: true
    }
  },

  methods: {
    handleChange() {
      // Emit the entire settings object when any setting changes
      // this.$emit('update:modelValue', { ...this.localSettings });
      
      // Also update Vuex store
      // this.$store.dispatch('mapSettings/updateSetting', {
      //   key: 'showDevices',
      //   value: this.localSettings.showDevices
      // });
    }
  }
}
</script>