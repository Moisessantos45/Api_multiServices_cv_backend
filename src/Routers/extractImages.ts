import { Router } from "express";
import multer from "multer";
import fs from "fs";
import { sendImages } from "../Controllers/controllerExtraxtContentImg";

const storage = multer.diskStorage({
  destination: function (req, _file, cb) {
    const { id } = req.params;

    const dir: string = `./src/Uploads/${id}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (_req, file, cb) {
    const newFileName: string = `${file.originalname}`;
    cb(null, newFileName);
  },
});

const upload = multer({ storage: storage });

const router = Router();

router.post("/post_file/:id/:i", upload.array("files"), sendImages);

export default router;
