function Expression(operator, operands, type) {
  this.operator = operator;
  this.operands = operands;
  this.type = type;
}

Expression.prototype.evaluate = function(options, cb) {
  var ctx = options.ctx;
  var engine = options.engine;
  var operands = this.operands;
  var operator = this.type.getOperator(this.operator);

  async.map(operands, function(operand, cb) {
    var fact = typeof operand == 'string' && engine.getFact(operand);

    if(operand instanceof Expression) {
      operand.evaluate(options, cb);
    } else if(fact) {
      operand = fact.get(ctx);
    } else {
      cb(null, operand);
    }
  }, function(err, results) {
    var result;
    if(err) return cb(err);
    if(operator.isAsync) {
      operator.operate(operands, cb);
    } else {
      try {
        result = operator.operate(operands);
      } catch(e) {
        return cb(e);
      }
      cb(null, result);
    }
  });
}
