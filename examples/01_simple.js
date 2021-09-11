const { Container } = require("..");

console.log("\nFirst example... lets log\n");
Container().
	add("log", Log).
	consume(({ log }) => {
		log.write("This has been logged");
	});

console.log("\nSecond example... log with singleton\n");
{
	let container = Container().
		add("log", Log);

	container.consume(({ log }) => log.write("Nice to see you again... you can see my number of line is ☛1"));
	container.consume(({ log }) => {
		log.write("is it ☛2? yes it is");
	});
	let log = container.resolve("log");
	log.write("You guessed it.  it's ☛3");

	container.resolve("log").write("Finally, and because 'log' is singleton, it's  ☛4");
}
console.log("\nThird example... log with transient\n");
{
	let container = Container().
		addTransient("log", Log);

	container.consume(({ log }) => log.write("I'm ☛1"));
	container.consume(({ log }) => log.write("As I mentioned... I really am ☛1"));
	container.resolve("log").write("Dont convinced? just see my log number is ☛1 too");

}


function Log() {
	let nLine = 0;
	return {
		write: (text) => console.log(`[${new Date().toISOString()}] [☛${++nLine}] ${text}`)
	}
}
