import express from 'express';
import * as bodyParser from 'body-parser';
import * as commanders from './commanders';

export function apply(root: string) {
  const app = express();

  const whitelist: {[uri: string]: string} = {
    'challenge32.js': 'dist/challenge32.js',
    'challenge32.lib.js': 'dist/vendors~challenge32.js',
    'web-animations.js':
        'node_modules/web-animations-js/web-animations-next-lite.min.js',
    'root.css': '',
    '': 'index.html',
    'favicon.ico': '',
  };

  app.use('/images', express.static('resources/images'));
  for (const key in whitelist) {
    const file = whitelist[key] || key;
    app.get(`/${key}`, (_: express.Request, res: express.Response) =>
        res.sendFile(`${root}/${file}`));
  }

  app.use(bodyParser.json());
  commanders.apply(app);

  app.listen(3004, () => console.log('Server running on port 3004'));
}
