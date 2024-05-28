"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Routers_1 = __importDefault(require("./Routers"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
dotenv_1.default.config();
const allowedUrls = [process.env.FRONTEND_URL_HOST];
const opcionsCors = {
    origin: function (url, cb) {
        if (allowedUrls.indexOf(url) !== -1) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    },
};
app.use((0, cors_1.default)(opcionsCors));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    limit: 20,
    handler: function (_req, res) {
        res.status(429).json({ msg: "Too many requests, please try again later" });
    },
});
app.use(limiter);
app.use("/api/2.0", Routers_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
