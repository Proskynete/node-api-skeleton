import { Request, Response } from "express";

import { HelloService } from "../services/hello";
import { handleHttpError } from "../utils/handle-error";

export const HelloController = async (req: Request, res: Response) => {
  try {
    const response = await HelloService();
    res.status(200).json(response);
  } catch (error) {
    handleHttpError(res, "[HelloController] - Server internal error");
  }
};
