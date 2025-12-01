// mem-test.js (run with: node --expose-gc mem-test.js)
function PersonPerInstance(n) {
  this.name = "x";
  this.greet = function () { return this.name; }; // per-instance
}

function PersonPrototype(n) {
  this.name = "x";
}
PersonPrototype.prototype.greet = function () { return this.name; }; // shared

function measure(Constructor, count) {
  const arr = new Array(count);
  for (let i = 0; i < count; i++) arr[i] = new Constructor(i);
  global.gc && global.gc(); // if node run with --expose-gc
  const mem = process.memoryUsage();
  return { count, rss: mem.rss, heapUsed: mem.heapUsed };
}

const COUNT = 4000000; // adjust to fit your machine
console.log('Prototype-based: ', measure(PersonPrototype, COUNT));
console.log('Per-instance-method: ', measure(PersonPerInstance, COUNT));
