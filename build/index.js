"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Routers_1 = __importDefault(require("./Routers"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const allowedUrls = [process.env.FRONTEND_URL_HOST];
const opcionsCors = {
    origin: function (url, cb) {
        if (allowedUrls.indexOf(url) !== -1) {
            cb(null, true);
        }
        else {
            cb(null, true);
        }
    },
};
app.use((0, cors_1.default)(opcionsCors));
app.use("/api/2.0", Routers_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
