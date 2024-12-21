// services/deviceMetrics.js

export function getDeviceMetrics(device) {
  return {
    // Speed and Movement
    currentSpeed: device?.latest_device_point?.device_point_detail?.speed?.value || 0,
    speedLimit: device?.latest_device_point?.device_point_external?.posted_speed_limit?.value,
    isOverSpeedLimit: parseFloat(device?.latest_device_point?.params?.mph_over_posted) > 0,
    speedOverLimit: parseFloat(device?.latest_device_point?.params?.mph_over_posted) || 0,

    // Vehicle Status
    ignitionOn: device?.latest_device_point?.device_point_detail?.acc || false,
    batteryVoltage: parseFloat(device?.latest_device_point?.params?.obd_battery_voltage) || 0,
    engineRPM: parseInt(device?.latest_device_point?.params?.eng_rpm) || 0,

    // Trip Data
    tripDistance: device?.latest_device_point?.device_point_detail?.trip_distance?.value || 0,
    driveTime: device?.latest_device_point?.device_state?.drive_status_duration?.value || 0,
    driveTimeFormatted: device?.latest_device_point?.device_state?.drive_status_duration?.display || '0s',

    // Signal Quality
    signalStrength: parseInt(device?.latest_device_point?.device_point_detail?.num_satellites) || 0,
    gpsAccuracy: parseFloat(device?.latest_device_point?.device_point_detail?.hdop) || 0,

    // Location
    position: {
      lat: device?.latest_device_point?.device_point_detail?.lat_lng?.lat,
      lng: device?.latest_device_point?.device_point_detail?.lat_lng?.lng
    },

    // Status
    driveStatus: device?.latest_device_point?.device_state?.drive_status || 'unknown',
    driveStatusSince: device?.latest_device_point?.device_state?.drive_status_begin_time,
    isOnline: device?.online || false,
    lastUpdated: device?.latest_device_point?.dt_tracker,

    // Device Info
    displayName: device?.display_name,
    deviceId: device?.device_id,
    model: device?.model,
    make: device?.make
  };
}

export const BATTERY_THRESHOLDS = {
  LOW: 12.0,
  CRITICAL: 11.5,
  NORMAL: 13.0,
  HIGH: 14.5
};

export const SIGNAL_THRESHOLDS = {
  POOR: 8,
  FAIR: 12,
  GOOD: 16
};

export const SPEED_STATUSES = {
  STOPPED: 0,
  SLOW: 30,
  NORMAL: 60,
  FAST: 80
};

export function getBatteryStatus(voltage) {
  if (voltage <= BATTERY_THRESHOLDS.CRITICAL) return 'critical';
  if (voltage <= BATTERY_THRESHOLDS.LOW) return 'low';
  if (voltage >= BATTERY_THRESHOLDS.HIGH) return 'high';
  if (voltage >= BATTERY_THRESHOLDS.NORMAL) return 'normal';
  return 'warning';
}

export function getSignalStatus(satellites) {
  if (satellites >= SIGNAL_THRESHOLDS.GOOD) return 'good';
  if (satellites >= SIGNAL_THRESHOLDS.FAIR) return 'fair';
  return 'poor';
}
export function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Never';

  const now = new Date();
  const then = new Date(timestamp);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
export function formatDuration(seconds) {
  if (!seconds) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 && hours === 0) parts.push(`${remainingSeconds}s`);

  return parts.join(' ');
}

export function getDeviceStatusClass(metrics) {
  if (!metrics.isOnline) return 'bg-red-100 text-red-800';
  if (metrics.signalStrength < SIGNAL_THRESHOLDS.POOR) return 'bg-yellow-100 text-yellow-800';
  if (metrics.batteryVoltage <= BATTERY_THRESHOLDS.LOW) return 'bg-orange-100 text-orange-800';
  if (metrics.isOverSpeedLimit) return 'bg-purple-100 text-purple-800';
  if (metrics.currentSpeed > 0) return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
}