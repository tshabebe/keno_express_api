var _ = require('underscore')
  , moment = require('moment');

module.exports.parse_date = function(string){
  if (!moment(string).isValid()) return false
  return moment(string+' 00:00:00.000') //.format('YYYY-MM-DD')
}

// TODO: create a Helper for it
module.exports.compact_numbers = function(query){
  var result = [
    parseInt(query.number_one),
    parseInt(query.number_two),
    parseInt(query.number_three),
    parseInt(query.number_four),
    parseInt(query.number_five),
    parseInt(query.number_six),
    parseInt(query.number_seven),
    parseInt(query.number_eight),
    parseInt(query.number_nine),
    parseInt(query.number_ten)
  ]

  query.played_number = _.compact(result);
  query.played_number = _.uniq(query.played_number);
  query.played_number = query.played_number.sort(function(a, b){return a-b});

  if (query.played_number.length<5) return false

  delete query.number_one;
  delete query.number_two;
  delete query.number_three;
  delete query.number_four;
  delete query.number_five;
  delete query.number_six;
  delete query.number_seven;
  delete query.number_eight;
  delete query.number_nine;
  delete query.number_ten;

  return query
}
