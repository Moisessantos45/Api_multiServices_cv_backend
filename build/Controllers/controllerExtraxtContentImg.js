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
exports.sendImages = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const deleteFolderWidthFiles = (id, folder) => {
    const dir = path_1.default.join(folder, id);
    try {
        fs_1.default.readdir(dir, (err, files) => {
            if (err) {
                throw new Error("Error al leer la carpeta");
            }
            if (files.length === 0) {
                fs_1.default.rmSync(dir, { recursive: true, force: true });
            }
        });
    }
    catch (error) {
        throw new Error("Error al eliminar la carpeta");
    }
};
const deleteFiles = (id_1, ...args_1) => __awaiter(void 0, [id_1, ...args_1], void 0, function* (id, folder = "", nameFolder) {
    let folderPath = `./${nameFolder}/${id}`;
    if (folder !== "") {
        folderPath = `./${nameFolder}/${id}/${folder}`;
    }
    fs_1.default.readdir(folderPath, (err, files) => {
        if (err) {
            throw new Error("Error al leer la carpeta");
        }
        files.forEach((file) => {
            const rutaPath = path_1.default.join(folderPath, file);
            try {
                fs_1.default.unlinkSync(rutaPath);
            }
            catch (error) {
                throw new Error("Error al eliminar el archivo");
            }
        });
        try {
            fs_1.default.rmSync(folderPath, { recursive: true, force: true });
            deleteFolderWidthFiles(id, "./src/Images");
        }
        catch (error) {
            throw new Error("Error al eliminar la carpeta");
        }
    });
});
const sendImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, i } = req.params;
    const files = req.files;
    if (!files || files.length === 0) {
        res.status(400).json({ msg: "No se subió ningún archivo" });
        return;
    }
    const direcctorio = files[0].path;
    const outputDir = `./src/Images/${id}/${i}`;
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    const zip = new adm_zip_1.default(direcctorio);
    const zipEntries = zip.getEntries();
    try {
        // Extraer imágenes del archivo ZIP
        yield Promise.all(zipEntries.map((entry) => __awaiter(void 0, void 0, void 0, function* () {
            if (entry.entryName.includes("word/media/")) {
                const extension = path_1.default.extname(entry.entryName).toLowerCase();
                if ([".jpeg", ".jpg", ".png", ".avif", ".webp", ".gif"].includes(extension)) {
                    const imageData = entry.getData();
                    // const dimensions = sizeOf(imageData);
                    // const filename = path.basename(entry.entryName);
                    const outputPath = path_1.default.join(outputDir, entry.name);
                    fs_1.default.writeFileSync(outputPath, imageData);
                }
            }
        })));
        // Leer el directorio y enviar imágenes al frontend
        const images = yield fs_1.default.promises
            .readdir(outputDir)
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
        res.status(200).json(images);
        fs_1.default.unlinkSync(direcctorio);
        // Llamar a la función eliminarFiles
        deleteFolderWidthFiles(id, "./src/Uploads");
        deleteFiles(id, i, "src/Images");
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al procesar las imágenes" });
        // En caso de error, también llamar a la función eliminarFiles
        deleteFolderWidthFiles(id, "./src/Uploads");
        deleteFiles(id, i, "src/Images");
    }
});
exports.sendImages = sendImages;
