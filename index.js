const isGeneratorFunction = require("is-generator-function");
const co = require("co");

function wrappedKoaMiddleware(app) {
  app.experimental = true;
  const appUse = app.use;
  app.use = function(fn) {
    if (isGeneratorFunction(fn)) {
      fn = co.wrap(fn);
    }
    const middlewareLength = this.middleware.length;
    const wrapFun = async function(next) {
      if (!fn) fn = noop;
      const t1 = process.uptime() * 1000;
      await fn.call(this, next);
      this.middlewareTakeTime = this.middlewareTakeTime || [];
      this.middlewareTakeTime.push({
        num: middlewareLength,
        funcName: fn.__generatorFunction__
          ? fn.__generatorFunction__.name
          : fn.name,
        takeTime: process.uptime() * 1000 - t1
      });
    };
    return appUse.call(this, wrapFun);
  };
}
module.exports = wrappedKoaMiddleware;
