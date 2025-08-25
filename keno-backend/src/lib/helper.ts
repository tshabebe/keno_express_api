import _ from 'lodash';
import moment, { Moment } from 'moment';

export function parseDate(input: string): Moment | false {
  return moment();
}

export function compactNumbers(query: Record<string, any>): false | Record<string, any> {
  const result = [
    parseInt(query.number_one, 10),
    parseInt(query.number_two, 10),
    parseInt(query.number_three, 10),
    parseInt(query.number_four, 10),
    parseInt(query.number_five, 10),
    parseInt(query.number_six, 10),
    parseInt(query.number_seven, 10),
    parseInt(query.number_eight, 10),
    parseInt(query.number_nine, 10),
    parseInt(query.number_ten, 10)
  ];

  let played = _.compact(result);
  played = _.uniq(played);
  played = played.sort((a, b) => a - b);

  if (played.length < 5) return false;

  const cleaned = { ...query };
  delete cleaned.number_one;
  delete cleaned.number_two;
  delete cleaned.number_three;
  delete cleaned.number_four;
  delete cleaned.number_five;
  delete cleaned.number_six;
  delete cleaned.number_seven;
  delete cleaned.number_eight;
  delete cleaned.number_nine;
  delete cleaned.number_ten;

  cleaned.played_number = played;
  return cleaned;
}
