"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageOptimization = exports.sendMessageSaveImg = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const jimp_1 = __importDefault(require("jimp"));
const rotateImg_1 = require("../Helpers/rotateImg");
const sendMessageSaveImg = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({ msg: "Image save successfully" });
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
});
exports.sendMessageSaveImg = sendMessageSaveImg;
const imageOptimization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    let quality = 60; // valor por defecto
    if (!isNaN(Number(req.query.quality))) {
        quality = Number(req.query.quality);
    }
    try {
        const rootDir = (0, rotateImg_1.getRootDir)();
        const dir = path_1.default.join(rootDir, "Uploads", id);
        const saveDir = path_1.default.join(rootDir, "Images", id);
        const files = fs_1.default.readdirSync(dir);
        yield Promise.all(files.map((file, _i) => __awaiter(void 0, void 0, void 0, function* () {
            const imgPath = path_1.default.join(dir, file);
            const img = yield jimp_1.default.read(imgPath);
            yield img.quality(quality).writeAsync(`${saveDir}/${file}`);
        }))).catch((error) => {
            console.error(`Error reading directory: ${error}`);
            throw new Error("Error al leer el directorio");
        });
        const images = yield fs_1.default.promises
            .readdir(saveDir)
            .then((files) => __awaiter(void 0, void 0, void 0, function* () {
            return yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield fs_1.default.promises.readFile(path_1.default.join(saveDir, file));
                const base64Image = data.toString("base64");
                return {
                    filename: file,
                    data: base64Image,
                    contentType: `image/${file.split(".")[1]}`,
                };
            })));
        }))
            .catch((error) => {
            console.error(`Error reading directory: ${error}`);
            throw new Error("Error al leer el directorio");
        });
        res.status(200).json(images);
        setTimeout(() => {
            (0, rotateImg_1.deleteFolder)("src/Uploads", id);
            (0, rotateImg_1.deleteFolder)("src/Images", id);
        }, 3000);
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
});
exports.imageOptimization = imageOptimization;
