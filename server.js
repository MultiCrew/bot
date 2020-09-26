const express = require('express');
const events = require('events');
const app = express();
const port = 3000;
const eventEmitter = new events.EventEmitter();

app.get('/', (req, res) => {
	eventEmitter.emit(req);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});