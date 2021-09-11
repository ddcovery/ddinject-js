const { Container } = require("..");

console.log("\nExample 1: log with singleton\n");
{
	let container = Container().
		add("log", Log);

	container.consume(({ log }) => log.write("Nice to see you again... you can see my line number is ☛1"));
	container.consume(({ log: { write } }) => write("is it ☛2? yes it is"));
	container.resolve("log").write("You guessed it.  it's ☛3");
	let log = container.resolve("log");
	log.write("Finally, and because 'log' is singleton, it's  ☛4");
	console.log("❯ Total logged lines has been", log.linesCount());
}
console.log("\nExample 2... log with transient\n");
{
	let container = Container().
		addTransient("log", Log);

	container.consume(({ log }) => log.write("I'm ☛1"));
	container.consume(({ log: { write } }) => write("As I mentioned, I really am ☛1"));
	container.resolve("log").write("Dont convinced? just see my log number. I is ☛1 too");

}

function Log() {
	let nLine = 0;
	return {
		write: (text) => console.log(`[${new Date().toISOString()}] [☛${++nLine}] ${text}`),
		linesCount: () => nLine
	}
}
