const { Container } = require("..");

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