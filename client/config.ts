interface Config {
  baseUrl: string;
}

// Use the environment variable for production deployment
// Fall back to local development URL if not available
const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8002";

// Log the API URL for debugging
console.log("API URL configured as:", apiUrl);

// Create config object
export const config: Config = {
  baseUrl: apiUrl
};
