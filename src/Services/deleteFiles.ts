import fs from "fs/promises";
import path from "path";
import { Request, Response } from "express";
import { getRootDir } from "../Helpers/rotateImg";

const dirs = [
  "Docxs_generados",
  "Pdfs_generados",
  "Processed_uploads",
  "Uploads",
  "Images",
];

const deleteFilesDir = async (dir: string): Promise<void> => {
  try {
    const stats = await fs.stat(dir);
    if (!stats.isDirectory()) {
      await fs.unlink(dir);
      return;
    }

    const files = await fs.readdir(dir);

    for (const file of files) {
      const currentPath = path.join(dir, file);
      const stats = await fs.stat(currentPath);
      if (stats.isDirectory()) {
        await deleteFilesDir(currentPath);
      } else {
        const extensionOmit = [".gitkeep",""].includes(path.extname(currentPath));
        if (extensionOmit) return; // Omitir archivos con extensión .gitkeep
        await fs.unlink(currentPath);
      }
    }

    const omitDir = dirs.includes(path.basename(dir));
    if (omitDir) return; // Omitir directorios de la lista dirs
    const remainingFiles = await fs.readdir(dir);
    if (remainingFiles.length === 0) {
      await fs.rmdir(dir);
    }
  } catch (error) {
    console.error(`Error deleting directory ${dir}:`, error);
    throw new Error(`Error deleting directory ${dir}`);
  }
};

const deleteFiles = async (_req: Request, res: Response) => {
  try {
    const rootDir = getRootDir();
    for (const dir of dirs) {
      const currentDir = path.join(rootDir, dir);
      await deleteFilesDir(currentDir);
    }
    res.status(200).json({ msg: "Archivos eliminados correctamente" });
  } catch (error) {
    res.status(500).json({ msg: "Error al eliminar los archivos" });
  }
};

export { deleteFiles };
