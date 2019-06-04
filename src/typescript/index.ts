const plugin = function() {
	return (<any>window).BackgroundFetch;
}

export default class BackgroundFetch {

  static get STATUS_RESTRICTED() { return plugin().STATUS_RESTRICTED; }
  static get STATUS_DENIED() { return plugin().STATUS_DENIED; }
  static get STATUS_AVAILABLE() { return plugin().STATUS_AVAILABLE; }

  static get FETCH_RESULT_NEW_DATA() { return plugin().FETCH_RESULT_NEW_DATA; }
  static get FETCH_RESULT_NO_DATA() { return plugin().FETCH_RESULT_NO_DATA; }
  static get FETCH_RESULT_FAILED() { return plugin().FETCH_RESULT_FAILED; }

  static get NETWORK_TYPE_NONE() { return plugin().NETWORK_TYPE_NONE; }
  static get NETWORK_TYPE_ANY() { return plugin().NETWORK_TYPE_ANY; }
  static get NETWORK_TYPE_UNMETERED() { return plugin().NETWORK_TYPE_UNMETERED; }
  static get NETWORK_TYPE_NOT_ROAMING() { return plugin().NETWORK_TYPE_NOT_ROAMING; }
  static get NETWORK_TYPE_CELLULAR() { return plugin().NETWORK_TYPE_CELLULAR; }

  static configure() {
    let fetch = plugin();
    return fetch.configure.apply(fetch, arguments);
  }

  static finish() {
  	let fetch = plugin();
  	return fetch.finish.apply(fetch, arguments);
  }

  static start() {
  	let fetch = plugin();
  	return fetch.start.apply(fetch, arguments);
  }

  static stop() {
  	let fetch = plugin();
  	return fetch.stop.apply(fetch, arguments);
  }

  static status() {
  	let fetch = plugin();
  	return fetch.status.apply(fetch, arguments);
  }
}