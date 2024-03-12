import express from "express";
import router from "./Routers";
import cors from "cors";

const app = express();
app.use(express.json());

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

app.use("/api/2.0", router);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
