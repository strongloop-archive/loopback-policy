module.exports = Policy;

var assert = require('assert');
var async = require('async');
var Expression = require('./expression');
var facts = require('./facts');
var functions = require('./functions');

function Policy(raw) {
  this.raw = raw;
  this.parseConditions();
  this.actions = raw.actions;
}

Policy.prototype.parseConditions = function() {
  var conditions = this.raw.conditions;
  var parsedConditions = this.conditions = {};
  var functions = this.functions = {};
  Object.keys(conditions).forEach(function(condition) {
    if(condition.indexOf('()') === condition.length - 2) {
      functions[condition] = conditions[condition];
      assert(Array.isArray(conditions[condition]), condition + 
        ' must be defined with an array of [args, expressions]');
    } else {
      parsedConditions[condition] = conditions[condition];
    }
  });
}

Policy.prototype.evaluateConditions = function(ctx, cb) {
  var policy = this;
  var conditions = this.conditions;
  var factNames = Object.keys(conditions);
  var expressions = [];
  var result = {};
  var asyncFacts = [];

  for (var f = factNames.length - 1; f >= 0; f--) {
    var factName = factNames[f];
    var fact = facts.get(factName);
    if(fact.getAsync) {
      asyncFacts.push(fact);
      continue;
    }
    if(policy.evaluateFact(fact, fact.get(ctx), result) === false) {
      return cb(null, false, result);
    }
  }

  // evaluate async expressions
  // async.each(asyncFacts, function(fact, callback) {
  //   fact.getAsync(ctx, function(err, value) {
  //     if(err) return callback(err);
  //     if(policy.evaluateFact(fact, value, result) === false) {
  //       cb(null, false);
  //     } else {
  //       callback();
  //     }
  //   });
  // }, function(err) {
  //   if(err) return callback(err);
  //   cb(null, result);
  // });

  // evaluate functions
  var funcs = this.functions;
  var functionNames = Object.keys(this.functions);
  var functionName;
  var functionArgs;

  async.eachSeries(functionNames, function(functionName, callback) {
    functionArgs = funcs[functionName][0];
    resultOperations = funcs[functionName][1];
    var type = functions.getReturnType(functionName);
    functions.invoke(functionName, functionArgs, ctx, function(err, value) {
      if(err) return callback(err);
      if(!evaluateOperations(functionName, resultOperations, value, type, result)) {
        return cb(null, false, result);
      }
      callback();
    });
  }, function(err) {
    if(err) return cb(err);
    cb(null, result);
  });
}

Policy.prototype.evaluateFact = function (fact, factValue, result) {
  var factName = fact.name;
  var type = facts.getTypeFor(factName);
  var conditions = this.conditions;
  var operations = conditions[factName];

  return evaluateOperations(factName, operations, factValue, type, result);;
}

function evaluateOperations(conditionName, operations, value, type, result) {
  if(typeof operations !== 'object') {
    operations = {equals: operations};
  }
  var operators = Object.keys(operations);
  var operator;

  for (var i = operators.length - 1; i >= 0; i--) {
    operator = operators[i];
    if(!(operator in type.operators)) {
      console.warn(type.name + ' does not support the '
        + operator + ' operator');
      return false;
    }
    expression = new Expression(
      operator, [value, operations[operator]], type
    );
    result[conditionName] = result[conditionName] || {};
    result[conditionName][operator] = expression.evaluate();
    if(result[conditionName][operator] === false) {
      return false;
    }
  };

  return result;
}

Policy.prototype.enforce = function(ctx, cb) {
  var self = this;
  this.evaluateConditions(ctx, function(err, result) {
    if(err) return cb(err);
    if(result) {
      self.enact(ctx, result, cb);
    } else {
      cb();
    }
  });
}

Policy.prototype.enact = function(ctx, result, cb) {
  console.log('do actions!');
  cb();
}
