import { Request, Response } from "express";

import { HelloService } from "../services/hello";

export const HelloController = async (req: Request, res: Response) => {
  const response = await HelloService();
  res.status(200).json(response);
};
