module.exports = Engine;

var async = require('async');
var assert = require('assert');
var Func = require('./function');
var Type = require('./type');
var Policy = require('./policy');
var Fact = require('./fact');

function Engine() {
  this.policies = [];
  this.functions = {};
  this.facts = {};
  this.types = {};
  this.installExtensions();
}

Engine.prototype.definePolicy = function(policyDef) {
  var policy = new Policy(this, policyDef);
  this.policies.push(policy);
  return policy;
}

Engine.prototype.defineFunction = function(name, fn, options) {
  var func = new Func(name, fn, options);
  this.functions[name] = func;
  return func;
}

Engine.prototype.defineType = function(name) {
  var type = new Type(name);
  this.types[name] = type;
  return type;
}

Engine.prototype.getType = function(name) {
  return this.types[name];
}

Engine.prototype.getFact = function(name) {
  return this.types[name];
}

Engine.prototype.getFunction = function(name) {
  return this.functions[name];
}

Engine.prototype.defineFact = function(name, options) {
  var fact = new Fact(name, options);
  this.types[name] = fact;
  return fact;
}

Engine.prototype.evaluateFact = function(ctx, factName, operator, condition) {
  var fact = this.facts[factName];
  var type = fact.getType();
  var factValue = fact.get(ctx);
  var operands = [factValue, condition];
  var expression = new Expression(operator, operands, type);
  return expression.evaluate();
}

Engine.prototype.enforcePolicies = function(ctx, done) {
  async.each(this.policies, function(policy, cb) {
    policy.enforce(ctx, cb);
  }, done);
}

Engine.prototype.getTypeForFact = function(factName) {
  return this.types[this.facts[factName].type];
}
