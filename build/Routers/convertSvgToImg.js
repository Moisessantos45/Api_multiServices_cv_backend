"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ControllerConvertSvgToImg_1 = require("../Controllers/ControllerConvertSvgToImg");
const router = (0, express_1.Router)();
router.post("/", ControllerConvertSvgToImg_1.convertSvgToImg);
exports.default = router;
