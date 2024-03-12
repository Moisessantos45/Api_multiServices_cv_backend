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
exports.convertSvgToImg = void 0;
const svg2img_1 = __importDefault(require("svg2img"));
const convertSvgToImg = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dataSvg, typeImg } = req.body;
    try {
        (0, svg2img_1.default)(dataSvg, { format: typeImg }, function (error, buffer) {
            if (error) {
                res.status(500).json({ msg: "Error en el servidor" });
                return;
            }
            res.status(200).json({ dato: buffer, type: typeImg });
        });
    }
    catch (error) {
        res.status(500).json({ msg: "Error al convertir el archivo" });
    }
});
exports.convertSvgToImg = convertSvgToImg;
