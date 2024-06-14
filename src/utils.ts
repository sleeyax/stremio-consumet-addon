import { FuzzyDate } from '@consumet/extensions';

export function formatFuzzyDate({
  day,
  month,
  year,
}: FuzzyDate): string | undefined {
  if (day == null || month == null || year == null) {
    return undefined;
  }

  return `${year}-${month}-${day}`;
}

/**
 * Check if we can reach the given Consumet API.
 * @param domain The domain to check.
 * @returns Whether the API is reachable.
 */
export async function testApiDomain(domain: string) {
  try {
    const res = await fetch(`http://${domain}`);

    if (res.status !== 200) {
      return false;
    }

    const text = await res.text();

    return text.includes('consumet');
  } catch (_) {
    return false;
  }
}
