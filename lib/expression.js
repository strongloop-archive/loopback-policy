module.exports = Expression;

function Expression(operator, operands, type) {
  this.operator = operator;
  this.operands = operands;
  this.type = type;
}

Expression.prototype.evaluate = function() {
  var op = this.type.operators[this.operator];
  var operands = this.operands;
  operands = operands.map(function(operand) {
    if(operand instanceof Expression) {
      return operand.evaluate();
    } else {
      return operand;
    }
  });

  return op.apply(this.type, operands);
}
