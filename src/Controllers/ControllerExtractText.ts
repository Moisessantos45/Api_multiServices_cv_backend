import fs from "fs";
import path from "path";
import pdf2json from "pdf2json";
import mammoth from "mammoth";
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
    console.log(error);
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

const extractContentText = async (
  req: Request,
  res: Response
): Promise<void> => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ msg: "No se subió ningún archivo" });
    return;
  }
  let content: string = "";
  const fileExtension = path.extname(files[0].path);
  if (fileExtension !== ".pdf" && fileExtension !== ".docx") {
    res.status(400).json({ msg: "El archivo no es valido" });
    return;
  }
  try {
    if (fileExtension == ".pdf") {
      content = await extractTextPdf(files[0].path);
    } else {
      content = await extractTextDocx(files[0].path);
    }
    res.status(200).json(content);
    fs.unlinkSync(files[0].path);
    deleteFolderWidthFiles(req.params.id, "./src/Uploads");
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

export { extractContentText };
