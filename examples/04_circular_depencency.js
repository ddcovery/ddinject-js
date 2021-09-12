/**
 * Transient dependency examples... each time a dependency is resolved,  a new instance is generated
 */
const { createContainer } = require("..");

// A self dependency
function AFactory({ a }) { }
// B and C mutually dependent
function BFactory({ c }) { }
function CFactory({ b }) { }

const container = createContainer().
  add("a", AFactory).
  add("b", BFactory).
  add("c", CFactory);

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