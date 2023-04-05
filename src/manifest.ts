import { ManifestCatalog, Manifest as manifest } from 'stremio-addon-sdk';
import { ADDON_ID } from './constants';
import { AnimeProvider, MovieProvider } from './consumet_api';
import { version, description } from '../package.json';

const manifest: manifest = {
  id: `com.sleeyax.${ADDON_ID}`,
  name: 'Consumet',
  version,
  description,
  logo: 'https://camo.githubusercontent.com/a36d9dc03ee8a00e06617a6b6924e54c863f327e1ab4e4d4379348f7f480b281/68747470733a2f2f636f6e73756d65742e6f72672f696d616765732f636f6e73756d65746c6f676f2e706e67',
  catalogs: [
    ...Object.values(AnimeProvider).map(
      (provider) =>
        ({
          id: `${ADDON_ID}-anime-${provider}` as const,
          name: provider,
          type: 'series' as const,
          extra: [
            {
              name: 'search' as const,
              isRequired: true,
            },
          ],
        } as ManifestCatalog)
    ),
    ...Object.values(MovieProvider).map(
      (provider) =>
        ({
          id: `${ADDON_ID}-movies-${provider}` as const,
          name: provider,
          type: 'movie' as const,
          extra: [
            {
              name: 'search' as const,
              isRequired: true,
            },
          ],
        } as ManifestCatalog)
    ),
  ],
  resources: ['catalog', 'meta', 'stream'],
  types: ['series', 'movie'],
  idPrefixes: [ADDON_ID],
};

export default manifest;
