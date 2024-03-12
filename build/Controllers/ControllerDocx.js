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
exports.getDocxById = exports.sendMessage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const image_size_1 = __importDefault(require("image-size"));
const docx_1 = require("docx");
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
const getDocxById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const nameFolder = req.query.nameFolder;
    try {
        const dir = `./src/Uploads/${id}`;
        const processedDir = `./src/Processed_uploads/${id}`;
        if (!fs_1.default.existsSync(processedDir)) {
            fs_1.default.mkdirSync(processedDir);
        }
        const docxDir = `./src/Docxs_generados/${nameFolder}.docx`;
        const docxDirRuta = `../Docxs_generados/${nameFolder}.docx`;
        const docxPath = path_1.default.resolve(__dirname, docxDirRuta);
        const files = fs_1.default.readdirSync(dir);
        const sections = files.map((file, i) => __awaiter(void 0, void 0, void 0, function* () {
            const imgPath = `${dir}/${file}`;
            const processedImgPath = `${processedDir}/processed_${file}`;
            yield (0, rotateImg_1.rotateImg)(imgPath, processedImgPath, "portrait");
            const img = fs_1.default.readFileSync(processedImgPath);
            const { width, height } = (0, image_size_1.default)(processedImgPath);
            if (width === undefined)
                return;
            if (height === undefined)
                return;
            const pageWidth = (8.5 * 1440) / 16; // Ancho de la página (en twips)
            const pageHeight = (11 * 1440) / 16; // Altura de la página (en twips)
            // Calcular las dimensiones de la imagen para que se ajusten a la página
            let imageWidth, imageHeight;
            if (width > height) {
                imageWidth = pageWidth;
                imageHeight = (pageWidth / width) * height;
            }
            else {
                imageHeight = pageHeight;
                imageWidth = (pageHeight / height) * width;
            }
            const image = new docx_1.ImageRun({
                data: img,
                transformation: {
                    width: imageWidth,
                    height: imageHeight,
                },
                floating: {
                    zIndex: 1,
                    horizontalPosition: {
                        relative: docx_1.VerticalPositionRelativeFrom.PAGE,
                        align: docx_1.VerticalPositionAlign.CENTER,
                    },
                    verticalPosition: {
                        relative: docx_1.VerticalPositionRelativeFrom.PAGE,
                        align: docx_1.VerticalPositionAlign.CENTER,
                    },
                    wrap: {
                        type: 3,
                        side: "bothSides",
                    },
                },
            });
            const children = [image];
            const pageBreaks = [];
            if (i < files.length - 1) {
                pageBreaks.push(new docx_1.PageBreak());
                // new PageBreak();
                // children.push(new PageBreak());
            }
            return {
                properties: {},
                children: [
                    new docx_1.Paragraph({
                        children: [...children, ...pageBreaks],
                    }),
                ],
            };
        }));
        Promise.all(sections).then((sections) => {
            let doc = new docx_1.Document({
                sections: sections,
            });
            docx_1.Packer.toBuffer(doc).then((buffer) => {
                fs_1.default.writeFileSync(docxDir, buffer);
                setTimeout(() => {
                    res.sendFile(docxPath);
                }, 2000);
                setTimeout(() => {
                    (0, rotateImg_1.deleteFolder)("./src/Uploads", id);
                    (0, rotateImg_1.deleteFolder)("./src/Processed_uploads", id);
                    fs_1.default.unlinkSync(docxDir);
                }, 7000);
            });
        });
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
});
exports.getDocxById = getDocxById;
