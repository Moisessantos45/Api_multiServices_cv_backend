import express from "express";
import router from "./Routers";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

const app = express();
app.use(express.json());
dotenv.config();

const allowedUrls = [process.env.FRONTEND_URL_HOST];

const opcionsCors = {
  origin: function (url: any, cb: Function) {
    if (allowedUrls.indexOf(url) !== -1) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
};

app.use(cors(opcionsCors));

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  handler: function (_req, res) {
    res.status(429).json({ msg: "Too many requests, please try again later" });
  },
});

app.use(limiter);

app.use("/api/2.0", router);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
