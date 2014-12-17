module.exports = function(engine) {
  var call = new Operator('regexp', function(str, pattern) {
    return str.match(pattern);
  });

  var type = engine.defineType('function');

  type.defineOperator(call);
}
