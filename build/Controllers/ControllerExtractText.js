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
exports.extractContentText = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf2json_1 = __importDefault(require("pdf2json"));
const mammoth_1 = __importDefault(require("mammoth"));
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
const extractTextPdf = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    let pdfParser = new pdf2json_1.default();
    let data = "";
    try {
        const pdfData = yield new Promise((resolve, reject) => {
            pdfParser.on("pdfParser_dataError", reject);
            pdfParser.on("pdfParser_dataReady", resolve);
            pdfParser.loadPDF(dir);
        });
        pdfData.Pages.forEach(function (page) {
            page.Texts.forEach(function (textElement) {
                let text = textElement.R.map(function (obj) {
                    return obj.T;
                }).join("");
                let decodedText = decodeURIComponent(text);
                data += decodedText;
            });
        });
    }
    catch (error) {
        console.log(error);
        throw new Error("Error al extraer el texto del pdf");
    }
    return data;
});
const extractTextDocx = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    let data = "";
    try {
        const result = yield mammoth_1.default.extractRawText({ path: dir });
        data = result.value;
    }
    catch (error) {
        console.error(error);
        throw new Error("Error al extraer el texto del docx");
    }
    return data;
});
const extractContentText = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    if (!files || files.length === 0) {
        res.status(400).json({ msg: "No se subió ningún archivo" });
        return;
    }
    let content = "";
    const fileExtension = path_1.default.extname(files[0].path);
    if (fileExtension !== ".pdf" && fileExtension !== ".docx") {
        res.status(400).json({ msg: "El archivo no es valido" });
        return;
    }
    try {
        if (fileExtension == ".pdf") {
            content = yield extractTextPdf(files[0].path);
        }
        else {
            content = yield extractTextDocx(files[0].path);
        }
        res.status(200).json(content);
        fs_1.default.unlinkSync(files[0].path);
        deleteFolderWidthFiles(req.params.id, "./src/Uploads");
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
});
exports.extractContentText = extractContentText;
