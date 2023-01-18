import { Router } from "express";

import { HelloController } from "../controllers/hello";

const router = Router();

/**
 * @openapi
 * /api/v1/hello:
 *  get:
 *    tags:
 *    - Example
 *    responses:
 *      200:
 *        description: First dummy route - Route example
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: Hello World!
 */
router.get("/", HelloController);

export { router };
