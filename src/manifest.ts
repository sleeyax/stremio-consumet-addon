import { Manifest as manifest } from 'stremio-addon-sdk';
import { animeProviders } from './providers';
import { ADDON_ID } from './constants';
const { version, description } = require('../package.json');

const manifest: manifest = {
  id: `com.sleeyax.${ADDON_ID}`,
  name: 'Consumet',
  version,
  description,
  logo: 'https://camo.githubusercontent.com/a36d9dc03ee8a00e06617a6b6924e54c863f327e1ab4e4d4379348f7f480b281/68747470733a2f2f636f6e73756d65742e6f72672f696d616765732f636f6e73756d65746c6f676f2e706e67',
  catalogs: [
    ...animeProviders.map((provider) => ({
      id: `${ADDON_ID}-anime-${provider.name}`,
      name: provider.name,
      type: 'series' as const,
      extra: [
        {
          name: 'search' as const,
          isRequired: true,
        },
      ],
    })),
  ],
  resources: ['catalog', 'meta', 'stream'],
  types: ['series', 'channel', 'movie', 'tv'],
  idPrefixes: [ADDON_ID],
};

export default manifest;
