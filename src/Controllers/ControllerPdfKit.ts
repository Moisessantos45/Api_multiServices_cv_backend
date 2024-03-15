import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import pdfkit from "pdfkit";
import { LayoutType } from "../Types/type";
import {
  rotateImg,
  deleteFolder,
  getImageDimensions,
  getRootDir,
} from "../Helpers/rotateImg";

const sendMessage = (_req: Request, res: Response) => {
  try {
    res.status(200).json({ msg: "Image save successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

const getPdfById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const nameFolder: string = req.query.nameFolder as string;
  const orientacion: string = req.query.orientacion as string;
  const adjust: boolean = JSON.parse(req.query.adjust as string) as boolean;
  try {
    // Para obtener el directorio raíz
    const rootDir = getRootDir();
    const dir = path.join(rootDir, "Uploads", id);
    const processedDir = path.join(rootDir, "Processed_uploads", id);
    const pdfDir = path.join(rootDir, "Pdfs_generados", `${nameFolder}.pdf`);
    const pdfPath = path.join(rootDir, "Pdfs_generados", `${nameFolder}.pdf`);

    if (adjust && !fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir);
    }

    const files = fs.readdirSync(dir);
    const firstImagePath = adjust
      ? `${processedDir}/processed_${files[0]}`
      : `${dir}/${files[0]}`;

    const outputPathOne = `${dir}/${files[0]}`;
    if (adjust) {
      await rotateImg(outputPathOne, firstImagePath, orientacion);
    }

    const { width: firstImageWidth, height: firstImageHeight } =
      getImageDimensions(firstImagePath);

    let firstLayout: LayoutType = "portrait";

    if (orientacion === "automatic") {
      if (
        firstImageWidth &&
        firstImageHeight !== undefined &&
        firstImageWidth > firstImageHeight
      ) {
        firstLayout = "landscape";
      }
    } else {
      firstLayout = orientacion as LayoutType;
    }

    const newPdf = new pdfkit({
      size: "letter",
      layout: firstLayout,
    });

    const writeStream = fs.createWriteStream(pdfDir);
    newPdf.pipe(writeStream);
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const imgPath = `${dir}/${file}`;
      const outputPath = adjust ? `${processedDir}/processed_${file}` : imgPath;
      if (adjust) {
        await rotateImg(imgPath, outputPath, orientacion);
      }

      const { width, height } = getImageDimensions(outputPath);

      let layout: LayoutType = "portrait";
      if (orientacion === "automatic") {
        if (width && height !== undefined && width > height) {
          layout = "landscape";
        }
      } else {
        layout = orientacion as LayoutType;
      }

      if (index !== 0) {
        newPdf.addPage({ size: "letter", layout: layout });
      }

      const pdfWidth = newPdf.page.width;
      const pdfHeight = newPdf.page.height;
      let imgWidth, imgHeight;
      if (width && height !== undefined && width > height) {
        imgWidth = pdfWidth;
        imgHeight = (pdfWidth / width) * height;
      } else {
        imgHeight = pdfHeight;
        imgWidth = height && width ? (pdfHeight / height) * width : pdfHeight;
      }
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;
      newPdf.image(outputPath, x, y, {
        width: imgWidth,
        height: imgHeight,
      });
    }
    newPdf.end();
    writeStream.on("finish", () => {
      res.sendFile(pdfPath);
      setTimeout(() => {
        deleteFolder("src/Uploads", id);
        deleteFolder("src/Processed_uploads", id);
        fs.unlinkSync(pdfDir);
      }, 5000);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export { sendMessage, getPdfById };
