import express from "express";
import rateLimit from "express-rate-limit";
import router from "./routes";
import cors from "cors";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  handler: (req, res) => res.status(429).json({ error: "Too many requests" }),
});

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.CLIENT_URL ?? ""]
    : ["http://localhost:5173", "http://localhost:4173"];

const app = express();
const port = process.env.PORT || 3000;

app.use(limiter);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: origin ${origin} not allowed`));
      }
    },
    methods: ["POST", "GET"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
