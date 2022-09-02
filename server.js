const express = require('express');
const path = require('path');
const app = express();


app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve('./index.html'));
})

app.listen(process.env.PORT || 3000);