const fs = require('fs');
const http = require('http');
const express = require('express')
const app = express()



var data = fs.readFileSync(`${__dirname}/summary.json`)
var objdata = JSON.parse(data);
app.get('/', (req, res) => {
    res.send(objdata)
})

app.listen(process.env.PORT || 3000, () => { console.log("running...") })