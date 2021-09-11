# ddinject-js

When **destructuring** and **lazy** properties make the hard work.

Never dependencies injection has been so simple

> $ node examples/00_simple.js

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

**Singleton by default**, but **transient** is supported:

> $ node examples/03_transient.js

```javascript
Container().
  addTransient("counter", Counter).
  add("evenNumbers", EvenNumbers).
  add("oddNumbers", OddNumbers).
  consume(({ evenNumbers, oddNumbers }) => {
    console.log("First 3 even numbers are:",
      evenNumbers.next(),
      evenNumbers.next(),
      evenNumbers.next()
    );
    console.log("First 3 odd numbers are:",
      oddNumbers.next(),
      oddNumbers.next(),
      oddNumbers.next()
    );
  });
```

**Circular dependencies** are easily detected

> $ node examples/04_circular_dependency.js

```javascript
// A self dependency
function A({ a }) { }
// B and C mutually dependent
function B({ c }) { }
function C({ b }) { }

const container = Container().
  add("a", A).
  add("b", B).
  add("c", C);

try {
  container.consume(({ a }) => { });
} catch (e) {
  console.log("Error consuming 'a':\n", e.message);
}
try {
  container.consume(function ({ b }) { });
} catch (e) {
  console.log("Error consuming 'b':\n", e.message);
}
```
**Factory first** allows you to "inject" dependencies before instantiating a class!!!

> $ node examples/06_presolved_classes_factory.js

```javascript
Container().
  add("Person", PersonFactory).
  add("keyGenerator", KeyGenerator).
  consume(({ Person }) => {
    // Person is a Class with internal dependencies solved (i.e.: keyGenerator)
    // Now, we can create as many instances of Person we need
    const peter = new Person("Peter");
    console.log("❯", { name: peter.name, id: peter.id });
    peter.sayYourName();
  });

/**
 * We encapsulate Person class into a factory... 
 * The factory receives solved dependencies, the class can use this dependencies because is defined into factory clousure
 */
function PersonFactory({ keyGenerator: { next } }) {
  console.log("✓ PersonFactory has been called");
  return class Person {
    #id
    #name
    constructor(name) {
      this.#id = `person_${next()}`;
      this.#name = name;
    }
    get id() {
      return this.#id
    }
    get name() {
      return this.#name
    }
    sayYourName() {
      console.log(`☺ My name is ${this.#name}`)
    }
  };
}

function KeyGenerator({ } = {}) {
  console.log("✓ KeyGenerator has been called");
  let lastId = 0;
  return {
    next: () => `${++lastId}`
  };
}
```
