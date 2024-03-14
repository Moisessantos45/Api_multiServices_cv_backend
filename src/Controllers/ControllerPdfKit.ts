import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import pdfkit from "pdfkit";
import { LayoutType } from "../Types/type";
import {
  rotateImg,
  deleteFolder,
  getImageDimensions,
} from "../Helpers/rotateImg";

const sendMessage = (_req: Request, res: Response) => {
  try {
    res.status(200).json({ msg: "Image save successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

const getPdfById = async (req: Request, res: Response) => {
  console.time("pdf");
  const { id } = req.params;
  const nameFolder: string = req.query.nameFolder as string;
  const orientacion: string = req.query.orientacion as string;
  try {
    const dir = `./src/Uploads/${id}`;
    const processedDir = `./src/Processed_uploads/${id}`;
    const pdfDir = `./src/Pdfs_generados/${nameFolder}.pdf`;
    const pdfDirRuta = `../Pdfs_generados/${nameFolder}.pdf`;
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir);
    }
    const pdfPath = path.resolve(__dirname, pdfDirRuta);
    const files = fs.readdirSync(dir);
    const firstImagePath = `${processedDir}/processed_${files[0]}`;
    const outputPathOne = `${dir}/${files[0]}`;
    await rotateImg(outputPathOne, firstImagePath, orientacion);

    const { width: firstImageWidth, height: firstImageHeight } =
      getImageDimensions(firstImagePath);
    if (firstImageWidth === undefined) return;
    if (firstImageHeight === undefined) return;
    let firstLayout: LayoutType = "portrait";

    if (orientacion === "automatico") {
      if (firstImageWidth > firstImageHeight) {
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
      const outputPath = `${processedDir}/processed_${file}`;

      await rotateImg(imgPath, outputPath, orientacion);

      const { width, height } = getImageDimensions(outputPath);

      if (width === undefined) return;
      if (height === undefined) return;
      let layout: LayoutType = "portrait";
      if (orientacion === "automatico") {
        if (width > height) {
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
      if (width > height) {
        imgWidth = pdfWidth;
        imgHeight = (pdfWidth / width) * height;
      } else {
        imgHeight = pdfHeight;
        imgWidth = (pdfHeight / height) * width;
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
    console.timeEnd("pdf");
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export { sendMessage, getPdfById };
