var express = require('express')
  , bodyParser = require('body-parser')
  , _ = require('underscore')
  , db = require('../lib/db')
  , helper = require('../lib/helper')
  , moment = require('moment');
var router = express.Router();

/**
 * @swagger
 * resourcePath: /tickets
 * description: All about API
 *
 */

/**
 * @swagger
 * path: /tickets
 * operations:
 *   -  httpMethod: GET
 *      summary: List tickets
 *      notes: Returns a list of tickets
 *      nickname: tickets
 *      consumes: 
 *        - text/html
 */           
router.get('/tickets', function(req, res) {
  db.conn(function(db){
    db.collection('tickets').find().toArray(function(err, results) {
      res.json(results);
    });
  });
})

/**
 * @swagger
 * path: /tickets
 * operations:
 *   -  httpMethod: POST
 *      summary: Create a new round
 *      notes: Returns the new round created
 *      responseClass: Round
 *      nickname: tickets
 *      consumes: 
 *        - text/html
 *      parameters:
 *        - name: round_id
 *          description: Round id
 *          paramType: query
 *          required: true
 *          dataType: string
 *        - name: player_name
 *          description: Player name
 *          paramType: query
 *          required: true
 *          dataType: string
 *        - name: number_one
 *          description: number_one
 *          paramType: query
 *          required: true
 *          dataType: string
 *        - name: number_two
 *          description: number_two
 *          paramType: query
 *          required: true
 *          dataType: string
 *        - name: number_three
 *          description: number_three
 *          paramType: query
 *          required: true
 *          dataType: string
 *        - name: number_four
 *          description: number_four
 *          paramType: query
 *          required: true
 *          dataType: string
 *        - name: number_five
 *          description: number_five
 *          paramType: query
 *          required: true
 *          dataType: string
 *        - name: number_six
 *          description: number_six
 *          paramType: query
 *          dataType: string
 *        - name: number_seven
 *          description: number_seven
 *          paramType: query
 *          dataType: string
 *        - name: number_eight
 *          description: number_eight
 *          paramType: query
 *          dataType: string
 *        - name: number_nine
 *          description: number_nine
 *          paramType: query
 *          dataType: string
 *        - name: number_ten
 *          description: number_ten
 *          paramType: query
 *          dataType: string
 */
router.post('/tickets', function(req, res) {
  ticket = _.extend(req.query, {created_at: moment().toDate()});
  
  req.query = helper.compact_numbers(req.query);
  if (req.query){
    db.conn(function(db){
      db.collection('tickets').save(ticket, function(err, result) {
        if (err) return console.log(err)
        res.json(result);
      });
    });
  }else{
    res.json('input not valid');
  }

})


module.exports = router;

/**
 * @swagger
 * models:
 *   Round:
 *     id: Round
 *     properties:
 *       player_name: 
 *         type: String
 *         format: date-time
 *         required: true
 *       number_one: 
 *         type: number
 *         required: true
 *       number_two: 
 *         type: number
 *         required: true
 *       number_three: 
 *         type: number
 *         required: true
 *       number_four: 
 *         type: number
 *         required: true
 *       number_five: 
 *         type: number
 *         required: true
 *       number_six: 
 *         type: number
 *       number_seven: 
 *         type: number
 *       number_eight: 
 *         type: number
 *       number_nine: 
 *         type: number
 *       number_ten: 
 *         type: number
 *       created_at: 
 *         type: DateTime
 *         format: date-time
 */