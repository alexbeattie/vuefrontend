// src/utils/deviceMetrics.js

export const getDeviceMetrics = (device) => {
  return {
    currentSpeed: device?.latest_device_point?.device_point_detail?.speed?.value || 0,
    speedLimit: device?.latest_device_point?.device_point_external?.posted_speed_limit?.value,
    isOverSpeedLimit: parseFloat(device?.latest_device_point?.params?.mph_over_posted) > 0,
    speedOverLimit: parseFloat(device?.latest_device_point?.params?.mph_over_posted) || 0,
    ignitionOn: device?.latest_device_point?.device_point_detail?.acc || false,
    batteryVoltage: parseFloat(device?.latest_device_point?.params?.obd_battery_voltage) || 0,
    engineRPM: parseInt(device?.latest_device_point?.params?.eng_rpm) || 0,
    tripDistance: device?.latest_device_point?.device_point_detail?.trip_distance?.value || 0,
    driveTime: device?.latest_device_point?.device_state?.drive_status_duration?.value || 0,
    signalStrength: parseInt(device?.latest_device_point?.device_point_detail?.num_satellites) || 0,
    gpsAccuracy: parseFloat(device?.latest_device_point?.device_point_detail?.hdop) || 0,
    driveStatus: device?.latest_device_point?.device_state?.drive_status || "unknown",
    isOnline: device?.online || false,
  };
};