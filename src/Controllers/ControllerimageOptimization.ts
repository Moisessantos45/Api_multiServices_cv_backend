import fs from "fs";
import path from "path";
import Jimp from "jimp";
import { Request, Response } from "express";
import { deleteFolder, getRootDir } from "../Helpers/rotateImg";

const sendMessageSaveImg = async (_req: Request, res: Response) => {
  try {
    res.status(200).json({ msg: "Image save successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

const imageOptimization = async (req: Request, res: Response) => {
  const { id } = req.params;
  let quality: number = 60; // valor por defecto
  if (!isNaN(Number(req.query.quality))) {
    quality = Number(req.query.quality);
  }

  try {
    const rootDir = getRootDir();
    const dir = path.join(rootDir, "Uploads", id);
    const saveDir = path.join(rootDir, "Images", id);
    const files = fs.readdirSync(dir);
    await Promise.all(
      files.map(async (file, _i) => {
        const imgPath = path.join(dir, file);
        const img = await Jimp.read(imgPath);
        await img.quality(quality).writeAsync(`${saveDir}/${file}`);
      })
    ).catch((error) => {
      console.error(`Error reading directory: ${error}`);
      throw new Error("Error al leer el directorio");
    });

    const images = await fs.promises
      .readdir(saveDir)
      .then(async (files) => {
        return await Promise.all(
          files.map(async (file) => {
            const data = await fs.promises.readFile(path.join(saveDir, file));
            const base64Image = data.toString("base64");
            return {
              filename: file,
              data: base64Image,
              contentType: `image/${file.split(".")[1]}`,
            };
          })
        );
      })
      .catch((error) => {
        console.error(`Error reading directory: ${error}`);
        throw new Error("Error al leer el directorio");
      });

    res.status(200).json(images);
    setTimeout(() => {
      deleteFolder("src/Uploads", id);
      deleteFolder("src/Images", id);
    }, 3000);
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

export { sendMessageSaveImg, imageOptimization };
