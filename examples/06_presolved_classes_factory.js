/**
 * Transient dependency examples... each time a dependency is resolved,  a new instance is generated
 */
const { Container } = require("..");

// Example Person Class with dependencies resolved ready to be used as an standard class
Container().
	add("Person", PersonClassFactory).
	add("keyGenerator", KeyGenerator).
	consume(({ Person }) => {
		// Person is a Class with internal dependencies to providers resolved (i.e.: keyGenerator)
		// Now, we can create as many instances of Person we need
		const peter = new Person("Peter");
		console.log("❯", {name: peter.name, id:peter.id});
		peter.sayYourName();
	});



/**
 * We encapsulate Person class into a factory... 
 * The factory solves dependencies and Person can be instantiated as an standard class
 */
function PersonClassFactory({ keyGenerator }) {
	console.log("✓ PersonClassFactory has been called");
	return class Person {
		#id
		#name

		constructor(name) {
			this.#id = `person_${keyGenerator.next()}`;
			this.#name = name;
		}

		get id() { 
			return this.#id 
		}
		get name() {
			return this.#name
		}
		sayYourName(){
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