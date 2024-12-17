<template>
  <div id="app">
    <h1>GPS Tracker</h1>
    <!-- Map Settings Button -->

    <button
      @click="showMapSettings = true"
      class="absolute top-4 right-4 bg-white rounded-lg p-2 shadow-lg z-10"
    >
      <span class="sr-only">Map Settings</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
        <path
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
        />
      </svg>
    </button>

    <!-- Map Settings Panel -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-x-2"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-2"
    >
      <MapSettings
        v-if="showMapSettings"
        v-model="mapSettings"
        @close="showMapSettings = false"
      />
    </Transition>
    <div style="position: relative; width: 100%; height: 500px">
      <GoogleMap
        :api-key="apiKey"
        :center="defaultCenter"
        :zoom="8"
        :mapTypeId="mapSettings.mapType"
        style="width: 100%; height: 100%"
      >
        <template v-if="devices && devices.length">
          <template v-for="device in devices" :key="device.device_id">
            <Marker
              :options="{
                position: getDevicePosition(device),
                title: device.display_name,
                icon: getMarkerIcon(device),
                optimized: false, // This helps with smoother updates
              }"
              @click="handleMarkerClick(device)"
            />

            <InfoWindow
              v-if="selectedDevice === device.device_id"
              :options="{
                position: getDevicePosition(device),
              }"
              @closeclick="selectedDevice = null"
            >
              <div class="info-window">
                <h3>{{ device.display_name }}</h3>
                <div class="device-info">
                  <!-- <p>
                    Position:
                    {{
                      device.latest_device_point.device_point_detail.lat_lng
                        .lat
                    }},
                    {{
                      device.latest_device_point.device_point_detail.lat_lng.lng
                    }}
                  </p> -->
                  <p>
                    Location:
                    {{ addressMap[device.device_id] || "Loading..." }}
                  </p>
                  <p>
                    Speed:
                    {{
                      kmToMph(
                        device.latest_device_point.device_point_detail.speed
                          .display
                      )
                    }}
                  </p>
                  <!-- Time Since Status:
                  {{
                    getTimeElapsed(
                      device.latest_device_point.device_state
                        .drive_status_begin_time
                    )
                  }} -->

                  <p>
                    Heading:
                    {{
                      device.latest_device_point.device_point_detail.heading
                    }}°
                  </p>
                  <p>
                    Satellites:
                    {{
                      device.latest_device_point.device_point_detail
                        .num_satellites
                    }}
                  </p>
                  <p>
                    Online:
                    {{ device.latest_device_point.online }}
                  </p>
                  <p>
                    Status:
                    {{ getDeviceStatus(device).status }} for
                    {{ getDeviceStatus(device).time }}
                  </p>
                </div>
              </div>
            </InfoWindow>
          </template>
        </template>
      </GoogleMap>
    </div>
  </div>
</template>

<script>
import { GoogleMap, Marker, InfoWindow } from "vue3-google-map";
const google = window.google;
import MapSettings from "./MapSettings.vue"; // Add this import

export default {
  name: "App",
  components: {
    GoogleMap,
    Marker,
    InfoWindow,
    MapSettings, // Add this
  },
  data() {
    return {
      apiKey: process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
      devices: [], // Stores the list of devices
      selectedDevice: null, // Tracks the currently selected device
      defaultCenter: { lat: 34.0522, lng: -118.2437 },
      addressMap: {}, // Stores reverse geocoded addresses
      ws: null, // WebSocket connection
      timer: null,
      animationQueue: new Map(), // Store ongoing animations
      showMapSettings: false, // Add this

      mapSettings: {
        mapType: "roadmap", // or 'satellite'
        theme: "light",
        showTraffic: false,
        showWeather: false,
        showDevices: true,
        showLabels: true,
        showDriverNames: true,
      },
    };
  },
 watch: {
  'mapSettings.mapType'(newType) {
    // Update map type when changed
    if (this.$refs.map?.map) {
      this.$refs.map.map.setMapTypeId(newType);
    }
  },
  'mapSettings.showTraffic'(show) {
      // Ensure Google Maps API is loaded
      if (typeof google !== 'undefined' && google.maps) {
        // Toggle traffic layer
        if (this.trafficLayer) {
          this.trafficLayer.setMap(show ? this.$refs.map?.map : null);
        } else if (show) {
          // Create traffic layer if it doesn't exist
          this.trafficLayer = new google.maps.TrafficLayer();
          this.trafficLayer.setMap(this.$refs.map?.map);
        }
      } else {
        console.error('Google Maps API is not loaded.');
      }
    },
  'mapSettings.showDevices'(show) {
    // Update marker visibility
    this.devices.forEach(device => {
      const marker = this.$refs[`marker-${device.device_id}`]?.[0];
      if (marker) {
        marker.setVisible(show);
      }
    });
  }
},
  // computed: {
  //   selectedDeviceObject() {
  //     return this.devices.find(
  //       (device) => device.device_id === this.selectedDevice
  //     );
  //   },
  // },
  methods: {
    updateMarkerVisibility() {
    if (this.devices) {
      this.devices.forEach(device => {
        // Update marker visibility based on settings
        const marker = this.findMarkerForDevice(device.device_id);
        if (marker) {
          marker.setVisible(this.mapSettings.showDevices);
        }
      });
    }
  },
    //    getMarkerIcon(device) {
    //   const speed = parseFloat(device.latest_device_point.device_point_detail.speed.display);
    //   const status = device.latest_device_point.device_state.drive_status;

    //   // Define icons for different states
    //   const icons = {
    //     moving: {
    //       url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    //       scaledSize: { width: 32, height: 32 }
    //     },
    //     idle: {
    //       url: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    //       scaledSize: { width: 32, height: 32 }
    //     },
    //     stopped: {
    //       url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    //       scaledSize: { width: 32, height: 32 }
    //     }
    //   };

    //   // Logic to determine which icon to use
    //   if (speed > 0) {
    //     return icons.moving;
    //   } else if (status === 'idle') {
    //     return icons.idle;
    //   } else {
    //     return icons.stopped;
    //   }
    // },
    getMarkerIcon(device) {
      const speed = parseFloat(
        device.latest_device_point.device_point_detail.speed.display
      );
      const heading = device.latest_device_point.device_point_detail.heading;

      // SVG arrow marker
      return {
        path: "M 12,0 L 24,24 L 12,16 L 0,24 Z", // Arrow shape
        fillColor: speed > 0 ? "#00FF00" : "#FF0000", // Green for moving, red for stopped
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "#000000",
        rotation: heading,
        scale: 1,
        anchor: { x: 12, y: 12 }, // Using plain object instead of google.maps.Point
      };
    },

    formatDuration(durationDisplay) {
      const hours = parseInt(durationDisplay);
      if (isNaN(hours)) return durationDisplay;

      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;

      if (days === 0) return `${hours} hours`;
      if (remainingHours === 0) return `${days} days`;
      return `${days} days, ${remainingHours} hours`;
    },
    kmToMph(kmValue) {
      // Extract the numeric value if it's a string with "km/h"
      const km = parseFloat(kmValue.toString().replace("km/h", ""));
      if (isNaN(km)) return kmValue; // Return original if parsing fails

      // Convert km/h to mph (1 km/h = 0.621371 mph)
      const mph = (km * 0.621371).toFixed(1);
      return `${mph} mph`;
    },
    getTimeElapsed(timestamp) {
      const now = new Date();
      const startTime = new Date(timestamp);
      const diffInMs = now - startTime;

      // Convert to hours, minutes, seconds
      const hours = Math.floor(diffInMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

      // Format the output
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    },
    //   startTime() {
    //   // Update every second
    //   this.timer = setInterval(() => {
    //     // Force template update
    //     this.$forceUpdate();
    //   }, 1000);
    //  },
    startTimer() {
      // Update every second
      this.timer = setInterval(() => {
        // Force template update
        this.$forceUpdate();
      }, 1000);
    },
    getDeviceStatus(device) {
      const speed = parseFloat(
        device.latest_device_point.device_point_detail.speed.display
      );
      const statusTime =
        device.latest_device_point.device_state.drive_status_begin_time;

      if (speed > 0) {
        return {
          status: "Moving",
          time: this.getTimeElapsed(statusTime),
        };
      } else {
        return {
          status: "Stopped",
          time: this.formatDuration(
            device.latest_device_point.device_state.drive_status_duration
              .display
          ),
        };
      }
    },
    handleMarkerClick(device) {
      console.log("Clicked device:", device);

      // Toggle selection
      this.selectedDevice =
        this.selectedDevice === device.device_id ? null : device.device_id;

      // If device is selected, update center and fetch address
      if (this.selectedDevice) {
        const position = this.getDevicePosition(device);
        this.defaultCenter = position;

        // Fetch address for the selected device
        this.reverseGeocode(position.lat, position.lng, device.device_id);
      }
    },

    async reverseGeocode(lat, lng, deviceId) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`
        );
        const data = await response.json();
        if (data.results && data.results[0]) {
          this.addressMap[deviceId] = data.results[0].formatted_address;
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        this.addressMap[deviceId] = "Address lookup failed";
      }
    },
    getDevicePosition(device) {
      if (device?.latest_device_point?.device_point_detail?.lat_lng) {
        return {
          lat: Number(
            device.latest_device_point.device_point_detail.lat_lng.lat
          ),
          lng: Number(
            device.latest_device_point.device_point_detail.lat_lng.lng
          ),
        };
      }
      return this.defaultCenter;
    },
    //  animateMarkerMovement(device, start, end) {
    //       const frames = 20; // Number of frames for animation
    //       let count = 0;

    //       const animateFrame = () => {
    //         count++;

    //         // Calculate intermediate position
    //         const lat = start.lat + (end.lat - start.lat) * (count / frames);
    //         const lng = start.lng + (end.lng - start.lng) * (count / frames);

    //         // Update device position
    //         device.latest_device_point.device_point_detail.lat_lng = {
    //           lat: lat,
    //           lng: lng
    //         };

    //         // Force update
    //         this.devices = [...this.devices];

    //         // Continue animation if not done
    //         if (count < frames) {
    //           requestAnimationFrame(animateFrame);
    //         }
    //       };

    //       // Start animation
    //       requestAnimationFrame(animateFrame);
    //     },
    initWebSocket() {
      const wsUrl = `ws://${window.location.hostname}:8080/ws`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connection established");
      };

      this.ws.onmessage = (event) => {
        const updatedDevice = JSON.parse(event.data);
        console.log("Received WebSocket update:", updatedDevice);

        // Find and update the device
        this.devices = this.devices.map((device) => {
          if (device.device_id === updatedDevice.device_id) {
            const currentPos = this.getDevicePosition(device);
            const newPos = {
              lat: Number(
                updatedDevice.latest_device_point.device_point_detail.lat_lng
                  .lat
              ),
              lng: Number(
                updatedDevice.latest_device_point.device_point_detail.lat_lng
                  .lng
              ),
            };

            // Check if position actually changed
            if (
              currentPos.lat !== newPos.lat ||
              currentPos.lng !== newPos.lng
            ) {
              // Cancel any existing animation for this device
              if (this.animationQueue.has(device.device_id)) {
                cancelAnimationFrame(this.animationQueue.get(device.device_id));
              }

              // Start new animation
              this.animateMarkerMovement(
                device,
                currentPos,
                newPos,
                updatedDevice
              );
            } else {
              // Just update device data if position hasn't changed
              return { ...device, ...updatedDevice };
            }
          }
          return device;
        });
      };
    },
    animateMarkerMovement(device, start, end, updatedDevice) {
      const duration = 1000; // Animation duration in ms
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease in-out function for smoother movement
        const easeProgress =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Calculate current position
        const currentLat = start.lat + (end.lat - start.lat) * easeProgress;
        const currentLng = start.lng + (end.lng - start.lng) * easeProgress;

        // Update the device with new position
        const updatedDeviceData = { ...device, ...updatedDevice };
        updatedDeviceData.latest_device_point.device_point_detail.lat_lng = {
          lat: currentLat,
          lng: currentLng,
        };

        // Update devices array
        this.devices = this.devices.map((d) =>
          d.device_id === device.device_id ? updatedDeviceData : d
        );

        // Continue animation if not complete
        if (progress < 1) {
          const frameId = requestAnimationFrame(animate);
          this.animationQueue.set(device.device_id, frameId);
        } else {
          // Clean up after animation completes
          this.animationQueue.delete(device.device_id);
        }
      };

      // Start animation
      const frameId = requestAnimationFrame(animate);
      this.animationQueue.set(device.device_id, frameId);
    },
  },

  mounted() {
    // Fetch initial data using the API
    fetch("http://localhost:8080/api/v1/devices")
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          this.devices = data;
          this.devices = [...this.devices]; // Ensure reactivity
          console.log("Initial device data fetched:", this.devices);
        }
      })
      .catch((error) => {
        console.error("Error fetching initial device data:", error);
      });

    // Initialize WebSocket for real-time updates
    this.initWebSocket();
    this.startTimer();
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    // Close WebSocket connection when component is destroyed
    if (this.ws) {
      this.ws.close();
    }
  },
};
</script>

<style>
.info-window {
  padding: 1rem;
  min-width: 200px;
}

.info-window h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.device-info p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.status-panel {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
}

.status-label {
  font-weight: bold;
}

.status-item:last-child {
  border-bottom: none;
}
</style>
