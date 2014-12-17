var extend = require('extend');
var types = module.exports = {all: {}};

types.define = function(name, def) {
  if(def.extends) {
    def = extend(true, def, types.all[def.extends]);
  }
  def.name = name;
  types.all[name] = def;
  if(def.alias) {
    Object.keys(def.alias).forEach(function(operator) {
      if(!Array.isArray(def.alias[operator])) return;
      def.alias[operator].forEach(function(alias) {
        def.operators[alias] = def.operators[operator];
      });
    });
  }
}

types.get = function(name) {
  return types.all[name];
}

types.define('object', {
  operators: {
    equals: function(a, b) {
      return a === b;
    },
    exists: function(val) {
      return this.is(val);
    },
    not: function(val) {
      return !val;
    },
    and: function(a, b) {
      return a && b;
    }
  },
  alias: {
    equals: ['eq', 'is', 'exactly matches', 'is exactly']
  },
  is: function(val) {
    return typeof val === this.name;
  }
});

types.define('array', {
  extends: 'object',
  operators: {
    equals: function(a, b) {
      // overly simple
      return JSON.stringify(a) === JSON.stringify(b);
    },
    includes: function(a, b) {
      return a.indexOf(b) > -1;
    }
  },
  properties: {
    length: {type: 'number'}
  },
  is: function(val) {
    return Array.isArray(val);
  }
});

types.define('boolean', {
  extends: 'object'
});

types.define('number', {
  extends: 'object',
  operators: {
    'greater than': function(a, b) {
      return a > b;
    },
    'less than': function(a, b) {
      return a < b;
    },
    'greater than or equal to': function(a, b) {
      return a >= b;
    },
    'less than or equal to': function(a, b) {
      return a <= b;
    }
  },
  alias: {
    'greater than': ['gt', '>'],
    'less than': ['lte', '<'],
    'greater than or equal to': ['gte', '>='],
    'less than or equal to': ['lte', '>'],
  }
});

types.define('string', {
  extends: 'array',
  operators: {
    equals: function(a, b) {
      return a === b;
    },
    regexp: function(a, b) {
      return a.match(b);
    }
  },
  operands: {
    regexp: ['string', 'regexp']
  }
});

types.define('url', {
  extends: 'string',
  operators: {
    file: function(val) {
      return !!path.extname(val);
    }
  },
  properties: {
    query: {type: 'string'},
    pathname: {type: 'string'}
  }
});

types.define('day', {
  extends: 'number',
  operators: {
    weekend: function(val) {
      return val === 0 || val === 6;
    }
  },
  operands: {
    weekend: [{
      arg: 'val',
      type: 'day'
    }]
  }
});
