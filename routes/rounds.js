var express = require('express')
  , bodyParser = require('body-parser')
  , _ = require('underscore')
  , db = require('../lib/db')
  , helper = require('../lib/helper')
  , moment = require('moment');
var router = express.Router();

/**
 * @swagger
 * resourcePath: /rounds
 * description: All about API
 *
 */

/**
 * @swagger
 * path: /rounds
 * operations:
 *   -  httpMethod: GET
 *      summary: List rounds
 *      notes: Returns a list of rounds
 *      responseClass: Round
 *      nickname: rounds
 *      consumes: 
 *        - text/html
 */           
router.get('/rounds', function(req, res) {
  db.conn(function(db){
    db.collection('rounds').find().toArray(function(err, results) {
      res.json(results);
    });
  });
})

/**
 * @swagger
 * path: /rounds
 * operations:
 *   -  httpMethod: POST
 *      summary: Create a new round
 *      notes: Returns the new round created
 *      responseClass: Round
 *      nickname: rounds
 *      consumes: 
 *        - text/html
 *      parameters:
 *        - name: starts_at
 *          description: Game start. e.g 2018-06-26
 *          paramType: query
 *          required: true
 *          dataType: string
 */
router.post('/rounds', function(req, res) {
  round = _.extend(req.query, {created_at: moment().toDate()});
  if (! moment(round.starts_at).isValid())
    return res.json({error: 'Invalid date'});

  round.starts_at = helper.parse_date(round.starts_at);
  round.ends_at = round.starts_at.clone();
  round.ends_at.add(15, 'days');

  round.starts_at = round.starts_at.toDate();
  round.ends_at = round.ends_at.toDate()

  db.conn(function(db) {
    db.collection('rounds').save(round, function(err, result) {
      if (err) return console.log(err)
      res.json(result);
    });
  });
})

// DELETE
router.delete('/rounds/:id', function(req, res) {
  res.json('TODO DELETE');
})

module.exports = router;

/**
 * @swagger
 * models:
 *   Round:
 *     id: Round
 *     properties:
 *       starts_at: 
 *         type: DateTime
 *         format: date-time
 *         required: true
 *       ends_at: 
 *         type: DateTime
 *         format: date-time
 *         required: true
 *       created_at: 
 *         type: DateTime
 *         format: date-time
 *         required: true
 */