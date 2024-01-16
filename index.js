const express = require('express');
const app = express();
app.get('/data', (req, res) => {
    let data = 'Hello World!23';
    res.send(data);
})
app.listen(3000, (req, res) => {
    console.log("Server is running on port 3000");
})






















