const { assert } = require("console");

module.exports = createContainer;

function createContainer() {
	const deps = {};
	const proxiedDeps = createDependenciesProxy(deps);

	const containerApi = {
		add: addSingleton,
		/**
		 * Adds a singleton value provider to the container.
		 * @param {string} name The name used to reference the value
		 * @param {Function(Dependencies)->Any} fProvider The provider function that will be called to obtain the value when required.  
		 *   It will be called only once (as soon as the value will be required by a consumer or provider) and returned value will be reused for any future reference.
		 * @returns {ContainerAPI} The container API can be used to chain multiple container operations
		 */
		addSingleton,
		/**
		 * Adds a transient value provider to the container
		 * @param {string} name The name used to reference the value
		 * @param {Function(Dependencies)->Any} fProvider The provider function that will be called to obtain the value when required.  
		 *      It will be called each time a consumer or a provider references the value
		 * @returns {ContainerAPI} The container API can be used to chain multiple container operations
		 */
		addTransient,
		/**
		 * Add a value to the container
		 * @param {string} name The name used to reference the value
		 * @param {Any} The value to be returned each time a consumer or provider requires it.
		 */
		addValue,
		/**
		 * Executes a consumer that will receive, as parameters, the dependencies resolver object.
		 * @param {Function(Dependencies)->Any} fConsumer
		 * @returns {Any} The result of fConsumer
		 * @example container.consume( ({a,b,c})=>{ ... })
		 */
		consume,
		/**
		 * The dependencies object.  
		 * Each property of the object represents a singleton/transient resolvable value.  
		 * Accessing any property causes it's immediate resolution.
		 * @example 
		 * container = createContainer()
		 * const {db, s3} = container.deps;
		 */
		deps: proxiedDeps
	};

	return containerApi;

	function addSingleton(name, fValueProvider) {
		assert(typeof name === "string", "name must be string");
		assert(typeof fValueProvider === "function", "fValueProvider must be function");

		addDep(name, Singleton(CircularDetector(fValueProvider, name)));
		return containerApi;
	}
	function addTransient(name, fValueProvider) {
		assert(typeof name === "string", "name must be string");
		assert(typeof fValueProvider === "function", "fValueProvider must be function");

		addDep(name, CircularDetector(fValueProvider, name));
		return containerApi;
	}
	function addValue(name, value) {
		assert(typeof name === "string", "name must be string");

		addDep(name, () => value)
	}
	function consume(fConsumer) {
		assert(typeof fConsumer === "function", "fInjectionCousumer must be function");

		return fConsumer(proxiedDeps);
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
		let evaluated = false;
		return () => {
			if (!evaluated) {
				value = fValueProvider(proxiedDeps);
				evaluated = true;
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
					return fValueProvider(proxiedDeps);
				} finally {
					awaitingValue = false;
				}
			}
		}
	}

	function createDependenciesProxy(deps) {
		const DepsChgErrorMsg = `✗ [ddinject.Container]: changing dependencies object is not allowed`;
		return new Proxy(deps, {
			get(target, name) {
				if (target.hasOwnProperty(name))
					return target[name];
				else
					throw new Error(`✗ [ddinject.Container]: can't find provider "${name}"`);
			},
			set() { throw new Error(DepsChgErrorMsg); },
			deleteProperty() { throw new Error(DepsChgErrorMsg); },
			defineProperty() { throw new Error(DepsChgErrorMsg); }
		})
	}
}
