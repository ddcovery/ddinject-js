const { createContainer } = require("..");


/**
 * The classic provider using a class
 * Dependencies are received by constructor and stored as private properties.
 * It must be declared here (before you use it):  you can't move this declaration to the end of the file!!!
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


// Example 1: Standard factory function as provider
createContainer().
	add("carsProvider", CarsProviderFactory).
	add("keyGenerator", KeyGeneratorFactory).
	consume(({ carsProvider: { createCar } }) => {
		console.log("❯", createCar("red"));
		console.log("❯", createCar("yelow"));
	});

// Example 2: Standard class as a provider:  Must be wrapped with a Factory.   
createContainer().
	add("carsProvider", (deps) => new CarsProviderClass(deps)).
	add("keyGenerator", KeyGeneratorFactory).
	// You can't use "destructuring" to access methods of the instance because the internal "this" refernce changes
	consume(({ carsProvider }) => {
		console.log("❯", carsProvider.createCar("red"));
		console.log("❯", carsProvider.createCar("yellow"));
	});

/**
* The Function based provider
* Dependencies doesn't need to be sotred as private properties:  they are available in the function scope automatically
*/
function CarsProviderFactory({ keyGenerator }) {
	console.log("✓ CarsProviderFactory has been called");
	return {
		createCar
	};

	function createCar(color) {
		return {
			id: keyGenerator.next(),
			color
		};
	}
}

function KeyGeneratorFactory({ } = {}) {
	console.log("✓ KeyGeneratorFactory has been called");
	let lastId = 0;
	return {
		next: () => `${++lastId}`
	};
}
