function Operator(options) {
  this.options = options;
  this.isAsync = !!options.async;
}

Operator.prototype.operate = function(operands, cb) {
  var options = this.options;
  var operation = options.operation;
  var args = [].concat(operands);

  if(options.async) {
    args.push(cb);
  }

  operation.apply(this, args);
}
