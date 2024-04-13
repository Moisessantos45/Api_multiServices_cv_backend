import { Request, Response } from "express";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import { deleteFolder, getRootDir } from "../Helpers/rotateImg";
import path from "path";

const sendMessageMergePdfs = async (_req: Request, res: Response) => {
  try {
    res.status(200).json({ msg: "Merge PDFs" });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

const mergePdfs = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    
    const rootDir = getRootDir();
    const dir = path.join(rootDir, "Uploads", id);
    const dirPdf = path.join(rootDir, "Processed_uploads", id);
    if (!fs.existsSync(dirPdf)) {
      fs.mkdirSync(dirPdf);
    }
    const files = fs.readdirSync(dir);
    const pdfDoc = await PDFDocument.create();
    for (const file of files) {
      const filePath = path.join(dir, file);
      const fileData = fs.readFileSync(filePath);
      const pdf = await PDFDocument.load(fileData);
      const copiedPages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => pdfDoc.addPage(page));
    }

    const pdfBytes = await pdfDoc.save();
    const fileNamePdf = `merge-${id}.pdf`;
    const pdfPath = path.join(dirPdf, fileNamePdf);

    fs.writeFileSync(pdfPath, pdfBytes);
    res.status(200).sendFile(pdfPath);

    setTimeout(() => {
      deleteFolder("src/Uploads", id);
      deleteFolder("src/Processed_uploads", id);
    }, 5000);
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

export { sendMessageMergePdfs, mergePdfs };
