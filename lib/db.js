var MongoClient = require('mongodb').MongoClient

var db

MongoClient.connect('mongodb://admin:Adminadmin123@ds217671.mlab.com:17671/keno_express_api', function(err, client) {
  db = client.db('keno_express_api')
})


// var state = {
//   db: null
// }

// exports.connect = function(url, done) {
//   if (state.db) return done()

//   MongoClient.connect(url, function(err, db) {
//     if (err) return done(err)
//     state.db = db
//     done()
//   })
// }

// exports.get = function() {
//   return state.db
// }

// exports.close = function(done) {
//   if (state.db) {
//     state.db.close(function(err, result) {
//       state.db = null
//       state.mode = null
//       done(err)
//     })
//   }
// }