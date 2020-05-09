import express from 'express';
import fs from 'fs';
import path from 'path';
import 'colors';
import * as bodyParser from 'body-parser';
import * as commanders from './commanders';

export function apply(root: string) {
  const app = express();

  const whitelist: {[uri: string]: string} = {
    'challenge32.js': 'dist/challenge32.js',
    'challenge32.js.map': 'dist/challenge32.js.map',
    'challenge32.lib.js': 'dist/vendors~challenge32.js',
    'vendors~challenge32.js.map': 'dist/vendors~challenge32.js.map',
    'web-animations.js':
        'node_modules/web-animations-js/web-animations-next-lite.min.js',
    'web-animations-next-lite.min.js.map':
        'node_modules/web-animations-js/web-animations-next-lite.min.js.map',
    'root.css': '',
    '': 'index.html',
    'favicon.ico': '',
  };

  const keys = Object.keys(whitelist);
  app.use((req: express.Request, _: express.Response, next: () => void) => {
    const isWhitelisted = keys.includes(req.path.substring(1));
    const isImage = /^\/images\//.test(req.path);
    const isCommanderRoute = commanders.whitelistedRoutes.includes(req.path);

    let reqPath = isWhitelisted ? req.path : req.path.red;
    if (isImage) {
      const safeSuffix = path.normalize(req.path).replace(/^(\.\.(\/|\\|$))+/, '');
      if (fs.existsSync(path.join(root, 'resources', safeSuffix))) {
        reqPath = req.path;
      }
    }
    if (isCommanderRoute) reqPath = req.path;
    console.log(`[${(new Date()).toISOString().bold}] ${req.ip.bold} requested ${reqPath}`);
    next();
  });

  app.use('/images', express.static('resources/images'));
  for (const key in whitelist) {
    const file = whitelist[key] || key;
    app.get(`/${key}`, (_: express.Request, res: express.Response) =>
        res.sendFile(`${root}/${file}`));
  }

  app.use(bodyParser.json());
  commanders.apply(app);

  app.listen(3004, () => console.log('Server running on port 3004'.green.bold));
}
