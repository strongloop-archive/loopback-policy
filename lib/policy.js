function Policy(engine, conditions, actions) {
  this.engine = engine;
}

Policy.prototype.evaluateConditions = function(ctx, cb) {
  var statement = new Statement(this.conditions);
  statement.evaluate(this.ctx, this.engine, cb);
}
