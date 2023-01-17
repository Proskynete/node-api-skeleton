import { Router } from "express";

import { HelloController } from "../controllers/hello";

const router = Router();

router.get("/", HelloController);

export { router };
