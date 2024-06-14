import type { ContentType } from 'stremio-addon-sdk';
import express from 'express';
import { parse as parseQuery } from 'querystring';
import {
  catalogHandler,
  getManifest,
  metaHandler,
  streamHandler,
} from './addon';
import { testApiDomain as testApi } from './utils';

const addon = express();
const port = process.env.PORT ?? 1337;

addon.use(express.static('public'));

addon.get('/', function (_, res) {
  res.redirect('/configure/');
});

addon.get('/configure/test/:api', async function (req, res) {
  const start = performance.now();
  const isReachable = await testApi(req.params.api);
  const end = performance.now();
  const time = end - start;
  res.send({ ok: isReachable, time: Math.round(time) });
});

addon.get('/:api/manifest.json', function (_, res) {
  res.send(getManifest());
});

addon.get('/:api/catalog/:type/:id/:extra.json', async function (req, res) {
  res.send(
    await catalogHandler({
      id: req.params.id,
      type: req.params.type as ContentType,
      extra: parseQuery(req.params.extra) as unknown as {
        search: string;
        genre: string;
        skip: number;
      },
    })
  );
});

addon.get('/:api/meta/:type/:id.json', async function (req, res) {
  res.send(
    await metaHandler({
      id: req.params.id,
      type: req.params.type as ContentType,
    })
  );
});

addon.get('/:api/stream/:type/:id.json', async function (req, res) {
  res.send(
    await streamHandler({
      id: req.params.id,
      type: req.params.type as ContentType,
    })
  );
});

addon.listen(port, function () {
  console.log(`http://127.0.0.1:${port}`);
});
