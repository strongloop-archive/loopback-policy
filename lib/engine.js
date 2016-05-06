// Copyright IBM Corp. 2014,2015. All Rights Reserved.
// Node module: loopback-policy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

"use strict";
var nools = require('nools');
var debug = require('debug')('loopback:policy:engine');

// Define rules
function addRule(flow, rule) {
  debug('Adding rule: %j', rule);
  flow.rule(rule.name, rule.options, rule.constraints, rule.action);
}

function defineFlow(name, rules) {
  var flow = nools.flow(name, function(f) {
    for (var i = 0, n = rules.length; i < n; i++) {
      addRule(f, rules[i]);
    }
  });
  return flow;
}

function compileFlow(src, options) {
  return nools.compile(src, options);
}

function executeFlow(flow, ctx, facts, callback) {
  // Create a session with initial facts
  var session = flow.getSession(ctx);
  if (facts) {
    for (var i = 0, n = facts.length; i < n; i++) {
      session.assert(facts[i]);
    }
  }

  // Match
  session.match().then(function() {
    var facts = session.getFacts();
    callback(null, facts);
    session.dispose();
  }, function(err) {
    if (err) {
      debug('Error: %j', err);
      callback(err);
    }
  });
  return session;
}

module.exports = {
  compileFlow: compileFlow,
  defineFlow: defineFlow,
  addRule: addRule,
  executeFlow: executeFlow
};




