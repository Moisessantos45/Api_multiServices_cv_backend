import fs from "fs";
import path from "path";
import pdf2json from "pdf2json";
import mammoth from "mammoth";
import { Response, Request } from "express";
import { deleteFolder, getRootDir } from "../Helpers/rotateImg";

interface PdfData {
  Pages: {
    Texts: {
      R: {
        T: string;
      }[];
    }[];
  }[];
}

const extractTextPdf = async (dir: string) => {
  let pdfParser = new pdf2json();
  let data = "";

  try {
    const pdfData = await new Promise<PdfData>((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", reject);
      pdfParser.on("pdfParser_dataReady", resolve);
      pdfParser.loadPDF(dir);
    });

    pdfData.Pages.forEach(function (page) {
      page.Texts.forEach(function (textElement) {
        let text = textElement.R.map(function (obj) {
          return obj.T;
        }).join("");
        let decodedText = decodeURIComponent(text);
        data += decodedText;
      });
    });
  } catch (error) {
    throw new Error("Error al extraer el texto del pdf");
  }

  return data;
};

const extractTextDocx = async (dir: string) => {
  let data = "";
  try {
    const result = await mammoth.extractRawText({ path: dir });
    data = result.value;
  } catch (error) {
    console.error(error);
    throw new Error("Error al extraer el texto del docx");
  }
  return data;
};

const sendMessageText = async (_req: Request, res: Response) => {
  try {
    res.status(200).json({ msg: "Files save successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

const extractContentText = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const rootDir = getRootDir();

  const dir = path.join(rootDir, "Uploads", id);

  try {
    const filesText = fs.readdirSync(dir);
    const content: string[] = [];

    const promises = filesText.map(async (file, _i) => {
      const pathFile = path.join(dir, file);
      const fileExtension = path.extname(pathFile);
      let text = "";
      if (fileExtension === ".pdf" || fileExtension === ".docx") {
        try {
          if (fileExtension === ".pdf") {
            text = await extractTextPdf(pathFile);
          } else {
            text = await extractTextDocx(pathFile);
          }
          content.push(text);
        } catch (_error) {
          throw new Error("Error al extraer el texto del archivo");
        }
      }
    });

    Promise.all(promises)
      .then(() => {
        res.status(200).json(content);
        deleteFolder("./src/Uploads", id);
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

export { sendMessageText, extractContentText };
