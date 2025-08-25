## Keno API (Express 5 + TypeScript)

This service provides a simple Keno-like game with three core actions:
- Create a round
- Buy tickets for that round
- Run the drawing and see winners

The API is intentionally simple and uses query string parameters (not JSON bodies) for the game actions to preserve the original behavior.

### Run the server
- Install deps: `npm i`
- Optional: set Mongo URI (defaults to `mongodb://127.0.0.1:27017/keno_express_api`)
  - `export MONGODB_URI='mongodb://user:pass@host:port/dbname'`
- Dev: `npm run dev`
- Prod: `npm run build && npm start`

### Base URL
- Local dev default: `http://localhost:3000`

## Play the game using Postman

### 1) Prepare a Postman environment
- Create an environment with variables:
  - `baseUrl`: `http://localhost:3000`
  - `roundId`: leave empty; it will be filled after you create a round

### 2) Create a round
- Method: POST
- URL: `{{baseUrl}}/rounds`
- Params tab (Query Params):
  - `starts_at` = `2025-09-01` (format `YYYY-MM-DD`)
- Tests tab (optional): save the created `roundId`:
```javascript
pm.environment.set('roundId', pm.response.json().insertedId);
```
- Expected response (example):
```json
{
  "acknowledged": true,
  "insertedId": "66f123abcde4567890fedcba"
}
```

Notes
- The service validates that `starts_at` is a valid date and automatically sets a 15-day `ends_at`.

### 3) Buy a ticket
- Method: POST
- URL: `{{baseUrl}}/tickets`
- Params tab (Query Params):
  - `round_id` = `{{roundId}}` (use the variable saved above or paste the value from the create-round response)
  - `player_name` = `Alice`
  - Pick at least 5 distinct numbers from 1 to 80 using these keys: `number_one`, `number_two`, `number_three`, `number_four`, `number_five` (optionally up to `number_ten`)
    - Example: `number_one=3`, `number_two=8`, `number_three=15`, `number_four=22`, `number_five=30`
- Expected response (example):
```json
{
  "acknowledged": true,
  "insertedId": "66f456abcde4567890fedcb1"
}
```

Notes
- The API compacts, de-duplicates, and sorts the numbers you send into `played_number`.
- At least 5 valid numbers are required; otherwise you will get "input not valid".

### 4) Run the drawing (and see winners)
- Method: POST
- URL: `{{baseUrl}}/drawnings`
- Params tab (Query Params):
  - `round_id` = `{{roundId}}`
- Expected response (example):
```json
{
  "current_timestamp": "2025-09-01T10:00:00.000Z",
  "drawn": {
    "round_id": "66f123abcde4567890fedcba",
    "created_at": "2025-09-01T10:00:00.000Z",
    "drawn_number": [1,4,7,9,11,14,18,21,25,28,32,35,39,42,47,51,55,60,73,80]
  },
  "winnings": [
    {
      "_id": "66f456abcde4567890fedcb1",
      "round_id": "66f123abcde4567890fedcba",
      "player_name": "Alice",
      "played_number": [3,8,15,22,30],
      "created_at": "2025-09-01T09:55:00.000Z"
    }
  ]
}
```

Notes
- If no drawing exists for the round yet, the service creates one with 20 random numbers between 1 and 80.
- A ticket “wins” if it matches 5 or more numbers from the drawing (tickets with ≥5 matches appear in `winnings`).

### 5) Optional: browse current data
- List rounds: GET `{{baseUrl}}/rounds`
- List tickets: GET `{{baseUrl}}/tickets`

## Common pitfalls
- Use the Params tab in Postman (query string), not JSON body, for these actions.
- Ensure you are using the same `round_id` across ticket purchase and drawing.
- Pick distinct numbers in the 1–80 range; duplicates are removed automatically and fewer than 5 numbers is invalid.

## Files of interest
- Server: `src/server.ts`
- Routes: `src/routes/rounds.ts`, `src/routes/tickets.ts`, `src/routes/drawnings.ts`
- Helpers: `src/lib/helper.ts`, `src/lib/drawning_gateway.ts`