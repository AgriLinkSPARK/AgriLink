import swaggerJsdoc from "swagger-jsdoc";

// Generate server URLs based on environment
const getServers = () => {
  const servers = [];
  
  // Production: use environment variable or relative path
  if (process.env.NODE_ENV === "production") {
    servers.push({
      url: "/api",
      description: "Production Server (relative path)",
    });
    if (process.env.BACKEND_URL) {
      servers.push({
        url: process.env.BACKEND_URL,
        description: "Production Server (explicit)",
      });
    }
  }
  
  // Development: always include localhost
  if (process.env.NODE_ENV !== "production") {
    servers.push({
      url: `http://localhost:${process.env.PORT || 5000}`,
      description: "Development Server",
    });
  }
  
  return servers.length > 0 ? servers : [{ url: "/api", description: "Default" }];
};

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AgriLink API",
      version: "1.0.0",
      description: "AgriLink MERN Backend Documentation",
      contact: {
        name: "AgriLink Support",
        url: "https://agrilink.com",
      },
    },
    servers: getServers(),
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./docs/*.yml", "./docs/*.yaml"], // 👈 Reading both .yml and .yaml files
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;