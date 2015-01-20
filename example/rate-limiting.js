"use strict";
var express = require('express');
var nools = require('nools');

var app = express();

var Context = function(req, res) {
  this.req = req;
  this.res = res;
};

// Define object types. We'll use LoopBack models!
var Application = function(id, name) {
  this.id = id;
  this.name = name;
};

var User = function(id, username, email) {
  this.id = id;
  this.username = username;
  this.email = email;
};

var Status = function(count, limit) {
  this.count = count;
  this.limit = limit;
};

var counters = {};

var flow = nools.flow("Rate Limiting", function(f) {
  this.rule("Limit reqs for application and user",
    [
      [Application, 'a'],
      [User, 'u']
    ], function(facts) {
      console.log('Limit: ', facts);
      var key = facts.a.id + '-' + facts.u.id;
      var s = this.getFacts(Status)[0];
      s.count = counters[key];
      this.modify(s);
      if (counters[key] > 10) {
        console.log('Exceeding limit');
      }
    });

  this.rule("Count reqs for application and user",
    [
      [Application, 'a'],
      [User, 'u', "u.username == 'john'"]
    ], function(facts) {
      console.log('Count: ', facts);
      if (counters[facts.a.id + '-' + facts.u.id] === undefined) {
        counters[facts.a.id + '-' + facts.u.id] = 1;
      } else {
        counters[facts.a.id + '-' + facts.u.id]++;
      }
    });

});

function testFlow(ctx) {
  var session = flow.getSession(new Status(0, 10));

  session.assert(new Application(ctx.application.id,
    ctx.application.name));
  session.assert(new User(ctx.user.id, ctx.user.username,
    ctx.user.email));
  session.match().then(function() {
    var facts = session.getFacts();
    console.log('Facts:', facts);
    console.log('Counters:', counters);
    ctx.res.send({facts: facts, counters: counters});
    session.dispose();
  }, function(err) {
    if (err) {
      return console.error(err);
    }
  });
  return session;
}

app.use(function contextInit(req, res, next) {
  req.ctx = new Context(req, res);
  req.ctx.application = {
    id: 1,
    name: 'Test App'
  };
  req.ctx.user = {
    id: 1,
    username: Math.random() >= 0.3 ? 'john' : 'mary',
    email: 'john@gmail.com'
  };
  next();
});

app.use(function(req, res, next) {
  testFlow(req.ctx);
});

app.listen(3000, function() {
  console.log('Server is ready');
});






