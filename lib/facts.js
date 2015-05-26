var extend = require('extend');
var facts = module.exports = {all: {}};
var types = require('./types');
var BucketSet = require('./bucket-set');
var assert = require('assert');

facts.define = function(name, def) {
  facts.all[name] = def;
  def.name = name;

  assert(def.type, 'cannot define fact "' + name + '" without a type');
  assert(types.get(def.type), def.type + ' is not a known type');
}

facts.get = function(name) {
  return facts.all[name];
}

facts.getTypeFor = function(fact) {
  return types.get(facts.get(fact).type);
}

facts.define('userId', {
  get: function(ctx) {
    return ctx.userId;
  },
  type: 'number'
});

facts.define('url', {
  get: function(ctx) {
    return ctx.url;
  },
  type: 'string'
});
