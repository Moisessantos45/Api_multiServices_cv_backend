import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { Response, Request } from "express";

const deleteFolderWidthFiles = (id: string, folder: string) => {
  const dir = path.join(folder, id);
  try {
    fs.readdir(dir, (err, files) => {
      if (err) {
        throw new Error("Error al leer la carpeta");
      }
      if (files.length === 0) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
  } catch (error) {
    throw new Error("Error al eliminar la carpeta");
  }
};

const deleteFiles = async (
  id: string,
  folder: string = "",
  nameFolder: string
) => {
  let folderPath = `./${nameFolder}/${id}`;
  if (folder !== "") {
    folderPath = `./${nameFolder}/${id}/${folder}`;
  }
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      throw new Error("Error al leer la carpeta");
    }
    files.forEach((file) => {
      const rutaPath = path.join(folderPath, file);
      try {
        fs.unlinkSync(rutaPath);
      } catch (error) {
        throw new Error("Error al eliminar el archivo");
      }
    });
    try {
      fs.rmSync(folderPath, { recursive: true, force: true });
      deleteFolderWidthFiles(id, "./src/Images");
    } catch (error) {
      throw new Error("Error al eliminar la carpeta");
    }
  });
};

const sendImages = async (req: Request, res: Response) => {
  const { id, i } = req.params;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ msg: "No se subió ningún archivo" });
    return;
  }
  const direcctorio = files[0].path;
  const outputDir = `./src/Images/${id}/${i}`;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const zip = new AdmZip(direcctorio);
  const zipEntries = zip.getEntries();
  try {
    // Extraer imágenes del archivo ZIP
    await Promise.all(
      zipEntries.map(async (entry) => {
        if (entry.entryName.includes("word/media/")) {
          const extension = path.extname(entry.entryName).toLowerCase();
          if (
            [".jpeg", ".jpg", ".png", ".avif", ".webp", ".gif"].includes(
              extension
            )
          ) {
            const imageData = entry.getData();
            // const dimensions = sizeOf(imageData);
            // const filename = path.basename(entry.entryName);
            const outputPath = path.join(outputDir, entry.name);
            fs.writeFileSync(outputPath, imageData);
          }
        }
      })
    );
    // Leer directorio y enviar imágenes al frontend
    const images = await fs.promises
      .readdir(outputDir)
      .then(async (files) => {
        return await Promise.all(
          files.map(async (file) => {
            const data = await fs.promises.readFile(path.join(outputDir, file));
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
        return [];
      });

    res.status(200).json(images);
    fs.unlinkSync(direcctorio);
    // Llamar a la función eliminarFiles
    deleteFolderWidthFiles(id, "./src/Uploads");
    deleteFiles(id, i, "src/Images");
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al procesar las imágenes" });

    // En caso de error, también llamar a la función eliminarFiles
    deleteFolderWidthFiles(id, "./src/Uploads");
    deleteFiles(id, i, "src/Images");
  }
};

export { sendImages };
