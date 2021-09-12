const { createContainer } = require("..");

console.log("\nExample 1: log with singleton\n");
{
	let container = createContainer().
		add("logger", LoggerFactory);

	container.consume(({ logger }) => logger.write("Nice to see you again... you can see my line number is ☛1"));
	container.consume(({ logger: { write } }) => write("is it ☛2? yes it is"));
	let { logger } = container.deps;
	logger.write("You guessed it.  it's ☛3");

	console.log("❯ Total logged lines has been", logger.linesCount());
}
console.log("\nExample 2... log with transient\n");
{
	let container = createContainer().
		addTransient("logger", LoggerFactory);

	container.consume(({ logger }) => logger.write("I'm ☛1"));
	container.consume(({ logger: { write } }) => write("As I mentioned, I really am ☛1"));
	container.deps.logger.write("Dont convinced? just see my log number. I is ☛1 too");

}

function LoggerFactory() {
	let nLine = 0;
	return {
		write: (text) => console.log(`[${new Date().toISOString()}] [☛${++nLine}] ${text}`),
		linesCount: () => nLine
	}
}
