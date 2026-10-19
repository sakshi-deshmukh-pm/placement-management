import express from "express";
import cors from "cors";

import studentRoutes from "./routes/student.routes.js";
import middleware from "./middleware/logger.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";
import companyRoutes from "./routes/company.routes.js"
import PlacementDriveRoutes  from "./routes/placementDrive.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import authRoutes from "./routes/auth.routes.js";
import loggerMiddleware from "./middleware/logger.middleware.js";


const app = express();

app.use(cors({
    origin:"http://localhost:5173",
}));
app.use(express.json());

app.use(loggerMiddleware);

app.use(studentRoutes);

app.use(companyRoutes);

app.use(applicationRoutes)

app.use(PlacementDriveRoutes);

app.use(authRoutes);

app.use(errorMiddleware);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});