var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var db
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

function db(callback){
  MongoClient.connect('mongodb://admin:Adminadmin123@ds217671.mlab.com:17671/keno_express_api', function(err, client) {
    db = client.db('keno_express_api')
    callback(db);
  })
}

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
 *      responseClass: Round
 *      nickname: tickets
 *      consumes: 
 *        - text/html
 *      parameters:
 *        - name: player_name
 *          description: Search for player name
 *          dataType: string
 *          paramType: query
 *        - name: created_at
 *          description: Search for a speficif date. e.g. 2018-06-26
 *          dataType: string
 *          format: date
 *          paramType: query
 */           
router.get('/tickets', function(req, res) {
  db(function(db){
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
  new_round = {starts_at: req.query.starts_at }

  db(function(db){
    db.collection('tickets').save(new_round, function(err, result) {
      if (err) return console.log(err)
      res.json(result);
    });
  });
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
 *         type: String
 *         format: date-time
 *         required: true
 *       updated_at: 
 *         type: String
 *         format: date-time
 *         required: true
 */