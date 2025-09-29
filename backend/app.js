import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";

import { validateEnv } from "./src/lib/utils.js";
import dbConfig from "./src/config/dbConfig.js";

// Set MongoDB Atlas connection with new password
process.env.MONGO_URI = "mongodb+srv://ajv1520:ajmark321@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard?retryWrites=true&w=majority&appName=SchoolCluster";
import userRoute from "./src/routes/userRoute.js";
import authRoute from "./src/routes/authRoute.js";
import schoolRoute from "./src/routes/schoolRoute.js";
import errorHandler from "./src/middleware/errorHandler.js";

config();
validateEnv();
dbConfig();

const app = express();

// Trust proxy to ensure "secure" cookies work behind proxies (Render/NGINX)
app.set('trust proxy', 1);

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
    // Normalize origins by removing trailing slashes for comparison
    const normalizedOrigin = origin?.replace(/\/$/, '');
    const normalizedAllowed = allowedOrigin.replace(/\/$/, '');
    
    if (!origin || normalizedOrigin === normalizedAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// Handle preflight requests explicitly
app.options('*', cors(corsOptions));
// Additional preflight handling for specific routes
app.options('/api/v1/auth/*', cors(corsOptions));
app.options('/api/v1/user/*', cors(corsOptions));
app.options('/api/v1/schools/*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/schools", schoolRoute);

// Error handler middleware (should be last)
app.use(errorHandler);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server🏃on [${process.env.PORT || 5000}]`);
});
