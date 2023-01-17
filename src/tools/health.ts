import { Request, Response } from "express";

import { EStatusCode } from "../models/status_code";

const Health = (_: Request, res: Response) => res.status(EStatusCode.OK).send();

export default Health;
