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
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Frontend build ka path — backend/public_html folder
const FRONTEND_BUILD_PATH = path.join(__dirname, "..", "public_html");

const app = express();

// 1. Security Headers (Helmet)
app.use(
  helmet({
    // Cross-origin images allow karo (Cloudinary, Unsplash etc.)
    crossOriginResourcePolicy: { policy: "cross-origin" },

    // Content Security Policy — external image sources allow karo
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com"],
        styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc:     ["'self'", "https://fonts.gstatic.com"],
        // ✅ Cloudinary (product images) + Unsplash (hero images) + data URIs
        imgSrc:      ["'self'", "data:", "blob:",
                      "https://res.cloudinary.com",
                      "https://images.unsplash.com",
                      "https://images.pexels.com"],
        connectSrc:  ["'self'",
                      "https://res.cloudinary.com",
                      "https://api.razorpay.com",
                      "https://lumberjack.razorpay.com"],
        frameSrc:    ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
        objectSrc:   ["'none'"],
        mediaSrc:    ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);


// 2. Response Compression
app.use(compression());

app.use(morgan("dev"));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());


app.use(express.static(FRONTEND_BUILD_PATH));

const allowedOrigins = [
  "https://shouryaevtech.com",
  "https://www.shouryaevtech.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // 1. No origin = same-server request, curl, server-to-server → Allow
      if (!origin) return callback(null, true);

      // 2. Localhost (any port) 
      //    localhost:3000, localhost:5173, localhost:8080 
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // 3. Production allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // 4. Block karo — Express v5 mein Error throw mat karo, null, false use karo
      //    (Error throw karne se 500 aata tha)
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200, // Some browsers (IE11) choke on 204
  })
);


//  API Routes
app.use("/api/auth", authRouter);
app.use("/api/agent", agentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/home", productRouter);
app.use("/api/payment", payMentRouter);
app.use("/api/franchise", franchiseRouter);


app.use((req, res) => {
  const indexPath = path.join(FRONTEND_BUILD_PATH, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      // Agar public_html/index.html nahi mila (dev mode) to API info return karo
      res.status(200).json({
        success: true,
        message: "Shourya Enterprise API Server is running!",
        note: "Frontend build public_html folder mein nahi hai. Production deploy ke liye npm run build karo."
      });
    }
  });
});

export default app;