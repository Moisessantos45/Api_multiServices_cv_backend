import { Router } from "express";
import fs from "fs";
import multer from "multer";
import { getDocxById, sendMessage } from "../Controllers/ControllerDocx";

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
router.post("/uploadImg/:id", upload.array("images"), sendMessage);
router.get("/:id", getDocxById);
export default router;
