import { Router } from "express";
import { deleteFiles } from "../Services/deleteFiles";

const router = Router();

router.get("/",deleteFiles);

export default router;