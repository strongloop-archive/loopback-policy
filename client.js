var Policy = require('./lib/policy');

policyApp = angular.module('policyApp', [])
  .controller('PolicyController', ['$scope', function($scope) {
    $scope.list = [1,2,3]
  }]);

require('./directives');
