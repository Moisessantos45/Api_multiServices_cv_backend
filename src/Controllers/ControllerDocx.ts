import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import {
  Document,
  Packer,
  Paragraph,
  ImageRun,
  PageBreak,
  VerticalPositionRelativeFrom,
  VerticalPositionAlign,
} from "docx";
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

const getDocxById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const nameFolder: string = req.query.nameFolder as string;
  try {
    const rootDir = getRootDir();
    const dir = path.join(rootDir, "Uploads", id);

    const processedDir = path.join(rootDir, "Processed_uploads", id);
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir);
    }
    const docxDir = path.join(rootDir, "Docxs_generados", `${nameFolder}.docx`);
    const docxPath = path.join(
      rootDir,
      "Docxs_generados",
      `${nameFolder}.docx`
    );

    const files = fs.readdirSync(dir);

    const sections = files.map(async (file, i) => {
      const imgPath = `${dir}/${file}`;
      const processedImgPath = `${processedDir}/processed_${file}`;

      await rotateImg(imgPath, processedImgPath, "portrait");

      const img = fs.readFileSync(processedImgPath);
      const { width, height } = getImageDimensions(processedImgPath);
      if (width === undefined) return;
      if (height === undefined) return;
      const pageWidth = (8.5 * 1440) / 16; // Ancho de la página (en twips)
      const pageHeight = (11 * 1440) / 16; // Altura de la página (en twips)
      // Calcular las dimensiones de la imagen para que se ajusten a la página
      let imageWidth, imageHeight;
      if (width > height) {
        imageWidth = pageWidth;
        imageHeight = (pageWidth / width) * height;
      } else {
        imageHeight = pageHeight;
        imageWidth = (pageHeight / height) * width;
      }
      const image: ImageRun = new ImageRun({
        data: img,
        transformation: {
          width: imageWidth,
          height: imageHeight,
        },
        floating: {
          zIndex: 1,
          horizontalPosition: {
            relative: VerticalPositionRelativeFrom.PAGE,
            align: VerticalPositionAlign.CENTER,
          },
          verticalPosition: {
            relative: VerticalPositionRelativeFrom.PAGE,
            align: VerticalPositionAlign.CENTER,
          },
          wrap: {
            type: 3,
            side: "bothSides",
          },
        },
      });
      const children: ImageRun[] = [image];
      const pageBreaks: PageBreak[] = [];

      if (i < files.length - 1) {
        pageBreaks.push(new PageBreak());
        // new PageBreak();
        // children.push(new PageBreak());
      }
      return {
        properties: {},
        children: [
          new Paragraph({
            children: [...children, ...pageBreaks],
          }),
        ],
      };
    });

    Promise.all(sections).then((sections) => {
      let doc = new Document({
        sections: sections as any[],
      });

      Packer.toBuffer(doc).then((buffer) => {
        fs.writeFileSync(docxDir, buffer);
        setTimeout(() => {
          res.sendFile(docxPath);
        }, 2000);

        setTimeout(() => {
          deleteFolder("./src/Uploads", id);
          deleteFolder("./src/Processed_uploads", id);
          fs.unlinkSync(docxDir);
        }, 4000);
      });
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

export { sendMessage, getDocxById };
