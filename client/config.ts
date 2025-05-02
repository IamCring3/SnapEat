interface Config {
  baseUrl: string;
}
const checkConfig = (server: string): Config | {} => {
  let config: Config | {} = {};
  switch (server) {
    case "production":
      config = {
        baseUrl: "https://YOUR_CLOUD_RUN_URL", // Replace with your Cloud Run URL
      };
      break;
    case "gcp":
      config = {
        baseUrl: "http://localhost:8000", // Using local server for now
      };
      break;
    case "local":
      config = {
        baseUrl: "http://localhost:8000",
      };
      break;
    default:
      // Default to local if no valid server is specified
      config = {
        baseUrl: "http://localhost:8000",
      };
      break;
  }
  return config;
};

// Set to "local" to ensure we're using the local server
export const selectServer = "local";
export const config = checkConfig(selectServer) as Config;
