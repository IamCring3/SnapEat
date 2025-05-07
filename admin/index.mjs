import express from "express";
const app = express();
import "dotenv/config";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import { readdirSync } from "fs";

const port = process.env.PORT || 8000;
// Configure CORS for Vercel deployment
const allowedOrigins = [
  'https://snapeat.vercel.app',
  'https://snapeat-admin.vercel.app',
  process.env.FRONTEND_URL || 'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

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
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SnapEat API Server</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #DC2626;
          border-bottom: 2px solid #DC2626;
          padding-bottom: 10px;
        }
        .card {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        code {
          background-color: #f1f1f1;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
        }
        .endpoint {
          margin-bottom: 10px;
        }
        .status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          background-color: #4CAF50;
          color: white;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <h1>SnapEat API Server</h1>

      <div class="card">
        <h2>Server Status</h2>
        <p><span class="status">ONLINE</span> The API server is running correctly.</p>
        <p>Server time: ${new Date().toLocaleString()}</p>
      </div>

      <div class="card">
        <h2>About This Server</h2>
        <p>This is the backend API server for the SnapEat application. It handles data operations, authentication, and other server-side functionality.</p>
        <p>The frontend application communicates with this server through API endpoints.</p>
      </div>

      <div class="card">
        <h2>Frontend Application</h2>
        <p>To access the SnapEat user interface, please visit: <a href="${process.env.FRONTEND_URL || 'https://snapeat.vercel.app'}">${process.env.FRONTEND_URL || 'https://snapeat.vercel.app'}</a></p>
        <p>For the admin dashboard, go to: <a href="${process.env.FRONTEND_URL || 'https://snapeat.vercel.app'}/admin/dashboard">${process.env.FRONTEND_URL || 'https://snapeat.vercel.app'}/admin/dashboard</a></p>
      </div>

      <div class="card">
        <h2>API Documentation</h2>
        <p>Available API endpoints:</p>
        <div class="endpoint"><code>GET /api/products</code> - Get all products</div>
        <div class="endpoint"><code>GET /api/categories</code> - Get all categories</div>
        <div class="endpoint"><code>GET /api/orders</code> - Get all orders</div>
        <div class="endpoint"><code>GET /api/users</code> - Get all users</div>
        <!-- Add more endpoints as needed -->
      </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
