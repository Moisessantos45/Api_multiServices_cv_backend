import svg2img from "svg2img";
import { Request, Response } from "express";

const convertSvgToImg = async (req: Request, res: Response) => {
  const { dataSvg, typeImg } = req.body;
  try {
    svg2img(dataSvg, { format: typeImg }, function (error, buffer) {
      if (error) {
        res.status(500).json({ msg: "Error en el servidor" });
        return;
      }
      res.status(200).json({ dato: buffer, type: typeImg });
    });
  } catch (error) {
    res.status(500).json({ msg: "Error al convertir el archivo" });
  }
};

export { convertSvgToImg };
