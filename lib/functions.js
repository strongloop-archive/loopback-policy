var types = require('./types');
var facts = require('./facts');
var functions = module.exports = {all: {}};

functions.define = function (name, def) {
  functions.all[name] = def;
}
functions.get = function(name) {
  name = name.split('()')[0];
  return functions.all[name];
}
functions.invoke = function(name, args, ctx, cb) {
  functions.get(name).fn(args, ctx, cb);
}
functions.getReturnType = function(name) {
  return types.get(functions.get(name).returnType);
}

functions.define('log', {
  returnType: 'string',
  fn: function(args, ctx, cb) {
    console.log(args.msg, ctx.n);
    cb(null, args.msg);
  }
});

functions.define('checkRateLimit', {
  returnType: 'number',
  fn: function(args, ctx, cb) {
    var bucketId = getBucketId(ctx, args.scope);
    var bucket = new Bucket(bucketId);
    var rate = args.rate;
    var interval = args.interval;

    bucket.getValue(function(err, value) {
      var now = Date.now();
      var allowance;
      var elapsed;
      var updated = now;
    
      if(value === undefined) {
        allowance = rate;
      } else {
        allowance = value.allowance;
        elapsed = now - value.updated;
        allowance += elapsed * (rate / interval);
        if(allowance > rate) {
          allowance = rate;
        }
        if(allowance < 1) {
          allowance = 0;
        } else {
          allowance -= 1;
        }
      }

      allowance = Math.round(allowance);

      console.log(allowance);

      bucket.setValue({
        allowance: allowance,
        updated: now
      }, function(err) {
        if(err) return cb(err);
        cb(null, allowance);
      });
    });
  },
  args: {
    rate: {type: 'number'},
    interval: {type: 'number'},
    scope: {type: 'array', of: 'string'}
  }
});

function getBucketId(ctx, scope) {
  var id = [];
  for (var i = 0; i < scope.length; i++) {
    id.push(facts.get(scope[i]).get(ctx));
  };

  return id.join('-');
}

var buckets = {};
function Bucket(id) {
  this.id = id;
}
Bucket.prototype.getValue = function(cb) {
  cb(null, buckets[this.id]);
}
Bucket.prototype.setValue = function(val, cb) {
  buckets[this.id] = val;
  cb();
}
