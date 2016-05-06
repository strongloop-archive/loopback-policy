// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-policy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var assert = require('assert');

module.exports = Constraint;

/**
 * Three types of constraints are supported
 * - A function to evaluate the facts and return/callback with true/false
 * - A query object
 * - A prebuilt-constraint referenced by name
 *
 * @param constraint
 * @param options
 * @returns {Constraint}
 * @constructor
 */
function Constraint(constraint, options) {
  if (!(this instanceof Constraint)) {
    return new Constraint(constraint, options);
  }
  if (typeof constraint === 'string') {
    constraint = {
      name: constraint,
      options: options
    };
  }
  assert(typeof constraint === 'object' && constraint !== null,
    'The constraint must be an object');
  this.name = constraint.name;
  assert(typeof this.name === 'string', 'The name must be a string');
  this.options = constraint.options || {};
}