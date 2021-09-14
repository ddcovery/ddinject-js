# ddinject: when dependency injection becomes native

When **destructuring** and **defined properties** are combined dependency injection becomes native and simple 🎉️

**Take a look**

> $ node examples/00_simple.js

```javascript
const { createContainer } = require("..");

createContainer().
  add("logger", LoggerFactory).
  add("writer", WriterFactory).
  consume(({ logger }) => {
    logger.log("This has been logged");
  });

function LoggerFactory({ writer: { write } }) {
  let nLine = 0;
  return {
    log: (text) => write(`[${new Date().toISOString()}] [☛${++nLine}] ${text}`)
  }
}
function WriterFactory() {
  return {
    write: (text) => console.log(text)
  };
}
```

## Wait... where are **classes**, **annotations**, **reflection**... and all classical stuff?

Hey guy 🙋: this is **JavaScript!!!**  .  

This container library is, mainly, **functional**.   We love functions and closures:  dependencies providers/consumers are implemented this graceful way.

You can also use it with javascript classes (😅) with very small boilerplate:  we include some examples a little below (thanks for reading)

## Lets see more examples 

**Singleton by default**, but **Transient** is supported:

> $ node examples/03_transient.js

```javascript
createContainer().
  addTransient("counter", CounterFactory).
  add("evenNumbers", EvenNumbersFactory).
  add("oddNumbers", OddNumbersFactory).
  consume(({ evenNumbers, oddNumbers }) => {
    console.log("First 3 even numbers are:", evenNumbers.next(), evenNumbers.next(), evenNumbers.next() );
    console.log("First 3 odd numbers are:", oddNumbers.next(), oddNumbers.next(), oddNumbers.next() );
  });

function EvenNumbersFactory({ counter }) {
  console.log("✓ EvenNumbers has been called");
  return {
    next: ()=>counter.next() * 2
  }
}

function OddNumbersFactory({ counter }) {
  console.log("✓ OddNumbers has been called");
  return {
    next: ()=>1 + counter.next() * 2
  }
}

function CounterFactory({ }) {
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
function AFactory({ a }) { }
// B and C mutually dependent
function BFactory({ c }) { }
function CFactory({ b }) { }

const container = createContainer().
  add("a", AFactory).
  add("b", BFactory).
  add("c", CFactory);

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
createContainer().
  add("Person", PersonClassFactory).
  add("keyGenerator", KeyGeneratorFactory).
  consume(({ Person }) => {
    // Person is a Class with internal dependencies solved (i.e.: keyGenerator)
    // You can create as many instances of Person as you need.
    const peter = new Person("Peter");
    console.log("❯", { name: peter.name, id: peter.id });
    peter.sayYourName();
  });

/**
 * The class itself (no a class instance) is returned by the factory.
 * The class can use all solved dependencies because it is defined into the factory function.
 */
function PersonClassFactory({ keyGenerator: { next } }) {
  console.log("✓ PersonClassFactory has been called");
  return class Person {
    #id
    #name
    constructor(name) {
      // We use the method of a provider here
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

function KeyGeneratorFactory({ } = {}) {
  console.log("✓ KeyGeneratorFactory has been called");
  let lastId = 0;
  return {
    next: () => `${++lastId}`
  };
}
```

## Classic **Class as a provider**?

> $ node examples/05_classes_vs_factory.js

```javascript
/**
 * Dependencies are received by constructor: they must be stored as private properties.
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

createContainer().
  // You must wrap the class instantiation
  add("carsProvider", (deps) => new CarsProviderClass(deps)).
  add("keyGenerator", KeyGenerator).
  // Here, you can't "{carsProvider:{createCar}}" because it changes the "this" value of the createCar method (javascript objects "this" binding mechanism).
  consume(({ carsProvider }) => {
    console.log("❯", carsProvider.createCar("red"));
    console.log("❯", carsProvider.createCar("yellow"));
  });
```

# Definitions

## The provider
A provider is a function that receives, as paramenter, the dependencies object and generates, as result, a value.  

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
You can rewrite it in a more friendly way:
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
It must be added to the container ( with **add**, **addTransient** or **addSingleton** methods) to be considered a provider.  When added, the provider is associated to a **name** that will be used by other providers/consumers to reference the provided value.

**Remarks**:
* The _dependencies_ object can't be modified: if you try to create, change or delete any property an exception will be raised.
* Trying to access an unexisting dependency will raise an exception



## The consumer
Any function that consumes dependencies from the container and is not registered as provider is a consumer.

The **consume** method is a simple way to inject dependencies into a consumer function

```javascript 
container = createContainer().
  add("a", AProvider).
  consume( myAppLogic );

function myAppLogic({ a }){
  a.doSomething();
}
```

```javascript 
const container = createContainer().
  add("customersDao",CustomersDaoProvider).
  add("productsDao",ProductsDaoProviderB);
...
function createCustomerAction(request, response, next){
  container.consume( ({customersDao})=>{
    response.send( customersDao.createCustomer(request.body) );
  });
}
```
You can consume from the container directly without receiving dependencies as parameters:  just use the **deps** property
```javascript 
function createCustomerAction(request, response, next){
  const {customersDao, schemas} = container.deps;
  response.send( customersDao.createCustomer( request.body );
}
```
Usually, you will prefer to register as a provider when possible (removing the need of a "container" variable).

As you probably observed, **ddinject** library enbraces the "[Builder pattern](https://en.wikipedia.org/wiki/Builder_pattern)".  This example shows how to wire-up a _complete express application_ without the need of additional variables.

``` javascript
// main.js
createContainer().
  add("config", require("../config/app_config.js").
  add("db", require("lib/db.js")).
  add("customersDao", require("./daos/customers_dao.js")).
  add("customersCtrl", require("./controllers/customers_ctrl.js")).
  add("apiRoutes", require("./routes/api_routes.js")).
  consume( ({ apiRoutes, config })=>
    express().
      ...
      .use("/api", apiRoutes )
      ...
      .listen(config.http.port, () => 
        console.log(`⚡️[server]: Server is running at http://localhost:${config.http.port}`);
      )  
 );

// customers_ctrl.js
module.exports = function CustomersCtrl({customersDao}){
  return {
    createCustomerAct,
    listCustomersAct,
    updateCustomerAct,
    readCustomerAct,
    deleteCustomersAct
  };
  function createCustomerAct(req, res, next){ ... }
  ...
}
// api_routes.js
module.exports = ({ customersCtrl }) => {
  const { createCustomerAct, readCustomerAct, listCustomerAct, updateCustomerAct, deleteCustomerAct }  = customersCtrl;

  return express.
    Router({ mergeParams: true }).
    use(express.json({})).
    post("/customers", createCustomerAct).
    put("/customers/:customer_id", updateCustomerAct).
    get("/customers", listCustomerAct).
    delete("/customers/:customer_id", deleteCustomerAct);
};
```
# API

## constructor

### createContainer()->Container

Creates a new Container object.
Aligned with the philosofy of this library, we avoid the need of classes and "new" keyword.

## methods

### addSingleton( name:string, fProvider: Function(Dependencies)->Any ) -> Container

Adds a dependency provider to the container.  Returns the container itself allowing you to chain operations (i.e., adding more providers).

* name: the name used to identify the dependency.  It is used by consumers or providers to obtain a dependent value
* fProvider: The provider function to be used when dependency value is required.

The "Singleton" sufix tells than **fProvider** will be called once (the first time a consumer or provider references the "name" dependency).  Next references will obtain the same value

  ```javascript
container.addSingleton( "numbers", ()=>[1,2,3,4,5] );
const a = container.deps.numbers;
const b = container.deps.numbers;
console.assert(a === b);
```

### add(name:string, fProvider: Function(Depencencies)->Any ) -> Container

See **_addSingleton_**

### addTransient(name:string, fProvider: Function(Depencencies)->Any ) -> Container

Adds a dependency provider to the container.  Returns the container itself allowing you to chain operations (i.e., adding more providers).

* name: the name used to identify the dependency.  It is used by consumers or providers to obtain a dependent value
* fProvider: The provider function to be used when dependency value is required.

The "Transient" sufix tells than **fProvider** will be called each time a consumer or provider references the "name" dependency

```javascript
container.addTransient( "numbers", ()=>[1,2,3,4,5] );
const a = container.deps.numbers;
const b = container.deps.numbers;
console.assert(a !== b);
```

### consume( fConsumer: Function(Dependencies)->T )->T

Executes a consumer function (See **_Consumer_**) that will receive the Dependencies object.
The result of the function will be returned

```javascript
const container = createContainer().
  addTransient( "numbers", ()=>[1,2,3,4] );
  
const sum = container.consume( ({ numbers }) => numbers.reduce( (s,n)=>s+n ,0 ) );  

console.assert( sum === 10 );
```

## Properties

### deps

The dependencies object. Each property correspond to one of the added dependencies (see add, addSingleton, addTransient):  you can obtain de resolved value accessing the property :-)

```javascript

container.add("greeter",GreeterFactory).add("quiet", QuietFactory);

const {greeter, quiet} = container.deps;

console.assert( quiet.say() === "" );
console.assert( greeter.sayHello("Peter") === "Hello Peter" );

function GreeterFactory({quiet}){
  return {
    sayHello: (name)=>`Hello ${name}`
  };
}
funtion QuietFactory(){
  return {
    say: ()=>``
  }:
}

```

# A philosophical thought that no one needs apart from the author himself 

**JavaScript** can be used in many ways. 

One of the more powerful ones is embracing than:

* **it is not an OOP language** in the "classic" way than OOP developers expect.
* **it is not an strongly typed language**
* **it has design aspects that sucks (i.e. type coercion) that must be avoided**

After breaking the universal mantra about "how an OOP language must be and why javascript is a bad language" you can start enjoying developing with it:

* You have **functions, closures and objects** that give Javascript it's real power.
* You have rencently sugar syntax incorporations like **destructuring** or **lambdas** or ...
* You only need good conventions and patterns knowledge.
 
After decades of experience with "good/bad languages" (ASM, C, Pascal, C++, C#, Java, Scala, D, Typescript, Ruby, VBScript, Power Shell, Bash, Lingo, Clipper, Basic, ... ) you learn something:  **a programming language must be used in the way you can flow with it**... forcing it to be something that is not **can lead you to hate it**.

# Do you really think this is the native way for javascript?

The original version I wrote was 23 lines long:

```javascript
    function Container() { 
      const deps = { }; 
      const api = { 
        addSingleton: (name, fValueProvider) => { 
          Object.defineProperty(deps, name, {  
            get: singlentonValue(fValueProvider)  
          }); 
          return api; 
        }, 
        doWith: (f) => f(deps) 
      }; 
      return api; 
       
      function singlentonValue(fValueProvider) { 
        var value; 
        return () => { 
          if (value === undefined) { 
            value = fValueProvider(deps); 
          } 
          return value; 
        } 
      } 
    } 
```    

This "simple thing" is enought for a node/express application:  it's simple, it's powerful, it's fast.

* **Destructuring** is treated as first class citizen.  It fits perfectly when you need to consume dependencies.
```javascript
container.doWith( ({customersDAO, productsDAO })=>{ 
 ... 
});
```
* Object **defined properties** are the way used to provide dependencies:  when you evaluate a dependency property, the provider function is evaluated (and not before)... if this provider receives dependencies as parameters, they are evaluated before provider itself is executed.... and so on.



The actual container version code is about 80 lines long (after removing comments and the Proxy mechanism recently added to protect from misuse).  

With this version we support dependencies injection rich functionalities like:

* Transient and Singleton providers.
* Dependency Cycles detection.
* Direct dependencies access (in a very "protected" but simple way)

And it's possible with few lines of code to add more and more powerful functionalites like:
* Containers that "inherites" other "base" containers (Thanks to Proxy object).
* Loading/registering module files directly (.load("./controllers/CustomersCtrl") or .loadAll("./controllers") )

JavaScript rocks when it is used with the javascript "bad designed" language rules **👊**
