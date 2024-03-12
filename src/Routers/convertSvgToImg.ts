import { Router } from "express";
import { convertSvgToImg } from "../Controllers/ControllerConvertSvgToImg";

const router = Router();

router.post("/", convertSvgToImg);

export default router;
