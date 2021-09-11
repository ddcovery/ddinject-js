const { assert } = require("console");

module.exports = Container;

function Container() {
	const deps = {};
	const api = {
		add: addSingleton,
		addSingleton,
		addTransient,
		addValue,
		consume,
		resolve
	};

	return api;

	function addSingleton(name, fValueProvider) {
		assert(typeof name === "string", "name must be string");
		assert(typeof fValueProvider === "function", "fValueProvider must be function");

		addDep(name, Singleton(CircularDetector(fValueProvider, name)));
		return api;
	}
	function addTransient(name, fValueProvider) {
		assert(typeof name === "string", "name must be string");
		assert(typeof fValueProvider === "function", "fValueProvider must be function");

		addDep(name, CircularDetector(fValueProvider, name));
		return api;
	}
	function addValue(name, value) {
		assert(typeof name === "string", "name must be string");

		addDep(name, () => value)
	}
	function consume(fConsumer) {
		assert(typeof fConsumer === "function", "fInjectionCousumer must be function");

		return fConsumer(deps);
	}
	function resolve(name) {
		assert(typeof name === "string", "name must be string");

		return deps[name];
	}


	/**
	 * Adds a new property into the "deps" private object.
	 * The property getter will evaluate de provider.
	 * @param {*} name 
	 * @param {*} fProvider 
	 */
	function addDep(name, fProvider) {
		if (deps.hasOwnProperty(name)) {
			throw new Error(`✗ [ddinject.Container]: duplicated name ${name}`);
		} else {
			Object.defineProperty(deps, name, { get: fProvider });
		}
	}

	function Singleton(fValueProvider) {
		let value;
		return () => {
			if (value === void 0) {
				value = fValueProvider(deps);
			}
			return value;
		}
	}

	/**
	 * Generates a provider that detects if it is called twice before first call is ended.
	 * If re-entry is detected, an exception is raised
	 * @param {*} fValueProvider 
	 * @param {*} name 
	 * @returns 
	 */
	function CircularDetector(fValueProvider, name) {
		let awaitingValue = false;
		return () => {
			if (awaitingValue) {
				throw new Error(`✗ [ddinject.Container]: Circular dependency when solving '${name}'`);
			} else {
				awaitingValue = true;
				try {
					return fValueProvider(deps);
				} finally {
					awaitingValue = false;
				}
			}
		}
	}
}