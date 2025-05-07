interface Config {
  baseUrl: string;
}

// Get API URL from environment variable or use the admin URL
const apiUrl = import.meta.env.VITE_API_URL || "https://admin-lf80b9klm-iamcring3s-projects.vercel.app";

// Create config object
export const config: Config = {
  baseUrl: apiUrl
};
