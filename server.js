const express = require('express');
const path = require('path');
const app = express();


app.get('/', (req, res) => {
    res.sendFile(path.resolve('./index.js'));
})

app.listen(process.env.PORT || 3000);