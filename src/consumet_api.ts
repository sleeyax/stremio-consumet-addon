import { IAnimeInfo, IAnimeResult, ISource } from '@consumet/extensions';
import phin from 'phin';
const { name, version } = require('../package.json');
import { IS_DEV } from './constants';

export enum AnimeProvider {
  NineAnime = '9anime',
  AnimeFox = 'animefox',
  Animepahe = 'animepahe',
  Enime = 'enime',
  GogoAmime = 'gogoanime',
  Zoro = 'zoro',
}

export enum MovieProvider {
  Dramacool = 'dramacool',
  FlixHQ = 'flixhq',
  ViewAsian = 'viewasian',
}

export type ContentType = 'anime' | 'movies';
export type Provider = AnimeProvider | MovieProvider;

const oldApiProviders: Provider[] = [
  AnimeProvider.AnimeFox,
  AnimeProvider.Enime,
  AnimeProvider.Zoro,
];

export default class ConsumetApi {
  private readonly url = 'https://api.consumet.org';

  private async send<T>(
    type: ContentType,
    provider: Provider,
    path: string
  ): Promise<T | null> {
    const url = `${this.url}/${type}/${provider}/${path}`;

    const res = await phin({
      url,
      method: 'GET',
      timeout: 60_000,
      headers: {
        'User-Agent': `${name} v${version}${
          IS_DEV ? ' (development build)' : ''
        }`,
      },
    });

    if (res.statusCode !== 200) {
      console.error('failed to fetch API results', {
        url,
        statusCode: res.statusCode,
        body: res.body.toString(),
      });

      return null;
    }

    const json = JSON.parse(res.body.toString());

    return json;
  }

  async search(
    type: ContentType,
    provider: Provider,
    query: string,
    page?: number
  ) {
    const json = await this.send<{ results: IAnimeResult[] }>(
      type,
      provider,
      `${query}${page ? `?page=${page}` : ''}`
    );
    return json?.results;
  }

  async getInfo(type: ContentType, provider: Provider, id: string) {
    // I have no idea why this API is so inconsistent ¯\_(ツ)_/¯
    const path =
      oldApiProviders.includes(provider) || type === 'movies'
        ? `info?id=${id}`
        : `info/${id}`;

    return this.send<IAnimeInfo>(type, provider, path);
  }

  async getEpisodeSources(type: ContentType, provider: Provider, id: string) {
    // I have no idea why this API and the docs are so inconsistent ¯\_(ツ)_/¯
    const path =
      oldApiProviders.includes(provider) || type === 'movies'
        ? `watch?episodeId=${id}`
        : `watch/${id}`;

    return this.send<ISource>(type, provider, path);
  }
}
