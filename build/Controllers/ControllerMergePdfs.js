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
exports.mergePdfs = exports.sendMessageMergePdfs = void 0;
const fs_1 = __importDefault(require("fs"));
const pdf_lib_1 = require("pdf-lib");
const rotateImg_1 = require("../Helpers/rotateImg");
const path_1 = __importDefault(require("path"));
const sendMessageMergePdfs = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({ msg: "Merge PDFs" });
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
});
exports.sendMessageMergePdfs = sendMessageMergePdfs;
const mergePdfs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const rootDir = (0, rotateImg_1.getRootDir)();
        const dir = path_1.default.join(rootDir, "Uploads", id);
        const dirPdf = path_1.default.join(rootDir, "Processed_uploads", id);
        if (!fs_1.default.existsSync(dirPdf)) {
            fs_1.default.mkdirSync(dirPdf);
        }
        const files = fs_1.default.readdirSync(dir);
        const pdfDoc = yield pdf_lib_1.PDFDocument.create();
        for (const file of files) {
            const filePath = path_1.default.join(dir, file);
            const fileData = fs_1.default.readFileSync(filePath);
            const pdf = yield pdf_lib_1.PDFDocument.load(fileData);
            const copiedPages = yield pdfDoc.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => pdfDoc.addPage(page));
        }
        const pdfBytes = yield pdfDoc.save();
        const fileNamePdf = `merge-${id}.pdf`;
        const pdfPath = path_1.default.join(dirPdf, fileNamePdf);
        fs_1.default.writeFileSync(pdfPath, pdfBytes);
        res.status(200).sendFile(pdfPath);
        setTimeout(() => {
            (0, rotateImg_1.deleteFolder)("src/Uploads", id);
            (0, rotateImg_1.deleteFolder)("src/Processed_uploads", id);
        }, 5000);
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
});
exports.mergePdfs = mergePdfs;
