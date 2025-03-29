const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Viva Vista API",
            version: "1.0.0",
            description: "API documentation for the Viva Vista Travel Platform"
        },
        servers: [{ url: "http://localhost:5001" }]
    },
    apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("📄 Swagger Docs available at: http://localhost:5001/api-docs");
};

module.exports = swaggerDocs;
