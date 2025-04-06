import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response data:', error.response.data);
    console.error('Status code:', error.response.status);
    throw new Error(error.response.data.message || 'An error occurred');
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    throw new Error('No response from server. Please try again later.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request error:', error.message);
    throw new Error('Error setting up request. Please try again.');
  }
};

// Get current date from the server
export const getCurrentDate = async () => {
  try {
    const response = await axios.get(`${API_URL}/current-date`);
    return response.data.currentDate;
  } catch (error) {
    // If the endpoint doesn't exist, return the current date from the client
    return new Date().toISOString();
  }
};

// Placement API
export const getPlacementRecommendations = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/placement`, data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Search and Retrieval API
export const searchItem = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/search`, { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const retrieveItem = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/retrieve`, data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const placeItem = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/place`, data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Waste Management API
export const identifyWaste = async () => {
  try {
    const response = await axios.get(`${API_URL}/waste/identify`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getWasteReturnPlan = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/waste/return-plan`, data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const completeUndocking = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/waste/complete-undocking`, data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Simulation API
export const simulateDay = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/simulate/day`, data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Import/Export API
export const importItems = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/import/items`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const importContainers = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/import/containers`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const exportArrangement = async () => {
  try {
    const response = await axios.get(`${API_URL}/export/arrangement`, {
      responseType: 'blob'
    });
    
    // Create a download link and trigger it
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'arrangement.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
};

// Logs API
export const getLogs = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/logs`, { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get all containers
export const getContainers = async () => {
  try {
    const response = await axios.get(`${API_URL}/containers`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get all items
export const getItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/items`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get dashboard data
export const getDashboardData = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

