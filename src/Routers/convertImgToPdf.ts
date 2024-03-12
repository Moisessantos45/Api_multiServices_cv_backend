import { Router } from "express";
import multer from "multer";
import fs from "fs";
import { getPdfById, sendMessage } from "../Controllers/ControllerPdfKit";

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

router.post("/postFile/:id", upload.array("images"), sendMessage);
router.get("/:id", getPdfById);

export default router;
