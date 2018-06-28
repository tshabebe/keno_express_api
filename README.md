# Keno Express API

Requirements: Create an Express.js API that handles a request to play a simple keno game.


The server receives a request to create a new keno round.

The request includes the wager, and 5 to 10 numbers selected by the player.

The server generates the 20 number draw and calculates the winnings.

The response includes a unique draw ID, the user’s input, the numbers drawn, winnings, and current timestamp.


## About Keno

- [howtoplay](https://www.kylottery.com/apps/draw_games/keno/howtoplay.html)
- [Details](https://www.kylottery.com/export/kylmod/galleries/documents/KYLottery_terms/Keno-Rules-9-22-17-no-signature-page.pdf)

## Tools

- [Express](https://github.com/visionmedia/express)
- [Swagger](https://developers.helloreverb.com/swagger/) 
- [mLab](https://mlab.com)
- npm i nodemon -s
- npm i mongodb -s
- npm i underscore -s
- npm i async -s
- npm i js-yaml -s
- npm i coffee-script -s
- npm i doctrine -s
- npm i moment -s
- npm i jasmine --save-dev

## Run

    $ git clone https://github.com/altherlex/keno_express_api.git
    $ cd keno_express_api
    $ npm install
    $ npm run dev

## TODO

- Use mongoose
- Validate data for create a round
- Validate existed rounds for create a round
- ---Set create_at and update_at---
- ---Set ends_at on round---
- Filter rounds/index params
- Filter tickets/index params
- Generates one drawn by round
- Check db operation - render db error
- Send POST request parameters as body

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

