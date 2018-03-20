const Koa = require("koa");
const wrappedKoaMiddleware = require("../index");
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
