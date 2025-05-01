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
        baseUrl: "https://YOUR_CLOUD_RUN_URL", // Replace with your Cloud Run URL
      };
      break;
    case "local":
      config = {
        baseUrl: "http://localhost:8000",
      };
      break;
    default:
      break;
  }
  return config;
};

export const selectServer = "gcp"; // Change to "production", "gcp", or "local" as needed
export const config = checkConfig(selectServer) as Config;
