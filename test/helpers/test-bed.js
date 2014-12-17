var Engine = require('../lib/engine');

module.exports = TestBed;

function TestBed() {
  var engine = this.engine = new Engine();

  engine.defineFact('testFact', {
    get: function(ctx) {
      return ctx.testFact;
    },
    type: 'string'
  });
}

TestBed.prototype.basicPolicy = function() {
  return this.engine.definePolicy({
    conditions: {
      testFact: 'testValue'
    }
  });
}

TestBed.prototype.basicContext = function() {
  return {
    testFact: 'testValue'
  }
}

TestBed.prototype.functionPolicy = function() {
  this.engine.defineFunction('testFunction', function(msg, cb) {
    cb(null, msg);
  }, {
    accepts: [{
      arg: 'msg',
      type: 'string'
    }],
    returns: {
      arg: 'msg',
      type: 'string'
    }
  });

  return this.engine.definePolicy({
    conditions: {
      testFunction: {
        arguments: ['foo'],
        results: {
          equals: 'foo'
        }
      }
    }
  });
}

