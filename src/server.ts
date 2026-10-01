import express from "express";

import studentRoutes from "./routes/student.routes.js";
import middleware from "./middleware/logger.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());

app.use(middleware);

app.use(studentRoutes);

app.use(errorHandler);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});