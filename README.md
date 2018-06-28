# Keno Express API

Requirements: Create an Express.js API that handles a request to play a simple keno game.


The server receives a request to create a new keno round.

The request includes the wager, and 5 to 10 numbers selected by the player.

The server generates the 20 number draw and calculates the winnings.

The response includes a unique draw ID, the user’s input, the numbers drawn, winnings, and current timestamp.


## About Keno

- [howtoplay](https://www.kylottery.com/apps/draw_games/keno/howtoplay.html)
- [Details](https://www.kylottery.com/export/kylmod/galleries/documents/KYLottery_terms/Keno-Rules-9-22-17-no-signature-page.pdf)

## How to use it

1 - Download and run

    $ git clone https://github.com/altherlex/keno_express_api.git
    $ cd keno_express_api
    $ npm install
    $ npm run dev

2 - Access http://localhost:3000/swagger/

3 - [ROUND]Click 'Round' and make a POST resquest informing the start date of the round

4 - [ROUND]Check your new round on GET Round. Grab your '_id' number.

5 - [TICKET] Create your bet on POST Ticket.

6 - [Drawn] Generate the 20 number draw


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

## TODO

- Use mongoose
- Validate data for creating a round
- Validate existed rounds for creating a round
- <del>Set create_at and update_at</del>
- <del>Set ends_at on round</del>
- Filter rounds/index params
- Filter tickets/index params
- <del>Generates one drawn by round</del>
- Check db operation - render db error
- Send POST request parameters as body
- <del>DRY<del>
- Use cofeescript
- <del>[Tickets] check format of data: must be a valid number<del>
- 'use strict'
- Dont allow bet in old drawns
