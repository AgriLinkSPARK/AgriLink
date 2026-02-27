import swaggerJsdoc from "swagger-jsdoc";

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
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Development Server",
      },
    ],
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