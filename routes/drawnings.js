var express = require('express')
  , bodyParser = require('body-parser')
  , _ = require('underscore')
  , moment = require('moment')
  , async = require('async')
  , db = require('../lib/db')
  , drawning_gateway = require('../lib/drawning_gateway');

var router = express.Router();
var ObjectId = require('mongodb').ObjectID;

/**
 * @swagger
 * resourcePath: /drawnings
 * description: All about API
 *
 */

/**
 * @swagger
 * path: /drawnings
 * operations:
 *   -  httpMethod: POST
 *      summary: Load or search for the current drawning
 *      notes: Return the current drawning
 *      responseClass: Drawn
 *      nickname: drawnings
 *      consumes: 
 *        - text/html
 *      parameters:
 *        - name: round_id
 *          description: Round id
 *          paramType: query
 *          required: true
 *          dataType: string
 */           
router.post('/drawnings', function(req, res) {

  async.parallel({
    round: function(callback) {
      db.conn(function(db){
        try {
          var params_id = ObjectId(req.query.round_id);
        }
        catch(e) {
          var params_id = req.query.round_id;
        }   

        db.collection('rounds').findOne({'_id': params_id}, function(err, round) {
          callback(err, round);
        });
      });
    },
    drawn: function(callback) {
      db.conn(function(db){
        db.collection('drawnings').findOne({'round_id': req.query.round_id}, function(err, drawn) {
          callback(err, drawn);
        });
      });
    }
  }, function(err, results) {

    async.parallel({
      loaded_drawn: function(callback){
        db.conn(function(db){
          if (!results.round)
            callback({error: 'round not found'}, null);
          if (results.drawn){
            callback(err, results.drawn);
          }else{
            drawn = _.extend(req.query, {created_at: moment().toDate()});
            drawn.drawn_number = drawning_gateway.load();
            db.collection('drawnings').save(drawn, function(err, result) {
              // TODO: check success
              callback(err, drawn);
            });
          } // end if
        });
      } // end load_drawn
    }, function(err, results) {
      if (err) return res.json(err);

      db.conn(function(db){
        // DOC: Calculates the winnings
        db.collection('tickets').find({'round_id': req.query.round_id}).toArray(function(err, tickets) {
          if (err) return res.json(err);

          var winnings = _.filter(tickets, function(ticket){ 
              match = _.intersection(results.loaded_drawn.drawn_number, ticket.played_number);
              return match.length>=5
            });

          var final = {
            current_timestamp: moment().toDate(),
            drawn: results.loaded_drawn,
            winnings: winnings
          }
          res.json(final);
        });
      });

    }); //async.parallel

  }); //async.parallel first
})

module.exports = router;

/**
 * @swagger
 * models:
 *   Drawn:
 *     id: Drawn
 *     properties:
 *       drawn_number: 
 *         type: Array
 *         format: date-time
 *         required: true
 *       round_id: 
 *         type: String
 *         format: date-time
 *         required: true
 *       created_at: 
 *         type: DateTime
 *         format: date-time
 *         required: true
 */