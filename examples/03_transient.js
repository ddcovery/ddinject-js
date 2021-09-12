/**
 * Transient dependency examples... each time a dependency is resolved,  a new instance is generated
 */
const { createContainer } = require("..");

const container = createContainer().
	addTransient("counter", CounterFactory).
	add("evenNumbers", EvenNumbersFactory).
	add("oddNumbers", OddNumbersFactory);

//
// Because "counter" is a transient provider, EvenNumbers and OddNumbers can generate numbers 
// without interferences (each one uses its own "counter" instance )
//
container.consume(({ evenNumbers, oddNumbers }) => {
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

// Because 'evenNumers' is singleton... resolving it will reuse the same instance;
console.log("Fourth even number is", container.deps.evenNumbers.next());
// Destructuring magic: we can inject a methods !!! 
container.consume(({ evenNumbers: { next } }) => {
	console.log("Fifth even number is", next());
});

{
	let { evenNumbers: { next } } = container.deps;
	console.log("Sixth  even number is", next());
}




function EvenNumbersFactory({ counter }) {
	console.log("✓ EvenNumbers has been instantiated");
	return {
		next
	};
	function next() {
		return counter.next() * 2;
	}
}

function OddNumbersFactory({ counter }) {
	console.log("✓ OddNumbers has been instantiated");
	return {
		next
	};
	function next() {
		return 1 + counter.next() * 2;
	}
}

function CounterFactory({ }) {
	console.log("✓ Counter has been instantiated");
	let value = 0;
	return {
		next
	};

	function next() {
		return value++;
	}
}