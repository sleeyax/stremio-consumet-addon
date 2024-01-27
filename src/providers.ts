import { ANIME } from '@consumet/extensions';

// TODO: use these providers from the lib as fallback when consumet API is down?

export const animeProviders = [
  ...[
    ANIME.AnimeFox,
    ANIME.AnimePahe,
    // ANIME.Bilibili,
    // ANIME.Gogoanime,
    ANIME.Marin,
    // ANIME.NineAnime,
    // ANIME.Zoro,
  ].map((provider) => new provider()),
  // TODO: configure these providers
  new ANIME.Bilibili(),
  new ANIME.Gogoanime(),
  new ANIME.NineAnime(),
  new ANIME.Zoro(),
];

function findProvider(name: string) {
  const provider = animeProviders.find(
    (provider) => provider.name === (name as unknown)
  );

  if (!provider) {
    throw new Error(`Failed to find provider '${name}'`);
  }

  return provider;
}

export async function searchAnime(providerName: string, query: string) {
  const provider = findProvider(providerName);
  const { results } = await provider.search(query);
  return results;
}

export async function getAmimeInfo(providerName: string, id: string) {
  const provider = findProvider(providerName);
  return provider.fetchAnimeInfo(id);
}

export async function getAmimeEpisodeSource(
  providerName: string,
  episodeId: string
) {
  const provider = findProvider(providerName);
  return provider.fetchEpisodeSources(episodeId);
}
