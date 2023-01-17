import { Request, Response } from "express";

export const HelloController = (req: Request, res: Response): void => {
  res.status(200).json({
    message: "Hello World!",
  });
};
