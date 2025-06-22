const express = require("express");
const path = require("path");
const cors = require("cors");
const router = require("./routes/routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/sawgeer");
const dotenv = require("dotenv");
require("./database");

dotenv.config();

const port = process.env.PORT || 3300;
const host = process.env.HOST || "localhost";
const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://drip-stores-wheat.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));
app.use(express.json());
app.use("/v1", router);
app.use("/swageer-apidripstore", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.listen(port, () => {
  console.log(`Server running on port http://${host}:${port}`);
});
