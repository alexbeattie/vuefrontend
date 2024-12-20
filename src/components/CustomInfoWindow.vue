<template>
  <!-- This empty template is needed even though we create the content programmatically -->
  <div></div>
</template>
<script>
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
  methods: {
    initializeInfoWindow() {
      if (!window.google?.maps) {
        console.warn("Google Maps not yet loaded");
        return;
      }
      const content = document.createElement("div");
      content.className = "bg-white rounded-lg shadow-lg max-w-md";
      content.innerHTML = `
         <div class="relative px-4 py-2 border-b border-gray-200">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">${
        this.device.display_name
      }</h3>
      <span class="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ml-2 ${
        this.getDeviceStatus(this.device).className
      }">
        ${this.getDeviceStatus(this.device).status}
      </span>
    </div>
  </div>

        <div class="px-4 py-2">
          <div class="space-y-1.5">
            <div class="flex text-sm">
              <div class="font-medium text-gray-700 min-w-24">Address:</div>
              <div class="text-gray-900 truncate">
                ${this.getAddressForDevice(this.device.device_id)}
              </div>
            </div>

            <div class="flex text-sm">
              <div class="font-medium text-gray-700 min-w-24">Last Update:</div>
              <div class="text-gray-900">
                ${this.getDeviceStatus(this.device).time}
              </div>
            </div>

            <div class="flex text-sm">
              <div class="font-medium text-gray-700 min-w-24">Speed:</div>
              <div class="text-gray-900">
                ${this.kmToMph(this.device.latest_device_point.speed)}
              </div>
            </div>

            <div class="flex text-sm">
              <div class="font-medium text-gray-700 min-w-24">Heading:</div>
              <div class="text-gray-900">
                ${this.device.latest_device_point.angle}°
              </div>
            </div>

            <div class="flex text-sm">
              <div class="font-medium text-gray-700 min-w-24">Satellites:</div>
              <div class="text-gray-900">
                ${this.device.latest_device_point.params.gpslev}
              </div>
            </div>
          </div>
        </div>
      `;

      this.infoWindow = new window.google.maps.InfoWindow({
        content,
        position: this.position,
        pixelOffset: new window.google.maps.Size(0, -10),
            disableAutoPan: true

      });

       content.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  this.infoWindow.addListener('closeclick', () => {
    this.$emit('closeclick');
  });


      // Add the override styles
      const styleSheet = document.createElement("style");
      styleSheet.textContent = `
        .gm-style-iw {
          padding: 0 !important;
        }
        .gm-style-iw > button {
          display: none !important;
        }
        .gm-style-iw.gm-style-iw-c {
          padding: 0 !important;
          max-width: none !important;
        }
        .gm-style-iw-d {
          overflow: hidden !important;
          padding: 0 !important;
          max-width: none !important;
        }
        .gm-style-iw-tc {
          display: none !important;
        }
        .gm-style-iw + div {
          display: none !important;
        }
      `;
      document.head.appendChild(styleSheet);

      this.infoWindow.open(this.$parent.map);
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
