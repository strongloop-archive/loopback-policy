"use strict";
var express = require('express');
var nools = require('nools');
var RateLimiter = require('./token-bucket');
var app = express();

// First define object types for facts. There will be LoopBack models.

function modelingFacts() {

// Mock up the Context model
  var Context = function(req, res) {
    this.req = req;
    this.res = res;
    this.limits = {};
    this.proceed = true;
  };

// Mock up the Application model
  var Application = function(id, name) {
    this.id = id;
    this.name = name;
  };

// Mock up the User model
  var User = function(id, username, email) {
    this.id = id;
    this.username = username;
    this.email = email;
  };

  return {
    Context: Context,
    Application: Application,
    User: User
  };
}

function Rule(name, patterns, action, options) {
  this.name = name;
  this.patterns = patterns;
  this.options = options || {};
  this.action = action;
}

// Define rules
function defineFlow(name, rules, callback) {
  var flow = nools.flow(name, function(f) {
    for (var i = 0, n = rules.length; i < n; i++) {
      var rule = rules[i];
      this.rule(rule.name, rule.options, rule.patterns, rule.action);
    }
  });
  return flow;
}

// A global counters
var rateLimiter = new RateLimiter({interval: 1000, limit: 10});

var models = modelingFacts();

var ruleForAppAndUser = new Rule("Limit requests based on application and user",
  [
    [models.Application, 'a'],
    [models.User, 'u', "u.username == 'john'"]
  ],
  function(facts) {
    console.log('Action fired - Limit by app/user: ', facts);
    var key = facts.a.id + '-' + facts.u.id;
    var ctx = this.getFacts(models.Context)[0];
    ctx.proceed = rateLimiter.enforce(ctx, key);
    this.modify(ctx);
  });

var ruleForIp = new Rule("Limit requests based on remote ip",
  [
    [models.Context, 'c'],
    [String, 'ip', "ip == '127.0.0.1'", "from c.req.ip"]
  ], function(facts) {
    console.log('Action fired - Limit by ip: ', facts);
    var key = 'IP-' + facts.ip;
    var ctx = this.getFacts(models.Context)[0];
    ctx.proceed = rateLimiter.enforce(ctx, key);
  });

var flow = defineFlow("Rate Limiting", [ruleForAppAndUser, ruleForIp]);

function executeFlow(ctx, next) {
  // Create a session with initial facts
  var session = flow.getSession(ctx);

  // Add more facts
  session.assert(new models.Application(ctx.application.id,
    ctx.application.name));
  session.assert(new models.User(ctx.user.id, ctx.user.username,
    ctx.user.email));

  // Match
  session.match().then(function() {
    console.log('Match is done');
    var ctx = session.getFacts(models.Context)[0];
    if (ctx.limits) {
      console.log(ctx.limits);
    }
    if (ctx.proceed) {
      next();
    }
    session.dispose();
  }, function(err) {
    if (err) {
      console.error(err);
      next(err);
    }
  });
  return session;
}

// Mock up the context setup
app.use(function contextInit(req, res, next) {
  req.ctx = new models.Context(req, res);
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

// Intercept the requests and enforce rules
app.use(function(req, res, next) {
  executeFlow(req.ctx, next);
});

app.use(function(req, res, next) {
  console.log('API invoked: ', req.url);
  res.send(req.ctx.limits ||
  {msg: 'API invoked without rate limiting: ' + req.url});
});

app.listen(3000, function() {
  console.log('Server is ready');
});






