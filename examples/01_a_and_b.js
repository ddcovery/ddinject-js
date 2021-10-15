const { createContainer } = require("..");

createContainer().
	add("a", A).
	add("b", B).
	consume(({a})=>{
		console.log("✓ Let's consume");
		console.log("❯", a.greet("Anthony"));
	});

function A({b}){
	console.log("✓ A has been instantiated");
	return {
		greet: (name)=>b.say(`Hello ${name}`)
	};
}
function B({}){
	console.log("✓ B has been instantiated");
	return {
		say: (something)=>`Say: "${something}"`
	};
}
