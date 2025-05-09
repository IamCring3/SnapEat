import express from "express";
const app = express();
import "dotenv/config";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import { readdirSync } from "fs";

const port = process.env.PORT || 8000;
// Configure CORS for Vercel deployment and local development
const allowedOrigins = [
  'https://www.snapeat247.com',
  'https://snapeat247.com',
  'https://admin-lf80b9klm-iamcring3s-projects.vercel.app',
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000', // Add all possible local development ports
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003'
];

console.log("Allowed origins for CORS:", allowedOrigins);

// For development, use a more permissive CORS policy
if (process.env.NODE_ENV === 'development') {
  console.log("Using development CORS policy - allowing all origins");
  app.use(cors());
} else {
  // For production, use a more restrictive CORS policy
  app.use(cors({
    origin: function(origin, callback) {
      console.log("Request origin:", origin);

      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) {
        console.log("Allowing request with no origin");
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        console.log("CORS error:", msg, "Origin:", origin);
        return callback(new Error(msg), false);
      }
      console.log("Origin allowed:", origin);
      return callback(null, true);
    },
    credentials: true
  }));
}

app.use(express.json({ limit: '10mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesPath = path.resolve(__dirname, "./routes");
const routeFiles = readdirSync(routesPath);
routeFiles.map(async (file) => {
  const routeModule = await import(`./routes/${file}`);
  app.use("/", routeModule.default);
});

app.get("/", (req, res) => {
  console.log("Root endpoint accessed");
  console.log("Request headers:", req.headers);

  // Send a simple JSON response for testing
  res.json({
    status: "success",
    message: "SnapEat API Server is running",
    serverTime: new Date().toISOString(),
    cors: "enabled",
    endpoints: {
      checkout: "/checkout",
      verify: "/razorpay/verify"
    }
  });
});

// Add a test endpoint for CORS testing
app.get("/test-cors", (req, res) => {
  console.log("Test CORS endpoint accessed");
  console.log("Request headers:", req.headers);

  res.json({
    status: "success",
    message: "CORS is working correctly",
    origin: req.headers.origin || "No origin header"
  });
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
