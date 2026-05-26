const express = require('express');
const app = express();
const http = require('http').createServer(app);

app.use(express.static('public'));
app.use('/assets', express.static('assets'));

http.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});