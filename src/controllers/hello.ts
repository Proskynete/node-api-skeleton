import { Request, Response } from "express";

import { EStatusCode } from "../models/status_code";
import { HelloService } from "../services/hello";

export const HelloController = async (req: Request, res: Response) => {
  try {
    const response = await HelloService();
    res.status(EStatusCode.OK).json(response);
  } catch (error) {
    res.status(EStatusCode.INTERNAL_SERVER_ERROR).json({ error });
  }
};
