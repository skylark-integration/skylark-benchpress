define([
  "skylark-langx-ns"
],function (skylark) {
  var runtime = function () {
    'use strict';

    /**
     * Convert null and undefined values to empty strings
     * @param {any} value
     * @returns {string}
     */

    function guard(value) {
      return value == null || Array.isArray(value) && value.length === 0 ? '' : value;
    }

    /**
     * Iterate over an object or array
     * @param {string[]} obj - Iteratee object / array
     * @param {function} each - Callback to execute on each item
     * @return {string}
     */
    function iter(obj, each) {
      if (!obj || typeof obj !== 'object') {
        return '';
      }

      var output = '';
      var keys = Object.keys(obj);
      var length = keys.length;

      for (var i = 0; i < length; i += 1) {
        var key = keys[i];
        output += each(key, i, length, obj[key]);
      }

      return output;
    }

    /**
     * Execute a helper
     * @param {object} context - Base data object
     * @param {object} helpers - Map of helper functions
     * @param {string} helperName - Name of helper to execute
     * @param {any[]} args - Array of arguments
     * @returns {string}
     */
    function helper(context, helpers, helperName, args) {
      if (typeof helpers[helperName] !== 'function') {
        return '';
      }
      try {
        var out = helpers[helperName].apply(context, args);
        return out || '';
      } catch (e) {
        return '';
      }
    }

    /**
     * Run a compiled template function
     * @param {object} helpers - Map of helper functions
     * @param {object} context - Base data object
     * @param {function} templateFunction - Compiled template function
     * @returns {string}
     */
    function runtime(helpers, context, templateFunction) {
      return guard(templateFunction(helpers, context, guard, iter, helper)).toString();
    }

    // polyfill for Promise.try
    if (typeof Promise.try !== 'function') {
      Promise.try = {
        try: function _try(fn) {
          return new Promise(function (resolve) {
            return resolve(fn());
          });
        }
      }.try;
    }

    return runtime;
  }();

  'use strict';

  /** @exports Benchpress */
  var Benchpress = {};

  Benchpress.runtime = runtime;

  Benchpress.helpers = {};

  /**
   * Register a helper function
   * @param {string} name - Helper name
   * @param {function} fn - Helper function
   */
  Benchpress.registerHelper = function registerHelper(name, fn) {
    Benchpress.helpers[name] = fn;
  };

  // add default escape function for escaping HTML entities
  var escapeCharMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  var replaceChar = function replaceChar(c) {
    return escapeCharMap[c];
  };
  
  var escapeChars = /[&<>"'`=]/g;

  Benchpress.registerHelper('__escape', function (str) {
    if (str == null) {
      return '';
    }
    if (!str) {
      return String(str);
    }

    return str.toString().replace(escapeChars, replaceChar);
  });

  Benchpress.cache = {};

  Benchpress.globals = {};

  /**
   * Set a global data value
   * @param {string} key - Property key
   * @param {Object} value - Property value
   */
  Benchpress.setGlobal = function setGlobal(key, value) {
    Benchpress.globals[key] = value;
  };

  var assign = Object.assign || jQuery.extend; // eslint-disable-line

  /**
   * @private
   */
  Benchpress.addGlobals = function addGlobals(data) {
    return assign({}, Benchpress.globals, data);
  };

  /**
   * Clear the template cache
   */
  Benchpress.flush = function flush() {
    Benchpress.cache = {};
  };

  // necessary to support both promises and callbacks
  // can remove when `parse` methods are removed
  function load(template) {
    return new Promise(function (resolve, reject) {
      var promise = Benchpress.loader(template, function (templateFunction) {
        resolve(templateFunction);
      });

      if (promise && promise.then) {
        promise.then(resolve, reject);
      }
    });
  }

  /**
   * Fetch and run the given template
   * @param {string} template - Name of template to fetch
   * @param {Object} data - Data with which to run the template
   * @param {string} [block] - Parse only this block in the template
   * @returns {Promise<string>} - Rendered output
   */
  function render(template, data, block) {
    data = Benchpress.addGlobals(data || {});

    return Promise.try(function () {
      Benchpress.cache[template] = Benchpress.cache[template] || load(template);
      return Benchpress.cache[template];
    }).then(function (templateFunction) {
      if (block) {
        templateFunction = templateFunction.blocks && templateFunction.blocks[block];
      }
      if (!templateFunction) {
        return '';
      }

      return runtime(Benchpress.helpers, data, templateFunction);
    });
  }

  /**
   * Alias for {@link render}, but uses a callback
   * @param {string} template - Name of template to fetch
   * @param {string} [block] - Render only this block in the template
   * @param {Object} data - Data with which to run the template
   * @param {function} callback - callback(output)
   *
   * @deprecated - Use {@link render} instead
   */
  function parse(template, block, data, callback) {
    if (!callback && typeof block === 'object' && typeof data === 'function') {
      callback = data;
      data = block;
      block = null;
    }
    if (typeof callback !== 'function') {
      // Calling parse synchronously with no callback is discontinued
      throw TypeError('Invalid Arguments: callback must be a function');
    }
    if (!template) {
      callback('');
      return;
    }

    render(template, data, block).then(function (output) {
      return setTimeout(callback, 0, output);
    }, function (err) {
      return console.error(err);
    } // eslint-disable-line no-console
    );
  }

  Benchpress.render = render;
  Benchpress.parse = parse;

  /**
   * Register a loader function to fetch templates
   * - `loader(name, callback) => callback(templateFunction)`
   * - `loader(name) => Promise<templateFunction>`
   * @param {function} loader
   */
  Benchpress.registerLoader = function registerLoader(loader) {
    Benchpress.loader = loader;
  };

  return skylark.attach("itg.benchpress",Benchpress);

});