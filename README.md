# ddinject-js

When **destructuring** and **lazy** properties are combined ❤️ , **dependency injection becomes native**.

Never dependencies injection has been so simple 🎉️

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

## Why I can say "this is the most javascript native way"?

Because code of **Container** is abount 100 lines long, including *comments* and *assertions*.

* It supports Transient and Singleton providers.
* It supports Dependency Cicles detection.

How?

* "destructuring" is treated as first class citizen.  It fits perfectly when you need to consume dependencies
* Object "properties" are the way used to provide dependencies:  when you evaluate a property, the provider function is evaluated (and not before).

When destructuring (consumer) and object properties (container) are combined, you have a fluent, simple, fast IOC solution

## lets see more examples
​
**Singleton by default**, but **transient** is supported:

> $ node examples/03_transient.js

```javascript
Container().
  addTransient("counter", Counter).
  add("evenNumbers", EvenNumbers).
  add("oddNumbers", OddNumbers).
  consume(({ evenNumbers, oddNumbers }) => {
    console.log("First 3 even numbers are:", evenNumbers.next(), evenNumbers.next(), evenNumbers.next() );
    console.log("First 3 odd numbers are:", oddNumbers.next(), oddNumbers.next(), oddNumbers.next() );
  });

function EvenNumbers({ counter }) {
  console.log("✓ EvenNumbers has been called");
  return {
    next: ()=>counter.next() * 2
  }
}

function OddNumbers({ counter }) {
  console.log("✓ OddNumbers has been called");
  return {
    next: ()=>1 + counter.next() * 2
  }
}

function Counter({ }) {
  console.log("✓ Counter has been called");
  let value = 0;
  return {
    next: ()=value++
  }
}
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

## Classic **Class as a provider**?

Well, factory pattern is really simple and easily integrated in javascript filosofy using **functions and it's wonderful clousures**.

In any case, if you think class as a provider fits better your needs, you can do it!!!

> $ node examples/05_classes_vs_factory.js

```javascript
/**
 * Dependencies are received by constructor: they must be stored as private properties.
 * The class must be defined before it can be used: - you can't move this declaration to the end of the file! 
 */
class CarsProviderClass {
  #keyGenerator
  constructor({ keyGenerator }) {
    console.log("✓ CarsProviderClass has been instantiated");
    this.#keyGenerator = keyGenerator;
  }
  createCar(color) {
    return {
      id: this.#keyGenerator.next(),
      color
    };
  }
}

Container().
  // You must wrap the class instantiation
  add("carsProvider", (deps) => new CarsProviderClass(deps)).
  add("keyGenerator", KeyGenerator).
  // You can't use "destructuring" to access methods of the instance because the internal "this" refernce changes:  It's a class limitation!!!
  consume(({ carsProvider }) => {
    console.log("❯", carsProvider.createCar("red"));
    console.log("❯", carsProvider.createCar("yellow"));
  });
```

# Definitions


## The provider
A provider is a function that receives, as paramenter, the dependencies object and generates, as result, a value.

i.e.:
```javascript
function CustomersDAO( dependencies ) {
  const {keyGenerator, db} = dependencies;
  
  return {
    create,
    delete,
    read
  }
  ...
}

```

A friendly way to access dependencies is using destructuring: 
* It removes the need to declare the _dependencies_ parameter.
* You declare exactly what you need.

```javascript
function CustomersDAO( {keyGenerator, db} ) {
 
  return {
    create,
    delete,
    read
  }
  ...
}

```

**Remarks**:
* The _dependencies_ object can't be modified: if you try to create, change or delete any property an exception will be raised.
* Trying to acces an unexisting dependency will raise an exception

A provider can be added using **add**, **addTransient** and **addSingleton**

## The consumer
A consumer is a function that receives, as parameter, the dependencies object. It is not registered into the container.
It is called using the **consume** method of the container

i.e.:
```javascript 
Container().
  add("a",A).
  consume( myConsumer );

function myConsumer({a}){
  a.doSomething();
}
```
i.e.:
```javascript 
const container = Container().
  add("a",A).
  add("b",B);

container.consume( ({a})=>{
  a.doSomething();
});

```

You can consume from the container directly without receiving dependencies as parameters:  just use the **resolve** method
```javascript 
container = Container().
  add("a",A).
  add("b",B);
  
container.resolve["a"].doSomething();
```
# API

## container.add or container.addSingleton

```javascript
container.add( name, fProvider ) -> Container
```
Adds a provider to the container using a **name** string and the **fProvider** function

* name: the name used by **consumers** to obtain the value (the provided value)
* fProvider: The provider function to be used when a new value is required.

Because it is "singleton", Provider will be called once (first time "name" reference is used by a consumer or other provider).  Returned value will be used to any future "name" reference.

**Remarks**
* Same provider function can be added with different names.  It allows to use, fore example, a singleton version and a transient version

## container.addTransient

```javascript
container.addTransient( name, fProvider ) -> Container
```

It works the same way than container.add or container.addSingleton with the exception than fProvider will be called every time a consumer (or other provider) references the "name"

