<template>
  <div v-if="false">
    <!-- Placeholder div -->
    <!-- This template section is unused because the content is rendered directly into the Google Maps InfoWindow -->
  </div>
</template>
<script>
import { getBatteryStatus } from "@/services/deviceMetrics";

export default {
  name: "CustomInfoWindow",
  props: {
    device: {
      type: Object,
      required: true,
    },
    position: {
      type: Object,
      required: true,
    },
  },
  inject: ["getDeviceStatus", "getAddressForDevice", "kmToMph"],
   mounted() {
    this.initializeInfoWindow();
  },
    watch: {
    // Add this watcher to handle position updates
    position: {
      handler(newPos) {
        if (this.infoWindow) {
          this.infoWindow.setPosition(newPos);
        }
      },
      deep: true
    }
  },
  methods: {
    getBatteryStatus,  // Add this line to make it available as a method
    getBatteryStatusHTML() {
      const voltage = this.device.latest_device_point?.params?.obd_battery_voltage;
      if (!voltage) return 'N/A';
      
      // Now use this.getBatteryStatus since it's a method
      const status = this.getBatteryStatus(voltage);
      let colorClass;
      
      switch(status) {
        case 'critical':
          colorClass = 'text-red-600';
          break;
        case 'low':
          colorClass = 'text-orange-500';
          break;
        case 'high':
          colorClass = 'text-yellow-500';
          break;
        case 'normal':
          colorClass = 'text-green-500';
          break;
        default:
          colorClass = 'text-gray-500';
      }
      
      return `<span class="${colorClass}">${voltage}V (${status})</span>`;
    },
    initializeInfoWindow() {
     try {
        if (!window.google?.maps) {
          console.warn("Google Maps not yet loaded");
          return;
        }

        const content = document.createElement("div");
        content.className = "bg-white rounded-lg shadow-lg max-w-md";
            content.style.paddingTop = "0"; // Removes top padding
    content.style.overflow = "hidden"; // Prevents scrolling
    content.style.maxHeight = "none"; // Ensures height is unrestricted
        content.className = "bg-white rounded-lg shadow-lg max-w-md custom-info-window";
        content.style.paddingTop = "0"; // Removes top padding
        // Add error handling for all the data access
        const deviceName = this.device?.display_name || 'Unknown Device';
        const deviceStatus = this.getDeviceStatus(this.device) || { className: '', status: 'Unknown' };
        const address = this.getAddressForDevice(this.device?.device_id) || 'Loading...';
        const speed = this.device?.latest_device_point?.speed ? this.kmToMph(this.device.latest_device_point.speed) : 'N/A';
        const angle = this.device?.latest_device_point?.angle || 'N/A';
        const satellites = this.device?.latest_device_point?.params?.gpslev || 'N/A';
        const batteryStatus = this.getBatteryStatusHTML();

          content.innerHTML = `
      <div class="relative px-4 py-2 mt-5 border-b border-gray-200" style="padding-top: 0;">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900">${deviceName}</h3>
          <span class="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ml-2 ${deviceStatus.className}">
            ${deviceStatus.status}
          </span>
        </div>
      </div>

      <div class="px-4 py-2">
        <div class="space-y-1.5">
          <div class="flex text-sm">
            <div class="font-medium text-gray-700 min-w-24">Address:</div>
            <div class="text-gray-900 truncate">${address}</div>
          </div>

          <div class="flex text-sm">
            <div class="font-medium text-gray-700 min-w-24">Last Update:</div>
            <div class="text-gray-900">${deviceStatus.time || "Unknown"}</div>
          </div>

          <div class="flex text-sm">
            <div class="font-medium text-gray-700 min-w-24">Speed:</div>
            <div class="text-gray-900">${speed}</div>
          </div>

          <div class="flex text-sm">
            <div class="font-medium text-gray-700 min-w-24">Heading:</div>
            <div class="text-gray-900">${angle}°</div>
          </div>

          <div class="flex text-sm">
            <div class="font-medium text-gray-700 min-w-24">Battery:</div>
            <div class="text-gray-900">${batteryStatus}</div>
          </div>

          <div class="flex text-sm">
            <div class="font-medium text-gray-700 min-w-24">Satellites:</div>
            <div class="text-gray-900">${satellites}</div>
          </div>
        </div>
      </div>
    `;


        // Create and open the info window
        this.infoWindow = new window.google.maps.InfoWindow({
          content,
          position: this.position,
          pixelOffset: new window.google.maps.Size(0, -10),
          disableAutoPan: true
        });

        // Add event listeners
        content.addEventListener('click', (e) => {
          e.stopPropagation();
        });

        this.infoWindow.addListener('closeclick', () => {
          this.$emit('closeclick');
        });

        // Open the info window
        if (this.$parent?.map) {
          this.infoWindow.open(this.$parent.map);
        } else {
          console.error('Parent map not found');
        }

      } catch (error) {
        console.error('Error initializing info window:', error);
      }
    },
  },

  beforeUnmount() {
    if (this.infoWindow) {
      this.infoWindow.close();
    }
  },
};
</script>
<style>
.gm-style-iw-chr {
  display: none !important;
}
.gm-style-iw-tc,
.gm-style-iw-t::after,
.gm-style-iw-tip {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}
</style>