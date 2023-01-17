import { readdirSync } from 'node:fs';
import { Router } from 'express';
import { removeExtensions } from '../utils/remove_extensions';

const router: Router = Router();
const PATH_ROUTES = __dirname;

/**
 * It takes a file name, removes the file extension, and if the file name is not index, it imports the
 * file and adds it to the router
 * @param {string} file - The name of the file that we're importing.
 */
const loadRoutes = (file: string): void => {
	const name = removeExtensions(file);
	if (name !== 'index') {
		import(`./${file}`).then((routeModule) => {
			router.use(`/${name}`, routeModule.router);
		});
	}
};

readdirSync(PATH_ROUTES).filter((file) => loadRoutes(file));

export { router };