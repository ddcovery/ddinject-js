const { createContainer } = require("..");

createContainer().
	add("a", AFactory).
	add("b", BFactory).
	consume(({a})=>{
		console.log("✓ Let's consume");
		console.log("❯", a.greet("Anthony"));
	});

function AFactory({b}){
	console.log("✓ A has been instantiated");
	return {
		greet: (name)=>b.say(`Hello ${name}`)
	};
}
function BFactory({}){
	console.log("✓ B has been instantiated");
	return {
		say: (something)=>`Say: "${something}"`
	};
}