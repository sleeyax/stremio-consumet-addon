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
