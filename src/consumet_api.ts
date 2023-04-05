import { IAnimeInfo, IAnimeResult, ISource } from '@consumet/extensions';
import phin from 'phin';
import packageJson from '../package.json';
import { IS_DEV } from './constants';

export enum AnimeProvider {
  NineAnime = '9anime',
  AnimeFox = 'animefox',
  Animepahe = 'animepahe',
  Enime = 'enime',
  GogoAmime = 'gogoanime',
  Zoro = 'zoro',
}

export type ContentType = 'anime';
export type Provider = AnimeProvider;

export default class ConsumetApi {
  private readonly url = 'https://api.consumet.org';

  private async send<T>(
    type: ContentType,
    provider: Provider,
    path: string
  ): Promise<T | null> {
    const res = await phin({
      url: `${this.url}/${type}/${provider}/${path}`,
      method: 'GET',
      timeout: 60_000,
      headers: {
        'User-Agent': `${packageJson.name} v${packageJson.version}${
          IS_DEV ? '(development build)' : ''
        }`,
      },
    });

    if (res.statusCode !== 200) {
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
    return this.send<IAnimeInfo>(type, provider, `info/${id}`);
  }

  async getEpisodeSources(type: ContentType, provider: Provider, id: string) {
    return this.send<ISource>(type, provider, `watch/${id}`);
  }
}
