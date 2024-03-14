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
exports.getImageDimensions = exports.deleteFolder = exports.getRootDir = exports.rotateImg = void 0;
const jimp_1 = __importDefault(require("jimp"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const image_size_1 = __importDefault(require("image-size"));
const rotateImg = (imgPath, outputPath, orientation) => __awaiter(void 0, void 0, void 0, function* () {
    yield jimp_1.default.read(imgPath)
        .then((img) => {
        const { width, height } = img.bitmap;
        if (orientation !== "automatico" && width > height) {
            return img.rotate(90).writeAsync(outputPath);
        }
        return img.writeAsync(outputPath);
    })
        .catch((e) => {
        throw new Error(e.message);
    });
});
exports.rotateImg = rotateImg;
const getRootDir = () => {
    const rootDirDev = path_1.default.resolve(__dirname, "..", ".."); // Directorio raíz en desarrollo
    const rootDirProd = path_1.default.resolve(__dirname, "..", "..", "src"); // Directorio raíz en producción
    return fs_1.default.existsSync(path_1.default.join(__dirname, "..", "..", "build"))
        ? rootDirProd
        : rootDirDev;
};
exports.getRootDir = getRootDir;
const deleteFolder = (folder, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dir = `./${folder}/${id}`;
        if (!fs_1.default.existsSync(dir)) {
            return;
        }
        let files = fs_1.default.readdirSync(dir);
        if (files.length === 0) {
            fs_1.default.rmSync(dir, { recursive: true, force: true });
            return;
        }
        files.forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
            const directory = path_1.default.join(dir, file);
            fs_1.default.unlinkSync(directory);
        }));
        files = fs_1.default.readdirSync(dir);
        if (files.length === 0) {
            fs_1.default.rmSync(dir, { recursive: true, force: true });
        }
    }
    catch (error) {
        throw new Error("Error al eliminar la carpeta");
    }
});
exports.deleteFolder = deleteFolder;
const getImageDimensions = (imgPath) => {
    const dimensions = (0, image_size_1.default)(imgPath);
    return dimensions;
};
exports.getImageDimensions = getImageDimensions;
