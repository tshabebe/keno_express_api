var _ = require('underscore')

module.exports.load = function() {
  var drawning = []
  while (drawning.length!==20) {
    drawning.push( _.random(1, 80) );
    drawning = _.uniq(drawning);
  }
  return drawning.sort(function(a, b){return a-b});
}
