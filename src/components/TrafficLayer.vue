<!-- components/TrafficLayer.vue -->
<script>
export default {
  name: 'TrafficLayer',
  
  props: {
    map: {
      type: Object,
      required: true
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      trafficLayer: null,
      isGoogleLoaded: false
    };
  },

  mounted() {
    this.waitForGoogleMaps();
  },

  methods: {
    waitForGoogleMaps() {
      const checkGoogle = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkGoogle);
          this.isGoogleLoaded = true;
          this.initializeTrafficLayer();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkGoogle);
        if (!this.isGoogleLoaded) {
          console.error('Google Maps failed to load');
        }
      }, 10000);
    },

    initializeTrafficLayer() {
      try {
        if (!this.trafficLayer && window.google?.maps) {
          this.trafficLayer = new window.google.maps.TrafficLayer();
          if (this.modelValue) {
            this.trafficLayer.setMap(this.map);
          }
        }
      } catch (error) {
        console.error('Error initializing traffic layer:', error);
      }
    }
  },

  watch: {
  'settings.showTraffic': {
    handler() {  // removed the unused 'newValue' parameter
      try {
        if (this.$refs.map?.map) {
          this.toggleTrafficLayer();
        }
      } catch (error) {
        console.error('Error toggling traffic layer:', error);
      }
    }
  }
},

  beforeUnmount() {
    if (this.trafficLayer) {
      this.trafficLayer.setMap(null);
      this.trafficLayer = null;
    }
  }
};
</script>

<template>
  <div style="display: none;"></div>
</template>