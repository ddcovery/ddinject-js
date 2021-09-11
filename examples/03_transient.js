/**
 * Transient dependency examples... each time a dependency is resolved,  a new instance is generated
 */
const { Container } = require("..");

const container = Container().
	addTransient("counter", Counter).
	add("evenNumbers", EvenNumbers).
	add("oddNumbers", OddNumbers);

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
console.log("Fourth even number is", container.resolve("evenNumbers").next());
// Destructuring magic: we can inject a methods !!! 
container.consume(({ evenNumbers: { next } }) => {
	console.log("Fifth even number is", next());
});
// The container "consume" method, returns transparently the result of the consumer method... 
// you can use it as a "resolve" alternative (avoiding the use of "strings")
{
	let { next } = container.consume(({ evenNumbers }) => evenNumbers);
	console.log("Sixth  even number is", next());
}




function EvenNumbers({ counter }) {
	console.log("✓ EvenNumbers has been instantiated");
	return {
		next
	};
	function next() {
		return counter.next() * 2;
	}
}

function OddNumbers({ counter }) {
	console.log("✓ OddNumbers has been instantiated");
	return {
		next
	};
	function next() {
		return 1 + counter.next() * 2;
	}
}

function Counter({ }) {
	console.log("✓ Counter has been instantiated");
	let value = 0;
	return {
		next
	};

	function next() {
		return value++;
	}
}