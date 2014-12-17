module.exports = BucketSet;

var facts = require('./facts');

function BucketSet(facts) {
  this.facts = facts;
  this.buckets = {};
}

BucketSet.prototype.getValueForContext = function(ctx, cb) {
  var id = this.getBucketId(ctx);
  this.getValue(id, cb);
}

BucketSet.prototype.getBucketId = function(ctx) {
  var id = [];
  var factName;
  var fact;

  for (var i = 0; i < this.facts.length; i++) {
    factName = this.facts[i];
    fact = facts.get(factName);

    if(!fact) throw new Error(factName + ' has not been defined as a fact');

    id.push(fact.get(ctx));
  };

  return id.join('-');
}

BucketSet.prototype.getValue = function(id, cb) {
  var val = this.buckets[id];
  if(val === undefined) {
    val = this.initialValue;
  }
  cb(null, val);
}

BucketSet.prototype.setValue = function(id, value, cb) {
  this.buckets[id] = value;
  cb();
}

BucketSet.prototype.updateValue = function(ctx, updateFunction, cb) {
  var id = this.getBucketId(ctx);
  var self = this;
  this.getValue(id, function(err, value) {
    updateFunction(value, function(err, updatedValue) {
      if(err) return cb(err);
      self.setValue(id, updatedValue, cb);
    });
  });
}

