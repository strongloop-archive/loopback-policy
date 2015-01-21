var debug = require('debug')('loopback:policy:rate-limiting');
var limiter = require('limiter');

module.exports = RateLimiter;

function RateLimiter(options) {
  if (!(this instanceof RateLimiter)) {
    return new RateLimiter(options);
  }
  options = options || {};

  this.limit = options.limit || 1000;
  this.interval = options.interval || 1000; // ms
  this.limiters = {};
  this.options = options;
}

RateLimiter.prototype.getLimiter = function(key) {
  var inst;
  debug('Key: %s', key);
  if (key) {
    inst = this.limiters[key];
    if (!inst) {
      debug('Creating rate limiter: %d %d', this.limit, this.interval);
      inst = new limiter.RateLimiter(this.limit, this.interval);
      this.limiters[key] = inst;
    }
  }
  return inst;
};

RateLimiter.prototype.enforce = function(ctx, key) {
  var res = ctx.res;
  var inst = this.getLimiter(key);
  if (inst) {
    var ok = inst.tryRemoveTokens(1);
    debug('Bucket: ', inst.tokenBucket);
    var remaining = Math.floor(inst.getTokensRemaining());
    var reset = Math.max(this.interval - (Date.now() - inst.curIntervalStart), 0);

    debug('Limit: %d Remaining: %d Reset: %d', this.limit, remaining, reset);
    res.setHeader('X-RateLimit-Limit', this.limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);

    ctx.limits[key] = {
      limit: this.limit,
      remaining: remaining,
      reset: reset
    };

    if (!ok) {
      res.status(429).json({error: 'Limit exceeded'});
      return false;
    }
  }
  return true;
};
