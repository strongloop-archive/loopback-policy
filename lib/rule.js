var assert = require('assert');
module.exports = Rule;

function NoAction() {
}

function Rule(rule, constraints, action, options) {
  if (!(this instanceof Rule)) {
    return new Rule(rule, constraints, action, options);
  }
  if (typeof rule === 'string') {
    rule = {
      name: rule,
      constraints: constraints,
      options: options,
      action: action
    };
  }
  assert(typeof rule === 'object' && rule !== null,
    'The rule must be an object');
  this.name = rule.name;
  this.constraints = rule.constraints;
  this.options = rule.options || {};
  this.action = rule.action || NoAction;
  assert(typeof this.name === 'string', 'The name must be a string');
  assert(typeof this.action === 'function', 'The action must be a function');
}

Rule.prototype.toJSON = function() {
  return {
    name: this.name,
    constraints: this.constraints,
    options: this.options,
    action: this.action
  };
};

Rule.prototype.when = function(constraints) {
  this.contraints = constraints;
  return this;
};

Rule.prototype.then = function(action) {
  this.action = action;
  return this;
}