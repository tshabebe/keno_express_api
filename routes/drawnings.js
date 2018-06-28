var express = require('express')
  , bodyParser = require('body-parser')
  , _ = require('underscore')
  , moment = require('moment')
  , async = require('async')
  , drawning_gateway = require('../lib/drawning_gateway');

var router = express.Router()
var MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID;

router.use(bodyParser.urlencoded({ extended: true }));

function db(callback){
  MongoClient.connect('mongodb://admin:Adminadmin123@ds217671.mlab.com:17671/keno_express_api', function(err, client) {
    var db = client.db('keno_express_api')
    callback(db);
    client.close();
  })
}

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
 *   -  httpMethod: GET
 *      summary: List drawnings
 *      notes: Returns a list of drawnings
 *      responseClass: Drawn
 *      nickname: drawnings
 *      consumes: 
 *        - text/html
 */           
router.get('/drawnings', function(req, res) {
  db(function(db){
    db.collection('drawnings').find().toArray(function(err, results) {
      res.json(results);
    });
  });
})

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
      MongoClient.connect('mongodb://admin:Adminadmin123@ds217671.mlab.com:17671/keno_express_api', function(err, client) {
        var db = client.db('keno_express_api');

        try {
          var params_id = ObjectId(req.query.round_id);
        }
        catch(e) {
          var params_id = req.query.round_id;
        }   

        db.collection('rounds').findOne({'_id': params_id}, function(err, round) {
          if (err) res.json(err)
          callback(null, round);
        });
        client.close();
      });
    },
    drawn: function(callback) {
      MongoClient.connect('mongodb://admin:Adminadmin123@ds217671.mlab.com:17671/keno_express_api', function(err, client) {
        var db = client.db('keno_express_api');
        db.collection('drawnings').findOne({'round_id': req.query.round_id}, function(err, drawn) {
          if (err) res.json(err)
          callback(null, drawn);
        });
        client.close();
      });
    },
  }, function(err, results) {
    if (err) return res.json(err);

    MongoClient.connect('mongodb://admin:Adminadmin123@ds217671.mlab.com:17671/keno_express_api', function(err, client) {
      var db = client.db('keno_express_api');

      if (!results.round)
        res.json({error: 'round not found'});
      if (results.drawn){
        res.json(results.drawn);
      }else{
        drawn = _.extend(req.query, {created_at: moment().toDate()});
        drawn.numbers = drawning_gateway.load();
        db.collection('drawnings').save(drawn, function(err, result) {
          if (err) res.json(err)
          res.json(results);
        });
      } // end if

      client.close();
    });
  });
})

module.exports = router;

/**
 * @swagger
 * models:
 *   Drawn:
 *     id: Drawn
 *     properties:
 *       numbers: 
 *         type: Array
 *         format: date-time
 *         required: true
 *       created_at: 
 *         type: DateTime
 *         format: date-time
 *         required: true
 */