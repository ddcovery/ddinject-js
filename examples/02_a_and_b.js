const { Container } = require("..");

Container().
	add("a", A).
	add("b", B).
	consume(({a})=>{
		console.log("✓ Let's consume");
		console.log("❯", a.greet("Anthony"));
	});


function A({b}){
	console.log("✓ A has been called");
	return {
		greet: (name)=>b.say(`Hello ${name}`)
	};
}

function B({}){
	console.log("✓ B has been called");
	return {
		say: (something)=>`Say: "${something}"`
	};
}

