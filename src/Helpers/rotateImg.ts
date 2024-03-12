import Jimp from "jimp";
import fs from "fs";
import path from "path";

const rotateImg = async (
  imgPath: string,
  outputPath: string,
  orientation: string
) => {
  await Jimp.read(imgPath)
    .then((img) => {
      const { width, height } = img.bitmap;
      if (orientation !== "automatico" && width > height) {
        return img.rotate(90).writeAsync(outputPath);
      }
      return img.writeAsync(outputPath);
    })
    .catch((e) => {
      throw new Error(e.message);
    });
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

export { rotateImg, deleteFolder };
