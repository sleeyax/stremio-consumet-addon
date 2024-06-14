import { IAnimeInfo, IAnimeResult, ISource } from '@consumet/extensions';
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

export class ConsumetApi {
  private readonly url = 'https://api.consumet.org';

  private async send<T>(
    type: ContentType,
    provider: Provider,
    path: string
  ): Promise<T | null> {
    const url = `${this.url}/${type}/${provider}/${path}`;

    const headers = new Headers();
    headers.set('User-Agent', `${name} v${version}${IS_DEV ? ' (development build)' : ''}`);

    const res = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (res.status !== 200) {
      console.error('failed to fetch API results', {
        url,
        statusCode: res.status,
        body: await res.text()
      });

      return null;
    }

    const json = await res.json() as T;

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
