import type {
  Args,
  Cache,
  ContentType,
  MetaDetail,
  MetaPreview,
  Stream,
  Subtitle,
} from 'stremio-addon-sdk';
import { ADDON_ID, IS_DEV } from './constants';
import { formatFuzzyDate } from './utils';
import {
  ConsumetApi,
  AnimeProvider,
  ContentType as ConsumetContentType,
} from './consumet_api';
import { manifest } from './manifest';

export function getManifest() {
  return manifest;
}

export async function catalogHandler({
  id,
  extra,
  api,
}: Args & { api: string }): Promise<{ metas: MetaPreview[] } & Cache> {
  if (IS_DEV) {
    console.log(id, extra, api);
  }

  const [, contentType, provider] = id.split('-');

  let metas: MetaPreview[] = [];

  const consumetApi = new ConsumetApi(api);

  const searchResults = await consumetApi.search(
    contentType as ConsumetContentType,
    provider as AnimeProvider,
    extra.search
  );
  metas = (searchResults ?? []).map((searchResult) => ({
    id: `${ADDON_ID}:${contentType}:${provider}:${searchResult.id}`,
    name: searchResult.title.toString(),
    type: 'series',
    poster: searchResult.image,
    posterShape: 'regular',
  }));

  return { metas };
}

export async function metaHandler({
  id,
  type,
  api,
}: {
  type: ContentType;
  id: string;
  api: string;
}): Promise<{ meta: MetaDetail } & Cache> {
  if (IS_DEV) {
    console.log(id, type);
  }

  const [, contentType, provider, consumetId] = id.split(':');

  let meta: MetaDetail = null as unknown as MetaDetail;

  const consumetApi = new ConsumetApi(api);

  const info = await consumetApi.getInfo(
    contentType as ConsumetContentType,
    provider as AnimeProvider,
    consumetId
  );

  if (info != null) {
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
          ? `${info.startDate ? formatFuzzyDate(info.startDate) : ''} - ${info.endDate ? formatFuzzyDate(info.endDate) : ''}`
          : undefined,
      website: info.url,
      runtime: info.status,
      videos: info.episodes?.map((episode) => ({
        id: `${ADDON_ID}:${contentType}:${provider}:${episode.id}`,
        released: new Date(
          episode.releaseDate || info.releaseDate || 1970
        ).toISOString(),
        title: episode.title?.toString() || `Episode ${episode.number}`,
        episode: episode.number,
        overview: episode.description,
        season: 1,
      })),
    };
  }

  return { meta };
}

export async function streamHandler({
  id,
  type,
  api,
}: {
  type: ContentType;
  id: string;
  api: string;
}): Promise<{ streams: Stream[] } & Cache> {
  if (IS_DEV) {
    console.log(id, type);
  }

  const [, contentType, provider, episodeId] = id.split(':');

  let streams: Stream[] = [];

  const consumetApi = new ConsumetApi(api);

  const source = await consumetApi.getEpisodeSources(
    contentType as ConsumetContentType,
    provider as AnimeProvider,
    episodeId
  );
  streams = (source?.sources ?? []).map((s) => ({
    name: s.quality ?? 'Unknown',
    title: s.quality ?? 'Unknown',
    subtitles: source?.subtitles as Subtitle[],
    url: s.url,
    behaviorHints: {
      headers: source?.headers,
    },
  }));

  return { streams };
}
