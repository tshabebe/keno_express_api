var MongoClient = require('mongodb').MongoClient

module.exports.conn = function(callback) {
  MongoClient.connect('mongodb://'+process.env.DB+'@ds217671.mlab.com:17671/keno_express_api', function(err, client) {
    var db = client.db('keno_express_api')
    callback(db);
    client.close();
  })
}
