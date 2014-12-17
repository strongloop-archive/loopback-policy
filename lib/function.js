module.exports = Func;

function Func(name, fn, options) {
  this.name = name;
  this.fn = fn;
  this.options = options;
}

