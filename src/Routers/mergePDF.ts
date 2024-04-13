import { Router } from "express";
import fs from "fs";
import multer from "multer";
import {
  mergePdfs,
  sendMessageMergePdfs,
} from "../Controllers/ControllerMergePdfs";

const storage = multer.diskStorage({
  destination: function (req, _file, cb) {
    const { id } = req.params;
    const dir = `./src/Uploads/${id}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (_req, file, cb) {
    const newFileName = `${file.originalname}`;
    cb(null, newFileName);
  },
});

const upload = multer({ storage: storage });
const router = Router();

router.post("/uploadsPdfs/:id", upload.array("pdfs"), sendMessageMergePdfs);
router.get("/:id", mergePdfs);
 
export default router;