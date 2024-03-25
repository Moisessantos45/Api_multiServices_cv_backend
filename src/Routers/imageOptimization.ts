import { Router } from "express";
import fs from "fs";
import multer from "multer";
import { imageOptimization, sendMessageSaveImg } from "../Controllers/ControllerimageOptimization";

const storage = multer.diskStorage({
  destination: function (req, _file, cd) {
    const { id } = req.params;
    const dir = `./src/Uploads/${id}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cd(null, dir);
  },
  filename: function (_req, file, cb) {
    const newFileName = `${file.originalname}`;
    cb(null, newFileName);
  },
});

const upload = multer({ storage: storage });
const router = Router();

router.post("/uploadsImages/:id", upload.array("images"),sendMessageSaveImg);
router.get("/:id",imageOptimization);

export default router;
