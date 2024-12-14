<template>
  <div id="app">
    <h1>GPS Tracker</h1>

    <div style="position: relative; width: 100%; height: 500px">
      <GoogleMap
        :api-key="apiKey"
        :center="defaultCenter"
        :zoom="8"
        style="width: 100%; height: 100%"
        @click="handleMapClick"
      >
        <!-- Device markers -->
        <template v-if="devices && devices.length">
          <Marker
            v-for="device in devices"
            :key="device.device_id"
            :options="{
              position: getDevicePosition(device),
              title: device.display_name,
            }"
            @click="showInfoWindow(device)"
          >
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
                  <p>
                    Position:
                    {{
                      device.latest_device_point.device_point_detail.lat_lng
                        .lat
                    }},
                    {{
                      device.latest_device_point.device_point_detail.lat_lng.lng
                    }}
                  </p>
                  <p>
                    Speed:
                    {{
                      device.latest_device_point.device_point_detail.speed
                        .display
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
                </div>
              </div>
            </InfoWindow>
          </Marker>
        </template>

        <!-- Custom dropped markers -->
        <Marker
          v-for="(marker, index) in customMarkers"
          :key="index"
          :options="{
            position: marker.position,
          }"
          @click="showCustomMarkerInfo(index)"
        >
          <InfoWindow
            v-if="selectedCustomMarker === index"
            :options="{
              position: marker.position,
            }"
            @closeclick="selectedCustomMarker = null"
          >
            <div class="info-window">
              <h3>Custom Marker #{{ index + 1 }}</h3>
              <p>Lat: {{ marker.position.lat.toFixed(6) }}</p>
              <p>Lng: {{ marker.position.lng.toFixed(6) }}</p>
              <button @click="deleteMarker(index)" class="delete-btn">
                Delete Marker
              </button>
            </div>
          </InfoWindow>
        </Marker>
      </GoogleMap>
    </div>

    <!-- Controls -->
    <div class="controls-panel">
      <button @click="clearMarkers" class="clear-btn">
        Clear Custom Markers
      </button>
      <span>Custom Markers: {{ customMarkers.length }}</span>
    </div>

    <!-- Vehicle List -->
    <div class="status-panel" v-if="devices?.length">
      <div
        v-for="device in devices"
        :key="device.device_id"
        class="status-item"
      >
        <span class="status-label">{{ device.display_name }}</span>
        <span class="status-value">{{
          device.latest_device_point?.device_state?.drive_status || "Unknown"
        }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { GoogleMap, Marker, InfoWindow } from "vue3-google-map";

export default {
  name: "App",
  components: {
    GoogleMap,
    Marker,
    InfoWindow,
  },
  data() {
    return {
      apiKey: process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
      devices: [],
      selectedDevice: null,
      defaultCenter: { lat: 34.0522, lng: -118.2437 },
      customMarkers: [],
      selectedCustomMarker: null,
    };
  },
  methods: {
    getDevicePosition(device) {
      if (device?.latest_device_point?.device_point_detail?.lat_lng) {
        const lat = Number(
          device.latest_device_point.device_point_detail.lat_lng.lat
        );
        const lng = Number(
          device.latest_device_point.device_point_detail.lat_lng.lng
        );

        // Debug log
        console.log("Position for device:", device.display_name, { lat, lng });

        return {
          lat: lat,
          lng: lng,
        };
      }
      return this.defaultCenter;
    },
    showInfoWindow(device) {
      this.selectedDevice = device.device_id;
    },
    formatTime(timestamp) {
      if (!timestamp) return "Unknown";
      return new Date(timestamp).toLocaleString();
    },
    handleMapClick(event) {
      const position = {
        lat: event.lat,
        lng: event.lng,
      };
      this.customMarkers.push({ position });
    },
    showCustomMarkerInfo(index) {
      this.selectedCustomMarker = index;
      this.selectedDevice = null; // Close device info window if open
    },
    deleteMarker(index) {
      this.customMarkers.splice(index, 1);
      this.selectedCustomMarker = null;
    },
    clearMarkers() {
      this.customMarkers = [];
      this.selectedCustomMarker = null;
    },
    async fetchDeviceData() {
      try {
        const response = await fetch("http://localhost:8080/api/v1/devices");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        console.log("Response data:", data);

        // Set devices from the 'devices' array in the response
        if (data && data.devices) {
          this.devices = data.devices;
          console.log("Devices:", this.devices);

          // Update center to first device's location if available
          if (this.devices.length > 0 && this.devices[0].latest_device_point) {
            console.log(
              "First device position:",
              this.getDevicePosition(this.devices[0])
            );

            this.defaultCenter = this.getDevicePosition(this.devices[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching device data:", error);
      }
    },
  },
  mounted() {
    this.fetchDeviceData();
    setInterval(this.fetchDeviceData, 5000);
  },
  beforeUnmount() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  },
};
</script>

<style>
.info-window {
  padding: 0.5rem;
  min-width: 200px;
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
