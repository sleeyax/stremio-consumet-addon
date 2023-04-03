import {
  MetaDetail,
  MetaPreview,
  Stream,
  Subtitle,
  addonBuilder,
} from 'stremio-addon-sdk';
import manifest from './manifest';
import { getAmimeEpisodeSource, getAmimeInfo, searchAnime } from './providers';
import { ADDON_ID } from './constants';
import { formatFuzzyDate } from './utils';

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ id, extra }) => {
  console.log(id, extra);

  const [, contentType, provider] = id.split('-');

  let metas: MetaPreview[] = [];

  if (contentType === 'anime') {
    const searchResults = await searchAnime(provider, extra.search);
    metas = searchResults.map((searchResult) => ({
      id: `${ADDON_ID}:${contentType}:${provider}:${searchResult.id}`,
      name: searchResult.title.toString(),
      type: 'series',
      poster: searchResult.image,
      posterShape: 'regular',
    }));
  }

  return { metas };
});

builder.defineMetaHandler(async ({ id, type }) => {
  console.log(id, type);

  const [, contentType, provider, consumetId] = id.split(':');

  let meta: MetaDetail = {} as MetaDetail;

  if (contentType === 'anime') {
    const info = await getAmimeInfo(provider, consumetId);
    meta = {
      id: `${ADDON_ID}:${contentType}:${provider}:${info.id}`,
      name: info.title.toString(),
      type,
      background: info.cover,
      logo: info.image,
      country: info.countryOfOrigin,
      description: info.description,
      genres: info.genres,
      imdbRating: info.rating?.toString(),
      released: info.releaseDate
        ? new Date(info.releaseDate).toISOString()
        : undefined,
      releaseInfo:
        info.startDate || info.endDate
          ? `${info.startDate ? formatFuzzyDate(info.startDate) : ''} - ${
              info.endDate ? formatFuzzyDate(info.endDate) : ''
            }`
          : undefined,
      website: info.url,
      runtime: info.status,
      videos: info.episodes?.map((episode) => ({
        id: `${ADDON_ID}:${contentType}:${provider}:${episode.id}`,
        released: new Date(
          episode.releaseDate || info.releaseDate || new Date()
        ).toISOString(),
        title: episode.title?.toString() || `Episode ${episode.number}`,
        episode: episode.number,
        overview: episode.description,
        season: 1,
      })),
    };
  }

  return { meta };
});

builder.defineStreamHandler(async ({ id, type }) => {
  console.log(id, type);

  const [, contentType, provider, episodeId] = id.split(':');

  let streams: Stream[] = [];

  if (contentType === 'anime') {
    const source = await getAmimeEpisodeSource(provider, episodeId);
    streams = source.sources.map((s) => ({
      name: `${s.quality} (${s.size || '? '} bytes)`,
      title: s.quality,
      subtitles: source.subtitles as Subtitle[],
      url: s.url,
      behaviorHints: {
        headers: source.headers,
      },
    }));
  }

  return { streams };
});

export default builder.getInterface();
