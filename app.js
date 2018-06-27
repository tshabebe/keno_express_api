var createError = require('http-errors')
  , express = require('express')
  , path = require('path')
  , cookieParser = require('cookie-parser')
  , logger = require('morgan')

  , indexRouter = require('./routes/index')
  , usersRouter = require('./routes/users')

  , swagger = require('./')
  , app = express();

var db
const MongoClient = require('mongodb').MongoClient

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

app.use(swagger.init(app, {
  apiVersion: '1.0',
  swaggerVersion: '1.0',
  basePath: 'http://localhost:3000',
  swaggerURL: '/swagger',
  swaggerJSON: '/api-docs.json',
  swaggerUI: './app/public/swagger/',
  apis: ['routes/rounds.js']
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

MongoClient.connect('mongodb://admin:Adminadmin123@ds217671.mlab.com:17671/keno_express_api', function(err, client) {
  if (err) return console.log(err)
  db = client.db('keno_express_api')
  app.listen(3000, function(){
    console.log('listening on 3000')
  })
})

module.exports = app;
