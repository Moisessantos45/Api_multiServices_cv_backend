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
exports.deleteFiles = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const rotateImg_1 = require("../Helpers/rotateImg");
const dirs = [
    "Docxs_generados",
    "Pdfs_generados",
    "Processed_uploads",
    "Uploads",
    "Images",
];
const deleteFilesDir = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield promises_1.default.stat(dir);
        if (!stats.isDirectory()) {
            yield promises_1.default.unlink(dir);
            return;
        }
        const files = yield promises_1.default.readdir(dir);
        for (const file of files) {
            const currentPath = path_1.default.join(dir, file);
            const stats = yield promises_1.default.stat(currentPath);
            if (stats.isDirectory()) {
                yield deleteFilesDir(currentPath);
            }
            else {
                const extensionOmit = [".gitkeep", ""].includes(path_1.default.extname(currentPath));
                if (extensionOmit)
                    return; // Omitir archivos con extensión .gitkeep
                yield promises_1.default.unlink(currentPath);
            }
        }
        const omitDir = dirs.includes(path_1.default.basename(dir));
        if (omitDir)
            return; // Omitir directorios de la lista dirs
        const remainingFiles = yield promises_1.default.readdir(dir);
        if (remainingFiles.length === 0) {
            yield promises_1.default.rmdir(dir);
        }
    }
    catch (error) {
        console.error(`Error deleting directory ${dir}:`, error);
        throw new Error(`Error deleting directory ${dir}`);
    }
});
const deleteFiles = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rootDir = (0, rotateImg_1.getRootDir)();
        for (const dir of dirs) {
            const currentDir = path_1.default.join(rootDir, dir);
            yield deleteFilesDir(currentDir);
        }
        res.status(200).json({ msg: "Archivos eliminados correctamente" });
    }
    catch (error) {
        res.status(500).json({ msg: "Error al eliminar los archivos" });
    }
});
exports.deleteFiles = deleteFiles;
