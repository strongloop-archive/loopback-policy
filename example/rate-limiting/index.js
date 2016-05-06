// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-policy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

"use strict";
var express = require('express');
var RateLimiter = require('./memory');
var app = express();

var pf = require('../../lib/index');
var Policy = pf.Policy;
var Rule = pf.Rule;

// First define object types for facts. There will be LoopBack models.

function modelingFacts() {

// Mock up the Context model
  var Context = function(req, res) {
    this.req = req;
    this.res = res;
    this.limits = {};
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

// A global counters
var rateLimiter = new RateLimiter({interval: 1000, limit: 10});

var models = modelingFacts();

function getHandler(session, key) {
  var ctx = session.getFacts(models.Context)[0];
  return function(err, result) {
    if (ctx.proceed === false) {
      return;
    }
    var res = ctx.res;
    ctx.limits = ctx.limits || {};
    ctx.limits[key] = result;
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.reset);
    ctx.proceed = result.isAllowed;
    if (!result.isAllowed) {
      res.status(429).json({error: 'Limit exceeded'});
      session.halt();
    }
  };
}

var ruleForAppAndUser = new Rule("Limit requests based on application and user",
  [
    [models.Context, 'c', function(facts) {
      var ctx = facts.c;
      return ctx.proceed === undefined;
    }],
    [models.Application, 'a'],
    [models.User, 'u', "u.username == 'john'"]
  ],
  function(facts) {
    console.log('Action fired - Limit by app/user: ', facts.a, facts.u);
    var key = 'App-' + facts.a.id + '-User-' + facts.u.id;
    rateLimiter.enforce(key, getHandler(this, key));
  });

var ruleForIp = new Rule("Limit requests based on remote ip",
  [
    [models.Context, 'c', function(facts) {
      var ctx = facts.c;
      return ctx.proceed === undefined;
    }],
    [String, 'ip', "ip == '127.0.0.1' || ip == '::1'", "from c.req.ip"],
  ], function(facts) {
    console.log('Action fired - Limit by ip: ', facts.ip);
    var key = 'IP-' + facts.ip;
    rateLimiter.enforce(key, getHandler(this, key));
  });

var policy = new Policy("Rate Limiting", [ruleForAppAndUser, ruleForIp]);

function executeFlow(ctx, next) {
  var facts = [
    new models.Application(ctx.application.id, ctx.application.name),
    new models.User(ctx.user.id, ctx.user.username, ctx.user.email)
  ];

  var session = policy.execute(ctx, facts, function(err) {
    if (err) {
      console.error(err);
      return next(err);
    }
    console.log('Match is done');
    // session.print();
    var ctx = session.getFacts(models.Context)[0];
    if (ctx.limits) {
      console.log(ctx.limits);
    }
    if (ctx.proceed) {
      next();
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






