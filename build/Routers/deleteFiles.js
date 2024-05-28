"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deleteFiles_1 = require("../Services/deleteFiles");
const router = (0, express_1.Router)();
router.get("/", deleteFiles_1.deleteFiles);
exports.default = router;
