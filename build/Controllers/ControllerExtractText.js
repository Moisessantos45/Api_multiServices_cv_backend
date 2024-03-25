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
exports.extractContentText = exports.sendMessageText = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf2json_1 = __importDefault(require("pdf2json"));
const mammoth_1 = __importDefault(require("mammoth"));
const rotateImg_1 = require("../Helpers/rotateImg");
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
const sendMessageText = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({ msg: "Files save successfully" });
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
});
exports.sendMessageText = sendMessageText;
const extractContentText = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const rootDir = (0, rotateImg_1.getRootDir)();
    const dir = path_1.default.join(rootDir, "Uploads", id);
    try {
        const filesText = fs_1.default.readdirSync(dir);
        const content = [];
        const promises = filesText.map((file, _i) => __awaiter(void 0, void 0, void 0, function* () {
            const pathFile = path_1.default.join(dir, file);
            const fileExtension = path_1.default.extname(pathFile);
            let text = "";
            if (fileExtension === ".pdf" || fileExtension === ".docx") {
                try {
                    if (fileExtension === ".pdf") {
                        text = yield extractTextPdf(pathFile);
                    }
                    else {
                        text = yield extractTextDocx(pathFile);
                    }
                    content.push(text);
                }
                catch (_error) {
                    throw new Error("Error al extraer el texto del archivo");
                }
            }
        }));
        Promise.all(promises)
            .then(() => {
            res.status(200).json(content);
            (0, rotateImg_1.deleteFolder)("./src/Uploads", id);
        })
            .catch((err) => {
            throw new Error(err);
        });
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
});
exports.extractContentText = extractContentText;
