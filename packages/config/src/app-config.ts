// Shared application configuration
export const appConfig = {
  name: "IQ24",
  version: "1.0.0",
  api: {
    baseUrl: process.env.API_BASE_URL || "http://localhost:3002",
  },
  features: {
    aiAgents: true,
    mseo: true,
    compliance: true,
  },
};
