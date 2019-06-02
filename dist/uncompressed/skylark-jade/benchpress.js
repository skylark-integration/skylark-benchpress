define([], function () {
    'use strict';
    var exports = {};
    var module = { exports: {} };
    define(['skylark-langx/skylark'], function (skylark) {
        var runtime = function () {
            function guard(value) {
                return value == null || Array.isArray(value) && value.length === 0 ? '' : value;
            }
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
            function runtime(helpers, context, templateFunction) {
                return guard(templateFunction(helpers, context, guard, iter, helper)).toString();
            }
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
        var Benchpress = typeof module === 'object' && module.exports ? module.exports : {};
        Benchpress.runtime = runtime;
        Benchpress.helpers = {};
        Benchpress.registerHelper = function registerHelper(name, fn) {
            Benchpress.helpers[name] = fn;
        };
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
        Benchpress.setGlobal = function setGlobal(key, value) {
            Benchpress.globals[key] = value;
        };
        var assign = Object.assign || jQuery.extend;
        Benchpress.addGlobals = function addGlobals(data) {
            return assign({}, Benchpress.globals, data);
        };
        Benchpress.flush = function flush() {
            Benchpress.cache = {};
        };
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
        function parse(template, block, data, callback) {
            if (!callback && typeof block === 'object' && typeof data === 'function') {
                callback = data;
                data = block;
                block = null;
            }
            if (typeof callback !== 'function') {
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
            });
        }
        Benchpress.render = render;
        Benchpress.parse = parse;
        Benchpress.registerLoader = function registerLoader(loader) {
            Benchpress.loader = loader;
        };
        return skylark.attach('itg.benchpress', Benchpress);
    });
    function __isEmptyObject(obj) {
        var attr;
        for (attr in obj)
            return !1;
        return !0;
    }
    function __isValidToReturn(obj) {
        return typeof obj != 'object' || Array.isArray(obj) || !__isEmptyObject(obj);
    }
    if (__isValidToReturn(module.exports))
        return module.exports;
    else if (__isValidToReturn(exports))
        return exports;
});