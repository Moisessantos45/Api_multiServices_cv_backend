import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { Response, Request } from "express";
import { deleteFolder, getRootDir } from "../Helpers/rotateImg";

const sendMessageImages = async (_req: Request, res: Response) => {
  try {
    res.status(200).json({ msg: "Files save successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

const sendImages = async (req: Request, res: Response) => {
  const { id } = req.params;
  const rootDir = getRootDir();
  const direcctorio = path.join(rootDir, "Uploads", id);
  const outputDir = path.join(rootDir, "Images", id);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  try {
    // Extraer imágenes del archivo ZIP
    const extractImagesFile = async (dir: string) => {
      const dirPath = fs.readdirSync(dir);

      for (const file of dirPath) {
        const filePath = path.join(direcctorio, file);
        const zip = new AdmZip(filePath);
        const zipEntries = zip.getEntries();
        zipEntries.map(async (entry) => {
          if (entry.entryName.includes("word/media/")) {
            const extension = path.extname(entry.entryName).toLowerCase();
            if (
              [".jpeg", ".jpg", ".png", ".avif", ".webp", ".gif"].includes(
                extension
              )
            ) {
              const imageData = entry.getData();
              const outputPath = path.join(outputDir, entry.name);
              fs.writeFileSync(outputPath, imageData);
            }
          }
        });
      }
    };

    const convertedImages = async (dir: string) => {
      return await fs.promises
        .readdir(dir)
        .then(async (files) => {
          return await Promise.all(
            files.map(async (file) => {
              const data = await fs.promises.readFile(
                path.join(outputDir, file)
              );
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
    };

    extractImagesFile(direcctorio)
      .then(()=>convertedImages(outputDir))
      .then((images) => {
        res.status(200).json(images);
        // Llamar a la función eliminarFiles
        deleteFolder("./src/Uploads", id);
        deleteFolder("./src/Images", id);
      })
      .catch((_e) => {
        throw new Error("Error al procesar las imágenes");
      });

  } catch (error) {
    res.status(500).json({ msg: "Error al procesar las imágenes" });
    // En caso de error, también llamar a la función eliminarFiles
    deleteFolder("./src/Uploads", id);
    deleteFolder("./src/Images", id);
  }
};

export { sendMessageImages, sendImages };
