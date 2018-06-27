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
 *      parameters:
 *        - name: current
 *          description: Check the current round
 *          dataType: boolean
 *          paramType: query
 *        - name: period
 *          description: Search for a speficif date. e.g. 2018-06-26
 *          dataType: string
 *          format: date
 *          paramType: query
 */           
router.get('/rounds', function(req, res) {
  db(function(db){
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
 *          description: >
 *            Start date of next game, e.g {starts_at:'2018-06-26'}
 *          paramType: query
 *          required: true
 *          dataType: string
 */
router.post('/rounds', function(req, res) {
  new_round = {starts_at: req.query.starts_at }

  db(function(db){
    db.collection('rounds').save(new_round, function(err, result) {
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
 *         type: String
 *         format: date-time
 *         required: true
 *       ends_at: 
 *         type: String
 *         format: date-time
 *         required: true
 *       created_at: 
 *         type: String
 *         format: date-time
 *         required: true
 *       updated_at: 
 *         type: String
 *         format: date-time
 *         required: true
 */