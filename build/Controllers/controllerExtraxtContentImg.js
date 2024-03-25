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
exports.sendImages = exports.sendMessageImages = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const rotateImg_1 = require("../Helpers/rotateImg");
const sendMessageImages = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({ msg: "Files save successfully" });
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
});
exports.sendMessageImages = sendMessageImages;
const sendImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const rootDir = (0, rotateImg_1.getRootDir)();
    const direcctorio = path_1.default.join(rootDir, "Uploads", id);
    const outputDir = path_1.default.join(rootDir, "Images", id);
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir);
    }
    try {
        // Extraer imágenes del archivo ZIP
        const extractImagesFile = (dir) => __awaiter(void 0, void 0, void 0, function* () {
            const dirPath = fs_1.default.readdirSync(dir);
            for (const file of dirPath) {
                const filePath = path_1.default.join(direcctorio, file);
                const zip = new adm_zip_1.default(filePath);
                const zipEntries = zip.getEntries();
                zipEntries.map((entry) => __awaiter(void 0, void 0, void 0, function* () {
                    if (entry.entryName.includes("word/media/")) {
                        const extension = path_1.default.extname(entry.entryName).toLowerCase();
                        if ([".jpeg", ".jpg", ".png", ".avif", ".webp", ".gif"].includes(extension)) {
                            const imageData = entry.getData();
                            const outputPath = path_1.default.join(outputDir, entry.name);
                            fs_1.default.writeFileSync(outputPath, imageData);
                        }
                    }
                }));
            }
        });
        const convertedImages = (dir) => __awaiter(void 0, void 0, void 0, function* () {
            return yield fs_1.default.promises
                .readdir(dir)
                .then((files) => __awaiter(void 0, void 0, void 0, function* () {
                return yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                    const data = yield fs_1.default.promises.readFile(path_1.default.join(outputDir, file));
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
        });
        extractImagesFile(direcctorio)
            .then(() => convertedImages(outputDir))
            .then((images) => {
            res.status(200).json(images);
            // Llamar a la función eliminarFiles
            (0, rotateImg_1.deleteFolder)("./src/Uploads", id);
            (0, rotateImg_1.deleteFolder)("./src/Images", id);
        })
            .catch((_e) => {
            throw new Error("Error al procesar las imágenes");
        });
    }
    catch (error) {
        res.status(500).json({ msg: "Error al procesar las imágenes" });
        // En caso de error, también llamar a la función eliminarFiles
        (0, rotateImg_1.deleteFolder)("./src/Uploads", id);
        (0, rotateImg_1.deleteFolder)("./src/Images", id);
    }
});
exports.sendImages = sendImages;
