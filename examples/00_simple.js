const { createContainer } = require("..");

createContainer().
	add("logger", LoggerFactory).
	add("writer", WriterFactory).
	consume(({ logger }) => {
		logger.log("This has been logged");
	});

function LoggerFactory({ writer: { write } }) {
	let nLine = 0;
	return {
		log: (text) => write(`[${new Date().toISOString()}] [☛${++nLine}] ${text}`)
	}
}
function WriterFactory() {
	return {
		write: (text) => console.log(text)
	}
}