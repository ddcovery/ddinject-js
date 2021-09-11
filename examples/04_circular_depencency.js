/**
 * Transient dependency examples... each time a dependency is resolved,  a new instance is generated
 */
const { Container } = require("..");

// A self dependency
function A({ a }) { }
// B and C mutually dependent
function B({ c }) { }
function C({ b }) { }

const container = Container().
  add("a", A).
  add("b", B).
  add("c", C);

try {
  container.consume(({ a }) => { });
} catch (e) {
  console.log("Error consuming 'a':\n", e.message);
}
try {
  container.consume(function ({ b }) { });
} catch (e) {
  console.log("Error consuming 'b':\n", e.message);
}