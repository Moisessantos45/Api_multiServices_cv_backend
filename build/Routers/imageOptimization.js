"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const ControllerimageOptimization_1 = require("../Controllers/ControllerimageOptimization");
const storage = multer_1.default.diskStorage({
    destination: function (req, _file, cd) {
        const { id } = req.params;
        const dir = `./src/Uploads/${id}`;
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir);
        }
        cd(null, dir);
    },
    filename: function (_req, file, cb) {
        const newFileName = `${file.originalname}`;
        cb(null, newFileName);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
const router = (0, express_1.Router)();
router.post("/uploadsImages/:id", upload.array("images"), ControllerimageOptimization_1.sendMessageSaveImg);
router.get("/:id", ControllerimageOptimization_1.imageOptimization);
exports.default = router;
