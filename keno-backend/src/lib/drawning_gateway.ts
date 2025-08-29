import _ from 'lodash';

export function load(): number[] {
  let drawning: number[] = [];
  while (drawning.length !== 20) {
    drawning.push(_.random(1, 80));
    drawning = _.uniq(drawning);
  }
  // Return in the random order of draw; do not sort
  return drawning;
}
