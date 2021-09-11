# ddinject-js

When destructuring and lazy properties make the hard work.

Never dependencies injection has been so simple

```javascript
const { Container } = require("..");

Container().
  add("logger", Logger).
  add("writer", Writer).
  consume(({ logger }) => {
    logger.log("This has been logged");
  });

function Logger({ writer: { write } }) {
  let nLine = 0;
  return {
    log: (text) => write(`[${new Date().toISOString()}] [☛${++nLine}] ${text}`)
  }
}
function Writer() {
  return {
    write: (text) => console.log(text)
  };
}
```
