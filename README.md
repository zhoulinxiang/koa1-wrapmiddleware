## Record the time spent on each middleware for koa1

Use this data for performance optimization

Here is an example：

```js
const Koa = require("koa");
const wrappedKoaMiddleware = require("koa1-wrapmiddleware");
const app = new Koa();

wrappedKoaMiddleware(app);

app.use(function*(next) {
  yield next;
  console.log(this.middlewareTakeTime);
});
function* xResponseTimeFunc(next) {
  const start = Date.now();
  yield next;
  const ms = Date.now() - start;
  this.set("X-Response-Time", `${ms}ms`);
}
app.use(xResponseTimeFunc);

// logger
function* loggerFunc(next) {
  const start = Date.now();
  yield next;
  const ms = Date.now() - start;
  console.log(`${this.method} ${this.url} - ${ms}`);
}
app.use(loggerFunc);

// response
app.use(function*() {
  this.body = "Hello World";
});

app.listen(3000);
```

Implement：

```js
function wrappedKoaMiddleware(app) {
  const appUse = app.use;
  app.use = function(fn) {
    if (isGeneratorFunction(fn)) {
      fn = convert(fn);
    }
    const middlewareLength = this.middleware.length;
    const wrapFun = async function(ctx, next) {
      const t1 = process.uptime() * 1000;
      await fn(ctx, next);
      ctx.middlewareTakeTime = ctx.middlewareTakeTime || [];
      ctx.middlewareTakeTime.push({
        num: middlewareLength,
        funcName: fn.name,
        takeTime: process.uptime() * 1000 - t1
      });
    };
    return appUse.call(this, wrapFun);
  };
}
```

