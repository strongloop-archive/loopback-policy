function Statement(conditions) {
  this.conditions = conditions;
}

Statement.prototype.parse = function() {
  var expressions = [];
  var conditionKeys = Object.keys(conditions);
  var functionName;
  var key;
  var condition;

  for (var i = conditionKeys.length - 1; i >= 0; i--) {
    key = conditionKeys[i];
    condition = conditions[key];
    functionName = getFunctionName(key);
    if(functionName) {
      parseFunctionExpressions(expressions, functionName, condition);
    } else {
      parseFactExpressions(expressions, key, condition);
    }
  };

  return expressions;
}

Statement.prototype.evaluate = function(ctx, engine, cb) {
  var results = {};
  var expressions = this.parse();
  async.every(expressions, function(item, callback) {
    item.expression.evaluate({
      ctx: ctx,
      engine: engine
    }, function(err, expressionResult) {
      var key = item.functionName || item.factName;
      if(err) return callback(err);
      if(result) {
        results[key] = results[key] || {};
        results[key][item.expression.operator] = result;
        callback(null, true);
      } else {
        callback(null, false);
      }
    });
  });
}

function parseFactExpressions(expressions, factName,  conditions) {
  var operations;

  if(typeof conditions !== 'object') {
    operations = {equals: conditions};
  } else {
    operations = conditions;
  }

  var operators = Object.keys(operations);
  var operands;
  var operator;

  for (var i = 0; i < operators.length; i++) {
    operator = operators[i];
    operands = [factName, operations[operator]];
    expressions.push({
      expression: new Expression(operator, operands),
      factName: factName
    });
  };
}

function parseFunctionExpressions(expressions, functionName,  conditions, engine) {
  var operations;

  if(typeof conditions !== 'object') {
    operations = [{}, {equals: conditions}];
  } else {
    operations = conditions;
  }

  var args = operations[0];
  operations = operations[1];

  var functionType = engine.getType('function');
  var functionExpression = new Expression('call', [functionName, args], functionType);
  var operators = Object.keys(operations);
  var operands;
  var operator;

  for (var i = 0; i < operators.length; i++) {
    operator = operators[i];
    operands = [functionExpression, operations[operator]];
    expressions.push({
      expression: new Expression(operator, operands, engine.getTypeForFact(factName)))
      functionName: functionName
    });
  };
}



