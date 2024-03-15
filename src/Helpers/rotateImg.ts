import Jimp from "jimp";
import fs from "fs";
import path from "path";
import sizeOf from "image-size";
import { ImageSize } from "../Types/type";

const rotateImg = async (
  imgPath: string,
  outputPath: string,
  _orientation: string
) => {
  await Jimp.read(imgPath)
    .then((img) => {
      // const { width, height } = img.bitmap;
      // if (orientation !== "automatico" && width > height) {
      //   return img.rotate(90).writeAsync(outputPath);
      // }
      return img.writeAsync(outputPath);
    })
    .catch((e) => {
      throw new Error(e.message);
    });
};

const getRootDir = () => {
  const rootDirDev = path.resolve(__dirname, "..", ".."); // Directorio raíz en desarrollo
  const rootDirProd = path.resolve(__dirname, "..", "..", "src"); // Directorio raíz en producción
  return fs.existsSync(path.join(__dirname, "..", "..", "build"))
    ? rootDirProd
    : rootDirDev;
};

const deleteFolder = async (folder: string, id: string) => {
  try {
    const dir = `./${folder}/${id}`;
    if (!fs.existsSync(dir)) {
      return;
    }
    let files = fs.readdirSync(dir);
    if (files.length === 0) {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    }
    files.forEach(async (file) => {
      const directory = path.join(dir, file);
      fs.unlinkSync(directory);
    });
    files = fs.readdirSync(dir);
    if (files.length === 0) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (error) {
    throw new Error("Error al eliminar la carpeta");
  }
};

const getImageDimensions = (imgPath: string): ImageSize => {
  const dimensions = sizeOf(imgPath);
  return dimensions;
};

export { rotateImg, getRootDir, deleteFolder, getImageDimensions };
