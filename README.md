# Keno Express API

## About Keno

- [howtoplay](https://www.kylottery.com/apps/draw_games/keno/howtoplay.html)
- [Details](https://www.kylottery.com/export/kylmod/galleries/documents/KYLottery_terms/Keno-Rules-9-22-17-no-signature-page.pdf)

## Tools

- [Express](https://github.com/visionmedia/express)
- [Swagger](https://developers.helloreverb.com/swagger/) 
- npm install nodemon -s
- npm install mongodb -s
- npm install underscore -s
- npm install async -s
- npm install js-yaml -s
- npm install coffee-script -s
- npm install doctrine -s


## Installation

    $ npm install -g swagger-express

## Quick Start

Configure {swagger-express} as express middleware.


`apiVersion`      -> Your api version.

`swaggerVersion`  -> Swagger version.

`swaggerUI`       -> Where is your swagger-ui?

`swaggerURL`      -> Path to use for swagger ui web interface.

`swaggerJSON`     -> Path to use for swagger ui JSON.

`basePath`        -> The basePath for swagger.js

`info`            -> [Metadata][info] about the API

`apis`            -> Define your api array.

`middleware`      -> Function before response.


## Examples

Clone the {swagger-express} repo, then install the dev dependencies:

    $ git clone git://github.com/fliptoo/swagger-express.git --depth 1
    $ cd swagger-express
    $ npm install

and run the example:

    $ cd example
    $ node app.js
    
