import { Router } from "express";
import fs from "fs";

const router = Router();

const path = `${__dirname}`;

const deleteExtensionFile = (fileName: string): string => {
  return fileName.split(".").shift() || "";
};

const routerDinamic = async () => {
  const files = fs.readdirSync(path).filter((file) => {
    const fileOmitExtension = deleteExtensionFile(file);
    const verfyFileNameOmitIndex: boolean = ["index"].includes(
      fileOmitExtension
    );
    return !verfyFileNameOmitIndex;
  });

  files.forEach(async (file) => {
    const fileNameOmitExtension = deleteExtensionFile(file);
    const fileRouter = `/${fileNameOmitExtension}`;
    const filePath = `./${fileNameOmitExtension}`;
    const module = await import(filePath);
    router.use(fileRouter, module.default);
  });
};

routerDinamic();

export default router;
