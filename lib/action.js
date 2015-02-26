var assert = require('assert');
module.exports = Action;

/**
 * Two types of actions are supported
 * - A JavaScript function to be executed
 * - A command object for prebuilt functions by name
 *
 * @param action
 * @param fn
 * @returns {Action}
 * @constructor
 */
function Action(action, fn) {
  if (!(this instanceof Action)) {
    return new Action(action, fn);
  }
  if (typeof action === 'string') {
    action = {
      name: action,
      fn: fn
    };
  }
  assert(typeof action === 'object' && action !== null,
    'The action must be an object');
  this.name = action.name;
  this.fn = action.fn;
  assert(typeof this.name === 'string', 'The name must be a string');
  assert(typeof this.fn === 'function', 'The fn must be a function');
}

Action.prototype.toJSON = function() {
  return this.name;
}
