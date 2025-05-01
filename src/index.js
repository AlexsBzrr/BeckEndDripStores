const express = require("express");
const cors = require("cors");
const router = require("./routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/sawgeer");
const dotenv = require("dotenv");
require("./database");

dotenv.config();

const port = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());
app.use(router);
app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
