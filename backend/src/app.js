import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import authRouter from "../routes/auth.routes.js";
import agentRouter from "../routes/agentDashboard.routes.js";
import adminRouter from "../routes/admin.Routes.js";
import productRouter from "../routes/product.routes.js";
import payMentRouter from "../routes/payment.routes.js";
import franchiseRouter from "../routes/franchise.Routes.js";
import cors from "cors";

const app = express();

// 1. Security Headers (Helmet)
// Configured to allow cross-origin resource sharing for external media (e.g., Cloudinary, S3)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 2. Response Compression
app.use(compression());

app.use(morgan("dev"));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://shouryaevtech.com",
  "https://www.shouryaevtech.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRouter);
app.use("/api/agent", agentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/home", productRouter);
app.use("/api/payment", payMentRouter);
app.use("/api/franchise", franchiseRouter);

export default app;