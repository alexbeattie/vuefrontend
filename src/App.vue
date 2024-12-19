<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <div class="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div class="p-4">
        <h2 class="text-lg font-semibold mb-4">Devices</h2>

        <!-- Filter Controls -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Sort by</label
          >
          <select
            v-model="sortBy"
            class="w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="active">Most Active</option>
            <option value="inactive">Least Active</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Filter</label
          >
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="filters.ignitionOn"
                class="rounded text-blue-600"
              />
              <span class="ml-2">Ignition On</span>
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="filters.ignitionOff"
                class="rounded text-blue-600"
              />
              <span class="ml-2">Ignition Off</span>
            </label>
          </div>
        </div>

        <!-- Device List -->
        <div class="space-y-2">
          <div
            v-for="device in sortedAndFilteredDevices"
            :key="device.device_id"
            @click="handleSidebarDeviceClick(device)"
            class="p-3 rounded-lg cursor-pointer"
            :class="{
              'bg-blue-50 border-blue-500': isDeviceSelected(device.device_id),
              'hover:bg-gray-50 border-transparent': !isDeviceSelected(
                device.device_id
              ),
              border: true,
            }"
          >
            <div class="flex justify-between items-center">
              <span class="font-medium">{{ device.display_name }}</span>
              <span
                class="px-2 py-1 rounded-full text-xs"
                :class="getDeviceStatus(device).className"
              >
                {{ getDeviceStatus(device).status }}
              </span>
            </div>
            <div class="text-sm text-gray-500 mt-1">
              <!-- Show address if online, otherwise show last seen time -->
              <template
                v-if="getDeviceConnectivityStatus(device).status === 'Online'"
              >
                <div>{{ getAddressForDevice(device.device_id) }}</div>
              </template>
              <template v-else>
                <div>Last seen: {{ formatTimeAgo(device.updated_at) }}</div>
              </template>
              <div class="flex items-center space-x-2">
                <template
                  v-if="
                    device?.latest_device_point?.device_point_detail
                      ?.cell_signal
                  "
                >
                  <div class="flex items-center">
                    <span class="text-xs"
                      >Signal:
                      {{
                        device.latest_device_point.device_point_detail
                          .cell_signal
                      }}%</span
                    >
                    <div class="ml-1 w-4 h-2.5 bg-gray-200 rounded">
                      <div
                        class="h-full rounded"
                        :class="{
                          'bg-green-500':
                            device.latest_device_point.device_point_detail
                              .cell_signal > 70,
                          'bg-yellow-500':
                            device.latest_device_point.device_point_detail
                              .cell_signal > 30 &&
                            device.latest_device_point.device_point_detail
                              .cell_signal <= 70,
                          'bg-red-500':
                            device.latest_device_point.device_point_detail
                              .cell_signal <= 30,
                        }"
                        :style="{
                          width: `${device.latest_device_point.device_point_detail.cell_signal}%`,
                        }"
                      ></div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <div class="h-16 border-b border-gray-200 flex items-center px-4">
        <h1 class="text-xl font-semibold">GPS Tracker</h1>

        <!-- Map Settings Button -->
        <button
          @click="showMapSettings = true"
          class="ml-auto bg-white rounded-lg p-2 hover:bg-gray-50"
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
      </div>

      <div class="flex-1 relative">
        <GoogleMap
          ref="map"
          :api-key="apiKey"
          :center="defaultCenter"
          :zoom="8"
          :mapTypeId="mapSettings.mapType"
          class="w-full h-full"
          @ready="initializeLayers"
        >
          <template v-if="hasDevices">
            <template v-for="device in devices" :key="device.device_id">
              <Marker
                :options="{
                  position: getDevicePosition(device),
                  title: device.display_name,
                  icon: getMarkerIcon(device),
                  optimized: false,
                  visible: true, // Force visible for debugging
                }"
                @click="handleMarkerClick(device)"
                @mount="(marker) => onMarkerMount(device.device_id, marker)"
              />

              <InfoWindow
                v-if="isDeviceSelected(device.device_id)"
                :options="{
                  position: getDevicePosition(device),
                }"
                @closeclick="handleInfoWindowClose"
              >
                <div class="info-window">
                  <h3>{{ device.display_name }}</h3>
                  <div class="device-info">
                    <div class="text-sm text-gray-500 mt-1">
                      <div>{{ getAddressForDevice(device.device_id) }}</div>
                      <div>
                        Last updated: {{ formatTimeAgo(device.updated_at) }}
                      </div>
                    </div>
                    <p>
                      Speed:
                      {{
                        kmToMph(
                          device.latest_device_point.device_point_detail.speed
                            .display
                        )
                      }}
                    </p>
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
        :modelValue="mapSettings"
        @update:modelValue="updateSettings"
        @close="showMapSettings = false"
      />
    </Transition>
  </div>
</template>

<script>
// Import required dependencies and components
import { mapState, mapActions, mapGetters } from "vuex";
import { GoogleMap, Marker, InfoWindow } from "vue3-google-map";
import MapSettings from "./MapSettings.vue";

export default {
  name: "App",

  components: {
    GoogleMap,
    Marker,
    InfoWindow,
    MapSettings,
  },

  data() {
    return {
      // Keep only component-specific state here
      sortBy: "active",
      sortOptions: [
        { value: "active", label: "Most Active" },
        { value: "inactive", label: "Least Active" },
        { value: "speed", label: "Current Speed" },
        { value: "distance", label: "Trip Distance" },
        { value: "voltage", label: "Battery Voltage" },
        { value: "signal", label: "Signal Strength" },
      ],
      filters: {
        ignitionOn: false,
        ignitionOff: false,
        overSpeedLimit: false,
        lowBattery: false, // < 12V
        poorSignal: false, // < 8 satellites
        driving: false,
        stopped: false,
      },
      apiKey: process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
      defaultCenter: { lat: 34.0522, lng: -118.2437 },
      showMapSettings: false,

      // Map instance-specific items
      trafficLayer: null,
      weatherLayer: null,
      weatherMarkers: [],

      // Instance-specific controls
      timer: null,
      pollingInterval: null, // Add this line

      animationQueue: new Map(),
      markerRefs: new Map(),
    };
  },
  // Map Vuex state and getters to component
  computed: {
    // Map Settings state
    ...mapState("mapSettings", {
      mapSettings: (state) => state.settings,
      isMapInitialized: (state) => state.isMapInitialized,
    }),

    // Devices state
    ...mapState("devices", {
      devices: (state) => {
        console.log("Devices from state:", state.devices);
        return state.devices;
      },
    }),

    // Device getters
    ...mapGetters("devices", {
      getAddressForDevice: "getAddressForDevice",
      isDeviceSelected: "isDeviceSelected",
      hasDevices: "hasDevices", // Add this line
    }),
    sortedAndFilteredDevices() {
  let filteredDevices = [...this.devices];
  
  // Apply filters
  filteredDevices = filteredDevices.filter(device => {
    const metrics = this.getDeviceMetrics(device);
    
    if (this.filters.ignitionOn && !metrics.ignitionOn) return false;
    if (this.filters.ignitionOff && metrics.ignitionOn) return false;
    if (this.filters.overSpeedLimit && !metrics.isOverSpeedLimit) return false;
    if (this.filters.lowBattery && metrics.batteryVoltage >= 12) return false;
    if (this.filters.poorSignal && metrics.signalStrength >= 8) return false;
    if (this.filters.driving && metrics.driveStatus !== 'driving') return false;
    if (this.filters.stopped && metrics.driveStatus !== 'stopped') return false;
    
    return true;
  });
  
  // Apply sorting
  filteredDevices.sort((a, b) => {
    const metricsA = this.getDeviceMetrics(a);
    const metricsB = this.getDeviceMetrics(b);
    
    switch (this.sortBy) {
      case 'speed':
        return metricsB.currentSpeed - metricsA.currentSpeed;
      case 'distance':
        return metricsB.tripDistance - metricsA.tripDistance;
      case 'voltage':
        return metricsB.batteryVoltage - metricsA.batteryVoltage;
      case 'signal':
        return metricsB.signalStrength - metricsA.signalStrength;
      // ... existing active/inactive cases
    }
  });
  
  return filteredDevices;
},
  },
  // Watch for changes in Vuex state
  watch: {
    "mapSettings.showTraffic": {
      async handler(newValue) {
        try {
          // Make sure the map is ready before doing anything
          if (!this.$refs.map?.map) {
            console.log(
              "Map not ready yet, will try again when map initializes"
            );
            return;
          }

          if (newValue) {
            // User wants to show traffic
            await this.initializeTrafficLayer();
          } else {
            // User wants to hide traffic
            this.removeTrafficLayer();
          }
        } catch (error) {
          console.error("Error handling traffic toggle:", error);
          // If something goes wrong, revert the setting
          await this.updateSetting({
            key: "showTraffic",
            value: false,
          });
        }
      },
    },
  },

  // watch: {
  //   mapSettings: {
  //     async handler(newSettings, oldSettings) {
  //       if (JSON.stringify(newSettings) === JSON.stringify(oldSettings)) return; // No change

  //       if (!this.googleMapsLoaded) {
  //         const isReady = await this.waitForGoogleMaps();
  //         if (!isReady) return;
  //       }

  //       try {
  //         // Perform updates only when necessary
  //         if (newSettings.mapType !== oldSettings.mapType) {
  //           this.$refs.map.map.setMapTypeId(newSettings.mapType);
  //         }

  //         if (newSettings.showTraffic !== oldSettings.showTraffic) {
  //           await this.updateMapLayers();
  //         }

  //         this.updateMarkerVisibility();
  //         this.saveMapSettings();
  //       } catch (error) {
  //         console.error("Error applying map settings:", error);
  //       }
  //     },
  //     deep: true,
  //   },
  // },
  // computed: {
  // ...mapState('mapSettings', {
  //     mapSettings: state => state.settings,
  //     isMapInitialized: state => state.isMapInitialized,
  //     googleMapsLoaded: state => state.googleMapsLoaded
  //   }),

  //   ...mapState('devices', {
  //     devices: state => state.devices,
  //     selectedDevice: state => state.selectedDevice,
  //     addressMap: state => state.addressMap
  //   }),

  //   ...mapGetters('devices', [
  //     'getDeviceById',
  //     'getAddressForDevice',
  //     'isDeviceSelected'
  //   ])
  // },
  methods: {
    // Map Vuex actions to methods
    ...mapActions("mapSettings", [
      "initializeMap",
      "loadSettings",
      "updateSetting",
    ]),

    ...mapActions("devices", [
      "fetchDevices",
      "selectDevice",
      "updateAddress",
      "setWebsocketConnected",
    ]),
    isDeviceActive(device) {
      return (
        parseFloat(
          device.latest_device_point.device_point_detail.speed.display
        ) > 0
      );
    },

    getDeviceConnectivityStatus(device) {
      if (!device?.latest_device_point?.online) {
        return {
          status: "Offline",
          className: "bg-red-100 text-red-800",
        };
      }

      const signalStrength =
        device?.latest_device_point?.device_point_detail?.cell_signal;
      if (!signalStrength || signalStrength < 1) {
        return {
          status: "No Signal",
          className: "bg-yellow-100 text-yellow-800",
        };
      }

      return {
        status: "Online",
        className: "bg-green-100 text-green-800",
      };
    },

    formatTimeAgo(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);

      if (seconds < 60) return "just now";

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;

      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;

      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    },

    // Map initialization methods
    async initializeLayers() {
      try {
        await this.initializeMap();

        if (this.mapSettings.showTraffic) {
          await this.initializeTrafficLayer();
        }
      } catch (error) {
        console.error("Layer initialization error:", error);
      }
    },

    async initializeTrafficLayer() {
      try {
        // First, we'll implement a proper check for map readiness
        const mapInstance = await this.ensureMapIsReady();

        // Now we can safely proceed with traffic layer initialization
        if (!this.trafficLayer) {
          // Make sure the Google Maps API is available
          if (!window.google?.maps) {
            throw new Error("Google Maps API not yet loaded");
          }

          // Create our traffic layer
          this.trafficLayer = new window.google.maps.TrafficLayer({
            map: null, // Initialize without a map to prevent immediate rendering
          });
        }

        // Now safely set the map
        this.trafficLayer.setMap(mapInstance);
        console.log("Traffic layer successfully enabled");
      } catch (error) {
        console.error("Traffic layer initialization failed:", error);
        // Make sure to revert the setting in Vuex
        await this.updateSetting({
          key: "showTraffic",
          value: false,
        });
        throw error;
      }
    },

    // Add this new method to handle map initialization checking
    async ensureMapIsReady() {
      return new Promise((resolve, reject) => {
        // If map is already ready, resolve immediately
        if (this.$refs.map?.map && window.google?.maps) {
          resolve(this.$refs.map.map);
          return;
        }

        // Otherwise, wait for the map to be ready
        let attempts = 0;
        const maxAttempts = 20;
        const interval = setInterval(() => {
          attempts++;

          if (this.$refs.map?.map && window.google?.maps) {
            clearInterval(interval);
            resolve(this.$refs.map.map);
            return;
          }

          if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error("Map initialization timed out"));
          }
        }, 250); // Check every 250ms
      });
    },

    removeTrafficLayer() {
      if (this.trafficLayer) {
        this.trafficLayer.setMap(null);
        console.log("Traffic layer disabled");
      }
    },
    getDeviceMetrics(device) {
      return {
        // Speed and Movement
        currentSpeed:
          device?.latest_device_point?.device_point_detail?.speed?.value || 0,
        speedLimit:
          device?.latest_device_point?.device_point_external?.posted_speed_limit
            ?.value,
        isOverSpeedLimit:
          parseFloat(device?.latest_device_point?.params?.mph_over_posted) > 0,
        speedOverLimit:
          parseFloat(device?.latest_device_point?.params?.mph_over_posted) || 0,

        // Vehicle Status
        ignitionOn:
          device?.latest_device_point?.device_point_detail?.acc || false,
        batteryVoltage:
          parseFloat(
            device?.latest_device_point?.params?.obd_battery_voltage
          ) || 0,
        engineRPM: parseInt(device?.latest_device_point?.params?.eng_rpm) || 0,

        // Trip Data
        tripDistance:
          device?.latest_device_point?.device_point_detail?.trip_distance
            ?.value || 0,
        driveTime:
          device?.latest_device_point?.device_state?.drive_status_duration
            ?.value || 0,

        // Signal Quality
        signalStrength:
          parseInt(
            device?.latest_device_point?.device_point_detail?.num_satellites
          ) || 0,
        gpsAccuracy:
          parseFloat(device?.latest_device_point?.device_point_detail?.hdop) ||
          0,

        // Status
        driveStatus:
          device?.latest_device_point?.device_state?.drive_status || "unknown",
        isOnline: device?.online || false,
      };
    },
    getLastStoppedTime(device) {
      const driveStatus =
        device?.latest_device_point?.device_state?.drive_status;
      const statusTime =
        device?.latest_device_point?.device_state?.drive_status_begin_time;
      const duration =
        device?.latest_device_point?.device_state?.drive_status_duration
          ?.display;

      if (driveStatus === "stopped") {
        return {
          status: "Stopped",
          since: statusTime,
          duration: duration,
        };
      } else {
        // For currently driving vehicles, we'd need to track their last stop in state
        return null;
      }
    },
    handleSidebarDeviceClick(device) {
      // Select the device
      this.selectDevice(device.device_id);

      // Get and update the position
      const position = this.getDevicePosition(device);
      this.defaultCenter = position;

      // Trigger geocoding
      this.reverseGeocode(position.lat, position.lng, device.device_id);
    },
    // Device interaction methods
    handleMarkerClick(device) {
      this.selectDevice(device.device_id);

      const position = this.getDevicePosition(device);
      this.defaultCenter = position;
      this.reverseGeocode(position.lat, position.lng, device.device_id);
    },

    handleInfoWindowClose() {
      this.selectDevice(null);
    },
    updateSettings(newSettings) {
      // Update all settings at once through Vuex
      Object.entries(newSettings).forEach(([key, value]) => {
        this.updateSetting({ key, value });
      });
    },

    // Utility methods
    async reverseGeocode(lat, lng, deviceId) {
      if (!lat || !lng || !deviceId) {
        console.warn("Missing parameters for geocoding:", {
          lat,
          lng,
          deviceId,
        });
        return;
      }

      try {
        console.log("Starting reverse geocoding for device:", deviceId);

        // First check if we already have the address
        if (this.$store.state.devices.addressMap[deviceId]) {
          console.log("Address already cached for device:", deviceId);
          return;
        }

        // Set a temporary loading state
        await this.updateAddress({
          deviceId,
          address: "Loading address...",
        });

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Geocoding response for device:", deviceId, data.status);

        if (data.status === "OK" && data.results?.[0]) {
          await this.updateAddress({
            deviceId,
            address: data.results[0].formatted_address,
          });
          console.log("Address updated for device:", deviceId);
        } else {
          throw new Error(`Geocoding failed: ${data.status}`);
        }
      } catch (error) {
        console.error("Geocoding error for device:", deviceId, error);
        await this.updateAddress({
          deviceId,
          address: "Address lookup failed",
        });
      }
    },

    // Helper method to check if coordinates are valid
    isValidCoordinate(lat, lng) {
      const validLat =
        typeof lat === "number" && !isNaN(lat) && lat >= -90 && lat <= 90;
      const validLng =
        typeof lng === "number" && !isNaN(lng) && lng >= -180 && lng <= 180;
      return validLat && validLng;
    },
    // async waitForGoogleMaps() {
    //   // Instead of checking window.google directly, we'll use the map component's state
    //   const MAX_TRIES = 20;
    //   const DELAY = 250; // 250ms between checks
    //   let attempts = 0;

    //   while (attempts < MAX_TRIES) {
    //     // Check if our map component exists and has initialized
    //     if (this.$refs.map?.map) {
    //       this.googleMapsLoaded = true;
    //       console.log("Map component ready");
    //       return true;
    //     }

    //     // Wait before next check
    //     await new Promise((resolve) => setTimeout(resolve, DELAY));
    //     attempts++;

    //     if (attempts % 4 === 0) {
    //       // Log every second
    //       console.log(`Waiting for map to initialize... (${attempts / 4}s)`);
    //     }
    //   }

    //   console.error("Map initialization timed out");
    //   return false;
    // },
    //  async initializeTrafficLayer() {
    //   try {
    //     if (!window.google?.maps?.TrafficLayer) {
    //       throw new Error('TrafficLayer not available');
    //     }

    //     if (!this.trafficLayer) {
    //       this.trafficLayer = new window.google.maps.TrafficLayer();
    //     }

    //     this.trafficLayer.setMap(this.$refs.map.map);
    //     await this.setTrafficInitialized(true);
    //     console.log('Traffic layer enabled');

    //   } catch (error) {
    //     console.error('Traffic layer initialization failed:', error);
    //     await this.setTrafficInitialized(false);
    //     throw error;
    //   }
    // },

    // removeTrafficLayer() {
    //   try {
    //     if (this.trafficLayer) {
    //       this.trafficLayer.setMap(null);
    //       this.setTrafficInitialized(false);
    //       console.log('Traffic layer disabled');
    //     }
    //   } catch (error) {
    //     console.error('Error removing traffic layer:', error);
    //   }
    // },

    // async initializeLayers() {
    //   try {
    //     const isReady = await this.waitForGoogleMaps();
    //     if (!isReady) {
    //       console.warn("Cannot initialize layers - map not ready");
    //       return;
    //     }

    //     const google = window.google;
    //     if (this.mapSettings.showTraffic) {
    //       if (!this.trafficLayer) {
    //         this.trafficLayer = new google.maps.TrafficLayer();
    //       }
    //       this.trafficLayer.setMap(this.$refs.map.map);
    //       console.log("Traffic layer enabled");
    //     } else if (this.trafficLayer) {
    //       this.trafficLayer.setMap(null);
    //       console.log("Traffic layer disabled");
    //     }
    //   } catch (error) {
    //     console.error("Layer initialization error:", error);
    //   }
    // },
    // handleMarkerClick(device) {
    //   console.log("Clicked device:", device);

    //   // Toggle selection
    //   this.selectedDevice =
    //     this.selectedDevice === device.device_id ? null : device.device_id;

    //   // If device is selected, update center and fetch address
    //   if (this.selectedDevice) {
    //     const position = this.getDevicePosition(device);
    //     this.defaultCenter = position;

    //     // Fetch address for the selected device
    //     this.reverseGeocode(position.lat, position.lng, device.device_id);
    //   }
    // },

    // async reverseGeocode(lat, lng, deviceId) {
    //   try {
    //     const response = await fetch(
    //       `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`
    //     );
    //     const data = await response.json();
    //     if (data.results && data.results[0]) {
    //       this.addressMap[deviceId] = data.results[0].formatted_address;
    //     }
    //   } catch (error) {
    //     console.error("Geocoding error:", error);
    //     this.addressMap[deviceId] = "Address lookup failed";
    //   }
    // },

    // async updateMapLayers() {
    //   try {
    //     // First ensure map is ready
    //     if (!this.$refs.map?.map) {
    //       console.log("Map not yet ready");
    //       return;
    //     }

    //     // Get Google Maps API from window object
    //     const google = window.google;
    //     if (!google?.maps) {
    //       console.log("Google Maps API not yet loaded");
    //       return;
    //     }

    //     // Handle traffic layer
    //     if (this.mapSettings.showTraffic) {
    //       if (!google.maps.TrafficLayer) {
    //         // Check if TrafficLayer is available
    //         console.error("TrafficLayer is not available on google maps.");
    //         return;
    //       }
    //       if (!this.trafficLayer) {
    //         // Create new TrafficLayer using Google Maps API directly
    //         this.trafficLayer = new google.maps.TrafficLayer();
    //       }
    //       // Set the map for the traffic layer
    //       this.trafficLayer.setMap(this.$refs.map.map);
    //       console.log("Traffic layer enabled");
    //     } else if (this.trafficLayer) {
    //       // Remove traffic layer by setting map to null
    //       this.trafficLayer.setMap(null);
    //       console.log("Traffic layer disabled");
    //     }
    //   } catch (error) {
    //     console.error("Error updating map layers:", error);
    //     // Log more details about the error to help with debugging
    //     console.log("Error details:", {
    //       mapReady: !!this.$refs.map?.map,
    //       googleMapsAvailable: !!window.google?.maps,
    //       trafficLayerExists: !!this.trafficLayer,
    //     });
    //   }
    // },

    async fetchWeatherData() {
      if (!this.mapSettings.showWeather || !this.$refs.map?.map) return;

      try {
        // Get the map bounds to fetch weather for the visible area
        const bounds = this.$refs.map.map.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

        // Example using OpenWeatherMap API (you'll need an API key)
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/box/city?bbox=${sw.lng()},${sw.lat()},${ne.lng()},${ne.lat()},10&appid=${
            this.openWeatherApiKey
          }`
        );
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.statusText}`);
        }

        const data = await response.json();
        await this.displayWeatherOverlay(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        // Disable weather layer if there's an error
        this.mapSettings.showWeather = false;
      }
    },

    displayWeatherOverlay(weatherData) {
      this.clearWeatherOverlay();

      if (!weatherData.list || !Array.isArray(weatherData.list)) {
        console.error("Invalid weather data format");
        return;
      }
      // Create weather markers
      weatherData.list.forEach((location) => {
        const google = this.$refs.map?.map?.getMap()?.constructor;
        if (!google) {
          console.error("Google Maps API not available");
          return;
        }
        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lon },
          map: this.$refs.map.map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: this.getWeatherColor(location.main.temp),
            fillOpacity: 0.7,
            strokeWeight: 1,
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
          <div class="weather-info">
            <h3>${location.name}</h3>
            <p>Temperature: ${this.kelvinToFahrenheit(location.main.temp)}°F</p>
            <p>Conditions: ${location.weather[0].main}</p>
            <p>Humidity: ${location.main.humidity}%</p>
          </div>
        `,
        });
        marker.addListener("click", () => {
          infoWindow.open(this.$refs.map.map, marker);
        });

        this.weatherMarkers.push(marker);
      });
    },

    clearWeatherOverlay() {
      this.weatherMarkers.forEach((marker) => marker.setMap(null));
      this.weatherMarkers = [];
    },

    getWeatherColor(kelvin) {
      const celsius = kelvin - 273.15;
      if (celsius < 0) return "#00ffff"; // Very cold
      if (celsius < 10) return "#0099ff"; // Cold
      if (celsius < 20) return "#00ff00"; // Cool
      if (celsius < 30) return "#ffff00"; // Warm
      return "#ff0000"; // Hot
    },
    kelvinToFahrenheit(kelvin) {
      return (((kelvin - 273.15) * 9) / 5 + 32).toFixed(1);
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

      // First check connectivity
      const connectivity = this.getDeviceConnectivityStatus(device);
      if (connectivity.status !== "Online") {
        return {
          status: connectivity.status,
          time: this.formatTimeAgo(device.updated_at),
          className: connectivity.className,
        };
      }

      // If online, then show movement status
      if (speed > 0) {
        return {
          status: "Moving",
          time: this.getTimeElapsed(statusTime),
          className: "bg-green-100 text-green-800",
        };
      } else {
        return {
          status: "Stopped",
          time: this.formatDuration(
            device.latest_device_point.device_state.drive_status_duration
              .display
          ),
          className: "bg-gray-100 text-gray-800",
        };
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
    //     initWebSocket() {
    //       const wsUrl = `ws://${window.location.hostname}:8080/ws`;
    //       this.ws = new WebSocket(wsUrl);

    //       this.ws.onopen = () => {
    //         console.log("WebSocket connection established");

    //       };

    //       this.ws.onmessage = async (event) => {
    //         const updatedDevice = JSON.parse(event.data);
    //         console.log("Received WebSocket update:", updatedDevice);

    //         // Instead of directly modifying devices array, use Vuex
    //     const deviceToUpdate = this.devices.find(
    //       device => device.device_id === updatedDevice.device_id
    //     );

    //     if (deviceToUpdate) {
    //       const currentPos = this.getDevicePosition(deviceToUpdate);
    //       const newPos = {
    //         lat: Number(updatedDevice.latest_device_point.device_point_detail.lat_lng.lat),
    //         lng: Number(updatedDevice.latest_device_point.device_point_detail.lat_lng.lng)
    //       };

    //       // If position changed, animate the movement
    //       if (currentPos.lat !== newPos.lat || currentPos.lng !== newPos.lng) {
    //         if (this.animationQueue.has(updatedDevice.device_id)) {
    //           cancelAnimationFrame(this.animationQueue.get(updatedDevice.device_id));
    //         }

    //         await this.animateMarkerMovement(
    //           deviceToUpdate,
    //           currentPos,
    //           newPos,
    //           updatedDevice
    //         );
    //       } else {
    //         // If position hasn't changed, just update the device data
    //         await this.$store.dispatch('devices/updateDevice', updatedDevice);
    //       }
    //     }
    //   };
    // },
    startPolling() {
      // Poll every 5 seconds
      this.pollingInterval = setInterval(async () => {
        try {
          await this.fetchDevices(); // This uses your existing Vuex action
          console.log("Devices updated from polling");
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 5000); // 5 second interval
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },

    animateMarkerMovement(device, start, end, updatedDevice) {
      const duration = 1000;
      const startTime = performance.now();

      const animate = async (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeProgress =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Calculate current position
        const currentPosition = {
          lat: start.lat + (end.lat - start.lat) * easeProgress,
          lng: start.lng + (end.lng - start.lng) * easeProgress,
        };

        // Update position through Vuex
        await this.$store.dispatch("devices/updateDevicePosition", {
          deviceId: device.device_id,
          position: currentPosition,
        });

        if (progress < 1) {
          const frameId = requestAnimationFrame(animate);
          this.animationQueue.set(device.device_id, frameId);
        } else {
          this.animationQueue.delete(device.device_id);
          // Final update with complete device data
          await this.$store.dispatch("devices/updateDevice", updatedDevice);
        }
      };

      const frameId = requestAnimationFrame(animate);
      this.animationQueue.set(device.device_id, frameId);
    },

    saveMapSettings() {
      localStorage.setItem("mapSettings", JSON.stringify(this.mapSettings));
    },
    loadMapSettings() {
      const settings = localStorage.getItem("mapSettings");
      if (settings) {
        const loadedSettings = JSON.parse(settings);
        // Merge loaded settings into existing mapSettings to avoid reactivity issues
        Object.assign(this.mapSettings, loadedSettings);
      }
    },
    updateMapSettings(key, value) {
      if (this.mapSettings[key] !== value) {
        this.mapSettings[key] = value;
        this.saveMapSettings();
      }
    },

    created() {
      this.loadMapSettings();
    },
    updateMarkerVisibility() {
      if (this.devices) {
        this.devices.forEach((device) => {
          const marker = this.markerRefs.get(device.device_id);
          if (marker) {
            // Update the marker visibility
            marker.setVisible(this.mapSettings.showDevices);
          }
        });
      }
    },

    fetchInitialData() {
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
    },
  },

  // Lifecycle hooks
  async mounted() {
    try {
      console.log("App mounted");
      await this.loadSettings();
      console.log("Settings loaded:", this.mapSettings);

      // Initial fetch with more debugging
      const initialDevices = await this.fetchDevices();
      console.log("Initial fetch response:", initialDevices);
      console.log(
        "Devices in store after fetch:",
        this.$store.state.devices.devices
      );
      console.log("Has devices?", this.hasDevices);

      // Start polling for updates
      this.startPolling();
      this.startTimer();
    } catch (error) {
      console.error("Mount error:", error);
    }
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.stopPolling(); // Stop polling when component unmounts
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
