var express = require('express');
var app = express();
var browserify = require('browserify');

app.get('/client.js', function(req, res) {
  var b = browserify();
  b.add('./client.js');
  b.bundle().pipe(res);
});

app.use(express.static(__dirname));

app.listen(3000);
