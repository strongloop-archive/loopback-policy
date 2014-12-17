module.exports = function(engine) {
  var call = new Operator('call', function(functionName, args, cb) {
    var func = engine.getFunction(functionName);
    var appliedArgs = [].concat(args);
    appliedArgs.push(cb);
    func.fn.apply(engine, appliedArgs);
  });

  var type = engine.defineType('function');

  type.defineOperator(call);
}
