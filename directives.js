policyApp
  .directive('conditionEditor', [function() {
    return {
      restrict: "E",
      replace: true,
      templateUrl: 'templates/condition-editor.html',
      link: function(scope) {
        console.log(scope);
      }
    };
  }])
  .directive('policyDebugger', [function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/policy-debugger.html',
      link: function(scope) {
        var Policy = require('./lib/policy');
        scope.contextJSON = JSON.stringify({
          userId: 123
        }, null, 2);
        scope.policyJSON = JSON.stringify({
          conditions: {
            'checkRateLimit()': [{
              rate: 10,
              interval: 60000,
              scope: ['userId']
            }, {
              equals: 0
            }]
          },
          actions: {
            deny: {message: 'foo'}
          }
        }, null, 2);

        scope.run = function() {
          var p = new Policy(JSON.parse(scope.policyJSON));
          p.evaluateConditions(JSON.parse(scope.contextJSON), function(err, results) {
            results = arguments[arguments.length - 1];
            scope.results = JSON.stringify(results, null, 2);
          });
        }
      }
    };
  }]);

