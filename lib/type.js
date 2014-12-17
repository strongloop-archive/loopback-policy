module.exports = Type;

var Operator = require('./operator');

function Type(name, operators) {
  this.name = name;
  this.operators = operators;
}

Type.prototype.getOperator = function(name) {
  return this.operators[name];
}

Type.prototype.defineOperator = function(operator) {
  this.operators[operator.name] = operator;
}
