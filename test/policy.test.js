describe('Policy', function() {
  var testBed;

  beforeEach(function() {
    testBed = helpers.createTestBed();
  });

  describe('policy.evaluateConditions(ctx, cb)', function() {
    it('should evaluate to true when conditions are matched', function(done) {
      var ctx = testBed.basicContext();
      var policy = testBed.basicPolicy();
      policy.evaluateConditions(ctx, function(err, ctx, results) {
        expect(err).to.not.exist();
        expect(results.testFact.equals).to.eql(true);
        done();
      });
    });
    it('should evaluate conditions using functions', function() {
      var ctx = {};
      var policy = testBed.functionPolicy();
      policy.evaluateConditions(ctx, function(err, ctx, results) {
        expect(results.testFunction.equals).to.eql(true);
        done();
      });
    });
  });
});
