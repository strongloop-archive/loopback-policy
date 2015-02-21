var assert = require('assert');
var engine = require('./engine');

module.exports = Policy;

var id = 0;

/**
 * Policy class
 * @param {String|Object} policy The policy name or object
 * @param {Array} rules An array of rules
 * @param {Object} [options] Options
 * @returns {Policy}
 * @constructor
 */
function Policy(policy, rules, options) {
  if (!(this instanceof Policy)) {
    return new Policy(policy, rules, options);
  }
  if (typeof policy === 'string') {
    policy = {
      name: policy,
      rules: rules,
      options: options
    };
  }
  assert(typeof policy === 'object' && policy !== null,
    'The policy must be an object');
  this.name = policy.name;
  assert(typeof this.name === 'string', 'The name must be a string');
  this.description = policy.description;
  this.rules = policy.rules || [];
  this.options = policy.options || {};
  this.flow = engine.defineFlow(this.name + (id++), this.rules);
}

/**
 * Execute the policy with given context and intial facts
 * @param {Object} ctx Context object
 * @param {Array} facts An array of facts
 * @param {Function} callback Callback function
 * @returns {*}
 */
Policy.prototype.execute = function(ctx, facts, callback) {
  if (typeof facts === 'function' && callback === undefined) {
    callback = facts;
    facts = [];
  }
  return engine.executeFlow(this.flow, ctx, facts, callback);
}

Policy.prototype.registerRule = function(rule) {
  engine.addRule(this.flow, rule);
  return this;
};

/**
 * Register an object type (model)
 * @param {String} name Type name
 * @param {Function} type Type constructor
 */
Policy.prototype.registerType = function(name, type) {
  if (typeof name === 'function' && type === undefined) {
    type = name;
    name = type.name;
  }
  assert(typeof name === 'string', 'The name must be a string');
  assert(typeof type === 'function', 'The type must be a function');
  this.types[name] = type;
  return this;
};

/**
 * Resolve an object type by name
 * @param {String} name Type name
 * @returns {Function} Type constructor
 */
Policy.prototype.resolveType = function(name) {
  return this.types[name];
};

/**
 * Register a function by name
 * @param {String} name Function name
 * @param {Function} fn Function handler
 */
Policy.prototype.registerFunction = function(name, fn) {
  if (typeof name === 'function' && fn === undefined) {
    fn = name;
    name = fn.name;
  }
  assert(typeof name === 'string', 'The name must be a string');
  assert(typeof fn === 'function', 'The fn must be a function');
  this.functions[name] = fn;
  return this;
};

/**
 * Resolve an function by name
 * @param {String} name Function name
 * @returns {Function} Function handler
 */
Policy.prototype.resolveFunction = function(name) {
  return this.functions[name];
};
