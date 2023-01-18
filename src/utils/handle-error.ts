import { Response } from "express";

import { EStatusCode } from "../models/status_code";

const handleHttpError = (res: Response, error: string) => {
  res.status(EStatusCode.INTERNAL_SERVER_ERROR).json({ error });
};

export { handleHttpError };
