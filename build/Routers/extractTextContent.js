"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const ControllerExtractText_1 = require("../Controllers/ControllerExtractText");
const storage = multer_1.default.diskStorage({
    destination: function (req, _file, cb) {
        const { id } = req.params;
        const dir = `./src/Uploads/${id}`;
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (_req, file, cb) {
        const newFileName = `${file.originalname}`;
        cb(null, newFileName);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
const router = (0, express_1.Router)();
router.post("/post_doc/:id", upload.array("docs"), ControllerExtractText_1.extractContentText);
exports.default = router;
