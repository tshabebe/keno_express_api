import _ from 'lodash';
import { parseISO, isValid } from 'date-fns';

export function parseDate(input: string): Date | false {
  const parsed = parseISO(input);
  return isValid(parsed) ? parsed : false;
}

export type CompactNumbersResult = { played_number: number[] } & Record<string, unknown>;

export function compactNumbers(query: Record<string, unknown>): false | CompactNumbersResult {
  const result = [
    parseInt(String((query as Record<string, unknown>).number_one), 10),
    parseInt(String((query as Record<string, unknown>).number_two), 10),
    parseInt(String((query as Record<string, unknown>).number_three), 10),
    parseInt(String((query as Record<string, unknown>).number_four), 10),
    parseInt(String((query as Record<string, unknown>).number_five), 10),
    parseInt(String((query as Record<string, unknown>).number_six), 10),
    parseInt(String((query as Record<string, unknown>).number_seven), 10),
    parseInt(String((query as Record<string, unknown>).number_eight), 10),
    parseInt(String((query as Record<string, unknown>).number_nine), 10),
    parseInt(String((query as Record<string, unknown>).number_ten), 10)
  ];

  let played = _.compact(result);
  played = _.uniq(played);
  played = played.sort((a, b) => a - b);

  if (played.length < 5) return false;

  const cleaned: Record<string, unknown> = { ...query };
  delete (cleaned as Record<string, unknown>).number_one;
  delete (cleaned as Record<string, unknown>).number_two;
  delete (cleaned as Record<string, unknown>).number_three;
  delete (cleaned as Record<string, unknown>).number_four;
  delete (cleaned as Record<string, unknown>).number_five;
  delete (cleaned as Record<string, unknown>).number_six;
  delete (cleaned as Record<string, unknown>).number_seven;
  delete (cleaned as Record<string, unknown>).number_eight;
  delete (cleaned as Record<string, unknown>).number_nine;
  delete (cleaned as Record<string, unknown>).number_ten;

  (cleaned as { played_number: number[] }).played_number = played;
  return cleaned as CompactNumbersResult;
}
