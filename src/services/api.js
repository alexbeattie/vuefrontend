// src/services/api.js

class ApiService {
  constructor() {
    this.baseUrl = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080/api/v1';
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Get all devices
  async getDevices() {
    try {
      const response = await fetch(`${this.baseUrl}/devices`, {
        method: 'GET',
        headers: this.headers
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
  }

  // Get single device
  async getDevice(deviceId) {
    try {
      const response = await fetch(`${this.baseUrl}/devices/${deviceId}`, {
        method: 'GET',
        headers: this.headers
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error(`Error fetching device ${deviceId}:`, error);
      throw error;
    }
  }

  // Update device settings
  async updateDeviceSettings(deviceId, settings) {
    try {
      const response = await fetch(`${this.baseUrl}/devices/${deviceId}/settings`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(settings)
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error(`Error updating device ${deviceId} settings:`, error);
      throw error;
    }
  }

  // Get device history
  async getDeviceHistory(deviceId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    try {
      const response = await fetch(
        `${this.baseUrl}/devices/${deviceId}/history?${queryParams}`,
        {
          method: 'GET',
          headers: this.headers
        }
      );
      return this.handleResponse(response);
    } catch (error) {
      console.error(`Error fetching device ${deviceId} history:`, error);
      throw error;
    }
  }

  // Get device alerts
  async getDeviceAlerts(deviceId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    try {
      const response = await fetch(
        `${this.baseUrl}/devices/${deviceId}/alerts?${queryParams}`,
        {
          method: 'GET',
          headers: this.headers
        }
      );
      return this.handleResponse(response);
    } catch (error) {
      console.error(`Error fetching device ${deviceId} alerts:`, error);
      throw error;
    }
  }

  // Update device location
  async updateDeviceLocation(deviceId, location) {
    try {
      const response = await fetch(`${this.baseUrl}/devices/${deviceId}/location`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(location)
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error(`Error updating device ${deviceId} location:`, error);
      throw error;
    }
  }
}

export const apiService = new ApiService();