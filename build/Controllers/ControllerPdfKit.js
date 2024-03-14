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
exports.getPdfById = exports.sendMessage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const rotateImg_1 = require("../Helpers/rotateImg");
const sendMessage = (_req, res) => {
    try {
        res.status(200).json({ msg: "Image save successfully" });
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
};
exports.sendMessage = sendMessage;
const getPdfById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const nameFolder = req.query.nameFolder;
    const orientacion = req.query.orientacion;
    try {
        // Para obtener el directorio raíz
        const rootDir = (0, rotateImg_1.getRootDir)();
        const dir = path_1.default.join(rootDir, "Uploads", id);
        const processedDir = path_1.default.join(rootDir, "Processed_uploads", id);
        const pdfDir = path_1.default.join(rootDir, "Pdfs_generados", `${nameFolder}.pdf`);
        const pdfPath = path_1.default.join(rootDir, "Pdfs_generados", `${nameFolder}.pdf`);
        if (!fs_1.default.existsSync(processedDir)) {
            fs_1.default.mkdirSync(processedDir);
        }
        const files = fs_1.default.readdirSync(dir);
        const firstImagePath = `${processedDir}/processed_${files[0]}`;
        const outputPathOne = `${dir}/${files[0]}`;
        yield (0, rotateImg_1.rotateImg)(outputPathOne, firstImagePath, orientacion);
        const { width: firstImageWidth, height: firstImageHeight } = (0, rotateImg_1.getImageDimensions)(firstImagePath);
        if (firstImageWidth === undefined)
            return;
        if (firstImageHeight === undefined)
            return;
        let firstLayout = "portrait";
        if (orientacion === "automatico") {
            if (firstImageWidth > firstImageHeight) {
                firstLayout = "landscape";
            }
        }
        else {
            firstLayout = orientacion;
        }
        const newPdf = new pdfkit_1.default({
            size: "letter",
            layout: firstLayout,
        });
        const writeStream = fs_1.default.createWriteStream(pdfDir);
        newPdf.pipe(writeStream);
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            const imgPath = `${dir}/${file}`;
            const outputPath = `${processedDir}/processed_${file}`;
            yield (0, rotateImg_1.rotateImg)(imgPath, outputPath, orientacion);
            const { width, height } = (0, rotateImg_1.getImageDimensions)(outputPath);
            if (width === undefined)
                return;
            if (height === undefined)
                return;
            let layout = "portrait";
            if (orientacion === "automatico") {
                if (width > height) {
                    layout = "landscape";
                }
            }
            else {
                layout = orientacion;
            }
            if (index !== 0) {
                newPdf.addPage({ size: "letter", layout: layout });
            }
            const pdfWidth = newPdf.page.width;
            const pdfHeight = newPdf.page.height;
            let imgWidth, imgHeight;
            if (width > height) {
                imgWidth = pdfWidth;
                imgHeight = (pdfWidth / width) * height;
            }
            else {
                imgHeight = pdfHeight;
                imgWidth = (pdfHeight / height) * width;
            }
            const x = (pdfWidth - imgWidth) / 2;
            const y = (pdfHeight - imgHeight) / 2;
            newPdf.image(outputPath, x, y, {
                width: imgWidth,
                height: imgHeight,
            });
        }
        newPdf.end();
        writeStream.on("finish", () => {
            res.sendFile(pdfPath);
            setTimeout(() => {
                (0, rotateImg_1.deleteFolder)("src/Uploads", id);
                (0, rotateImg_1.deleteFolder)("src/Processed_uploads", id);
                fs_1.default.unlinkSync(pdfDir);
            }, 5000);
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
});
exports.getPdfById = getPdfById;
