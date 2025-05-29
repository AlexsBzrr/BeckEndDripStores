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

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));
app.use(express.json());
app.use("/v1", router);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.listen(port, () => {
  console.log(`Server running on port http://${host}:${port}`);
});
