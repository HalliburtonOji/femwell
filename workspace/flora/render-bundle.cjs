var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.production.min.js
var require_react_production_min = __commonJS({
  "node_modules/react/cjs/react.production.min.js"(exports2) {
    "use strict";
    var l = Symbol.for("react.element");
    var n = Symbol.for("react.portal");
    var p = Symbol.for("react.fragment");
    var q = Symbol.for("react.strict_mode");
    var r = Symbol.for("react.profiler");
    var t = Symbol.for("react.provider");
    var u = Symbol.for("react.context");
    var v = Symbol.for("react.forward_ref");
    var w = Symbol.for("react.suspense");
    var x = Symbol.for("react.memo");
    var y = Symbol.for("react.lazy");
    var z = Symbol.iterator;
    function A(a) {
      if (null === a || "object" !== typeof a) return null;
      a = z && a[z] || a["@@iterator"];
      return "function" === typeof a ? a : null;
    }
    var B = { isMounted: function() {
      return false;
    }, enqueueForceUpdate: function() {
    }, enqueueReplaceState: function() {
    }, enqueueSetState: function() {
    } };
    var C = Object.assign;
    var D = {};
    function E(a, b, e) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e || B;
    }
    E.prototype.isReactComponent = {};
    E.prototype.setState = function(a, b) {
      if ("object" !== typeof a && "function" !== typeof a && null != a) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
      this.updater.enqueueSetState(this, a, b, "setState");
    };
    E.prototype.forceUpdate = function(a) {
      this.updater.enqueueForceUpdate(this, a, "forceUpdate");
    };
    function F() {
    }
    F.prototype = E.prototype;
    function G(a, b, e) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e || B;
    }
    var H = G.prototype = new F();
    H.constructor = G;
    C(H, E.prototype);
    H.isPureReactComponent = true;
    var I = Array.isArray;
    var J = Object.prototype.hasOwnProperty;
    var K = { current: null };
    var L = { key: true, ref: true, __self: true, __source: true };
    function M(a, b, e) {
      var d, c = {}, k = null, h = null;
      if (null != b) for (d in void 0 !== b.ref && (h = b.ref), void 0 !== b.key && (k = "" + b.key), b) J.call(b, d) && !L.hasOwnProperty(d) && (c[d] = b[d]);
      var g = arguments.length - 2;
      if (1 === g) c.children = e;
      else if (1 < g) {
        for (var f = Array(g), m = 0; m < g; m++) f[m] = arguments[m + 2];
        c.children = f;
      }
      if (a && a.defaultProps) for (d in g = a.defaultProps, g) void 0 === c[d] && (c[d] = g[d]);
      return { $$typeof: l, type: a, key: k, ref: h, props: c, _owner: K.current };
    }
    function N(a, b) {
      return { $$typeof: l, type: a.type, key: b, ref: a.ref, props: a.props, _owner: a._owner };
    }
    function O(a) {
      return "object" === typeof a && null !== a && a.$$typeof === l;
    }
    function escape(a) {
      var b = { "=": "=0", ":": "=2" };
      return "$" + a.replace(/[=:]/g, function(a2) {
        return b[a2];
      });
    }
    var P = /\/+/g;
    function Q(a, b) {
      return "object" === typeof a && null !== a && null != a.key ? escape("" + a.key) : b.toString(36);
    }
    function R(a, b, e, d, c) {
      var k = typeof a;
      if ("undefined" === k || "boolean" === k) a = null;
      var h = false;
      if (null === a) h = true;
      else switch (k) {
        case "string":
        case "number":
          h = true;
          break;
        case "object":
          switch (a.$$typeof) {
            case l:
            case n:
              h = true;
          }
      }
      if (h) return h = a, c = c(h), a = "" === d ? "." + Q(h, 0) : d, I(c) ? (e = "", null != a && (e = a.replace(P, "$&/") + "/"), R(c, b, e, "", function(a2) {
        return a2;
      })) : null != c && (O(c) && (c = N(c, e + (!c.key || h && h.key === c.key ? "" : ("" + c.key).replace(P, "$&/") + "/") + a)), b.push(c)), 1;
      h = 0;
      d = "" === d ? "." : d + ":";
      if (I(a)) for (var g = 0; g < a.length; g++) {
        k = a[g];
        var f = d + Q(k, g);
        h += R(k, b, e, f, c);
      }
      else if (f = A(a), "function" === typeof f) for (a = f.call(a), g = 0; !(k = a.next()).done; ) k = k.value, f = d + Q(k, g++), h += R(k, b, e, f, c);
      else if ("object" === k) throw b = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
      return h;
    }
    function S(a, b, e) {
      if (null == a) return a;
      var d = [], c = 0;
      R(a, d, "", "", function(a2) {
        return b.call(e, a2, c++);
      });
      return d;
    }
    function T2(a) {
      if (-1 === a._status) {
        var b = a._result;
        b = b();
        b.then(function(b2) {
          if (0 === a._status || -1 === a._status) a._status = 1, a._result = b2;
        }, function(b2) {
          if (0 === a._status || -1 === a._status) a._status = 2, a._result = b2;
        });
        -1 === a._status && (a._status = 0, a._result = b);
      }
      if (1 === a._status) return a._result.default;
      throw a._result;
    }
    var U = { current: null };
    var V = { transition: null };
    var W = { ReactCurrentDispatcher: U, ReactCurrentBatchConfig: V, ReactCurrentOwner: K };
    function X() {
      throw Error("act(...) is not supported in production builds of React.");
    }
    exports2.Children = { map: S, forEach: function(a, b, e) {
      S(a, function() {
        b.apply(this, arguments);
      }, e);
    }, count: function(a) {
      var b = 0;
      S(a, function() {
        b++;
      });
      return b;
    }, toArray: function(a) {
      return S(a, function(a2) {
        return a2;
      }) || [];
    }, only: function(a) {
      if (!O(a)) throw Error("React.Children.only expected to receive a single React element child.");
      return a;
    } };
    exports2.Component = E;
    exports2.Fragment = p;
    exports2.Profiler = r;
    exports2.PureComponent = G;
    exports2.StrictMode = q;
    exports2.Suspense = w;
    exports2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W;
    exports2.act = X;
    exports2.cloneElement = function(a, b, e) {
      if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
      var d = C({}, a.props), c = a.key, k = a.ref, h = a._owner;
      if (null != b) {
        void 0 !== b.ref && (k = b.ref, h = K.current);
        void 0 !== b.key && (c = "" + b.key);
        if (a.type && a.type.defaultProps) var g = a.type.defaultProps;
        for (f in b) J.call(b, f) && !L.hasOwnProperty(f) && (d[f] = void 0 === b[f] && void 0 !== g ? g[f] : b[f]);
      }
      var f = arguments.length - 2;
      if (1 === f) d.children = e;
      else if (1 < f) {
        g = Array(f);
        for (var m = 0; m < f; m++) g[m] = arguments[m + 2];
        d.children = g;
      }
      return { $$typeof: l, type: a.type, key: c, ref: k, props: d, _owner: h };
    };
    exports2.createContext = function(a) {
      a = { $$typeof: u, _currentValue: a, _currentValue2: a, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
      a.Provider = { $$typeof: t, _context: a };
      return a.Consumer = a;
    };
    exports2.createElement = M;
    exports2.createFactory = function(a) {
      var b = M.bind(null, a);
      b.type = a;
      return b;
    };
    exports2.createRef = function() {
      return { current: null };
    };
    exports2.forwardRef = function(a) {
      return { $$typeof: v, render: a };
    };
    exports2.isValidElement = O;
    exports2.lazy = function(a) {
      return { $$typeof: y, _payload: { _status: -1, _result: a }, _init: T2 };
    };
    exports2.memo = function(a, b) {
      return { $$typeof: x, type: a, compare: void 0 === b ? null : b };
    };
    exports2.startTransition = function(a) {
      var b = V.transition;
      V.transition = {};
      try {
        a();
      } finally {
        V.transition = b;
      }
    };
    exports2.unstable_act = X;
    exports2.useCallback = function(a, b) {
      return U.current.useCallback(a, b);
    };
    exports2.useContext = function(a) {
      return U.current.useContext(a);
    };
    exports2.useDebugValue = function() {
    };
    exports2.useDeferredValue = function(a) {
      return U.current.useDeferredValue(a);
    };
    exports2.useEffect = function(a, b) {
      return U.current.useEffect(a, b);
    };
    exports2.useId = function() {
      return U.current.useId();
    };
    exports2.useImperativeHandle = function(a, b, e) {
      return U.current.useImperativeHandle(a, b, e);
    };
    exports2.useInsertionEffect = function(a, b) {
      return U.current.useInsertionEffect(a, b);
    };
    exports2.useLayoutEffect = function(a, b) {
      return U.current.useLayoutEffect(a, b);
    };
    exports2.useMemo = function(a, b) {
      return U.current.useMemo(a, b);
    };
    exports2.useReducer = function(a, b, e) {
      return U.current.useReducer(a, b, e);
    };
    exports2.useRef = function(a) {
      return U.current.useRef(a);
    };
    exports2.useState = function(a) {
      return U.current.useState(a);
    };
    exports2.useSyncExternalStore = function(a, b, e) {
      return U.current.useSyncExternalStore(a, b, e);
    };
    exports2.useTransition = function() {
      return U.current.useTransition();
    };
    exports2.version = "18.3.1";
  }
});

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports2, module2) {
    "use strict";
    if (process.env.NODE_ENV !== "production") {
      (function() {
        "use strict";
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
        }
        var ReactVersion = "18.3.1";
        var REACT_ELEMENT_TYPE = Symbol.for("react.element");
        var REACT_PORTAL_TYPE = Symbol.for("react.portal");
        var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
        var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
        var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
        var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
        var REACT_CONTEXT_TYPE = Symbol.for("react.context");
        var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
        var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
        var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
        var REACT_MEMO_TYPE = Symbol.for("react.memo");
        var REACT_LAZY_TYPE = Symbol.for("react.lazy");
        var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
        var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        var FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          if (maybeIterable === null || typeof maybeIterable !== "object") {
            return null;
          }
          var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
          if (typeof maybeIterator === "function") {
            return maybeIterator;
          }
          return null;
        }
        var ReactCurrentDispatcher = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactCurrentBatchConfig = {
          transition: null
        };
        var ReactCurrentActQueue = {
          current: null,
          // Used to reproduce behavior of `batchedUpdates` in legacy mode.
          isBatchingLegacy: false,
          didScheduleLegacyUpdate: false
        };
        var ReactCurrentOwner = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactDebugCurrentFrame = {};
        var currentExtraStackFrame = null;
        function setExtraStackFrame(stack) {
          {
            currentExtraStackFrame = stack;
          }
        }
        {
          ReactDebugCurrentFrame.setExtraStackFrame = function(stack) {
            {
              currentExtraStackFrame = stack;
            }
          };
          ReactDebugCurrentFrame.getCurrentStack = null;
          ReactDebugCurrentFrame.getStackAddendum = function() {
            var stack = "";
            if (currentExtraStackFrame) {
              stack += currentExtraStackFrame;
            }
            var impl = ReactDebugCurrentFrame.getCurrentStack;
            if (impl) {
              stack += impl() || "";
            }
            return stack;
          };
        }
        var enableScopeAPI = false;
        var enableCacheElement = false;
        var enableTransitionTracing = false;
        var enableLegacyHidden = false;
        var enableDebugTracing = false;
        var ReactSharedInternals = {
          ReactCurrentDispatcher,
          ReactCurrentBatchConfig,
          ReactCurrentOwner
        };
        {
          ReactSharedInternals.ReactDebugCurrentFrame = ReactDebugCurrentFrame;
          ReactSharedInternals.ReactCurrentActQueue = ReactCurrentActQueue;
        }
        function warn(format) {
          {
            {
              for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }
              printWarning("warn", format, args);
            }
          }
        }
        function error(format) {
          {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame2.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            var argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        var didWarnStateUpdateForUnmountedComponent = {};
        function warnNoop(publicInstance, callerName) {
          {
            var _constructor = publicInstance.constructor;
            var componentName = _constructor && (_constructor.displayName || _constructor.name) || "ReactClass";
            var warningKey = componentName + "." + callerName;
            if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
              return;
            }
            error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", callerName, componentName);
            didWarnStateUpdateForUnmountedComponent[warningKey] = true;
          }
        }
        var ReactNoopUpdateQueue = {
          /**
           * Checks whether or not this composite component is mounted.
           * @param {ReactClass} publicInstance The instance we want to test.
           * @return {boolean} True if mounted, false otherwise.
           * @protected
           * @final
           */
          isMounted: function(publicInstance) {
            return false;
          },
          /**
           * Forces an update. This should only be invoked when it is known with
           * certainty that we are **not** in a DOM transaction.
           *
           * You may want to call this when you know that some deeper aspect of the
           * component's state has changed but `setState` was not called.
           *
           * This will not invoke `shouldComponentUpdate`, but it will invoke
           * `componentWillUpdate` and `componentDidUpdate`.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueForceUpdate: function(publicInstance, callback, callerName) {
            warnNoop(publicInstance, "forceUpdate");
          },
          /**
           * Replaces all of the state. Always use this or `setState` to mutate state.
           * You should treat `this.state` as immutable.
           *
           * There is no guarantee that `this.state` will be immediately updated, so
           * accessing `this.state` after calling this method may return the old value.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} completeState Next state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueReplaceState: function(publicInstance, completeState, callback, callerName) {
            warnNoop(publicInstance, "replaceState");
          },
          /**
           * Sets a subset of the state. This only exists because _pendingState is
           * internal. This provides a merging strategy that is not available to deep
           * properties which is confusing. TODO: Expose pendingState or don't use it
           * during the merge.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} partialState Next partial state to be merged with state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} Name of the calling function in the public API.
           * @internal
           */
          enqueueSetState: function(publicInstance, partialState, callback, callerName) {
            warnNoop(publicInstance, "setState");
          }
        };
        var assign = Object.assign;
        var emptyObject = {};
        {
          Object.freeze(emptyObject);
        }
        function Component(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        Component.prototype.isReactComponent = {};
        Component.prototype.setState = function(partialState, callback) {
          if (typeof partialState !== "object" && typeof partialState !== "function" && partialState != null) {
            throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
          }
          this.updater.enqueueSetState(this, partialState, callback, "setState");
        };
        Component.prototype.forceUpdate = function(callback) {
          this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
        };
        {
          var deprecatedAPIs = {
            isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
            replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
          };
          var defineDeprecationWarning = function(methodName, info) {
            Object.defineProperty(Component.prototype, methodName, {
              get: function() {
                warn("%s(...) is deprecated in plain JavaScript React classes. %s", info[0], info[1]);
                return void 0;
              }
            });
          };
          for (var fnName in deprecatedAPIs) {
            if (deprecatedAPIs.hasOwnProperty(fnName)) {
              defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
            }
          }
        }
        function ComponentDummy() {
        }
        ComponentDummy.prototype = Component.prototype;
        function PureComponent(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
        pureComponentPrototype.constructor = PureComponent;
        assign(pureComponentPrototype, Component.prototype);
        pureComponentPrototype.isPureReactComponent = true;
        function createRef() {
          var refObject = {
            current: null
          };
          {
            Object.seal(refObject);
          }
          return refObject;
        }
        var isArrayImpl = Array.isArray;
        function isArray(a) {
          return isArrayImpl(a);
        }
        function typeName(value) {
          {
            var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
            var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            return type;
          }
        }
        function willCoercionThrow(value) {
          {
            try {
              testStringCoercion(value);
              return false;
            } catch (e) {
              return true;
            }
          }
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkKeyStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function getWrappedName(outerType, innerType, wrapperName) {
          var displayName = outerType.displayName;
          if (displayName) {
            return displayName;
          }
          var functionName = innerType.displayName || innerType.name || "";
          return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
        }
        function getContextName(type) {
          return type.displayName || "Context";
        }
        function getComponentNameFromType(type) {
          if (type == null) {
            return null;
          }
          {
            if (typeof type.tag === "number") {
              error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
            }
          }
          if (typeof type === "function") {
            return type.displayName || type.name || null;
          }
          if (typeof type === "string") {
            return type;
          }
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                var context = type;
                return getContextName(context) + ".Consumer";
              case REACT_PROVIDER_TYPE:
                var provider = type;
                return getContextName(provider._context) + ".Provider";
              case REACT_FORWARD_REF_TYPE:
                return getWrappedName(type, type.render, "ForwardRef");
              case REACT_MEMO_TYPE:
                var outerName = type.displayName || null;
                if (outerName !== null) {
                  return outerName;
                }
                return getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return getComponentNameFromType(init(payload));
                } catch (x) {
                  return null;
                }
              }
            }
          }
          return null;
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var RESERVED_PROPS = {
          key: true,
          ref: true,
          __self: true,
          __source: true
        };
        var specialPropKeyWarningShown, specialPropRefWarningShown, didWarnAboutStringRefs;
        {
          didWarnAboutStringRefs = {};
        }
        function hasValidRef(config) {
          {
            if (hasOwnProperty.call(config, "ref")) {
              var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.ref !== void 0;
        }
        function hasValidKey(config) {
          {
            if (hasOwnProperty.call(config, "key")) {
              var getter = Object.getOwnPropertyDescriptor(config, "key").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.key !== void 0;
        }
        function defineKeyPropWarningGetter(props, displayName) {
          var warnAboutAccessingKey = function() {
            {
              if (!specialPropKeyWarningShown) {
                specialPropKeyWarningShown = true;
                error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingKey.isReactWarning = true;
          Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: true
          });
        }
        function defineRefPropWarningGetter(props, displayName) {
          var warnAboutAccessingRef = function() {
            {
              if (!specialPropRefWarningShown) {
                specialPropRefWarningShown = true;
                error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingRef.isReactWarning = true;
          Object.defineProperty(props, "ref", {
            get: warnAboutAccessingRef,
            configurable: true
          });
        }
        function warnIfStringRefCannotBeAutoConverted(config) {
          {
            if (typeof config.ref === "string" && ReactCurrentOwner.current && config.__self && ReactCurrentOwner.current.stateNode !== config.__self) {
              var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);
              if (!didWarnAboutStringRefs[componentName]) {
                error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', componentName, config.ref);
                didWarnAboutStringRefs[componentName] = true;
              }
            }
          }
        }
        var ReactElement = function(type, key, ref, self, source, owner, props) {
          var element = {
            // This tag allows us to uniquely identify this as a React Element
            $$typeof: REACT_ELEMENT_TYPE,
            // Built-in properties that belong on the element
            type,
            key,
            ref,
            props,
            // Record the component responsible for creating this element.
            _owner: owner
          };
          {
            element._store = {};
            Object.defineProperty(element._store, "validated", {
              configurable: false,
              enumerable: false,
              writable: true,
              value: false
            });
            Object.defineProperty(element, "_self", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: self
            });
            Object.defineProperty(element, "_source", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: source
            });
            if (Object.freeze) {
              Object.freeze(element.props);
              Object.freeze(element);
            }
          }
          return element;
        };
        function createElement(type, config, children) {
          var propName;
          var props = {};
          var key = null;
          var ref = null;
          var self = null;
          var source = null;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              {
                warnIfStringRefCannotBeAutoConverted(config);
              }
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            self = config.__self === void 0 ? null : config.__self;
            source = config.__source === void 0 ? null : config.__source;
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName];
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i = 0; i < childrenLength; i++) {
              childArray[i] = arguments[i + 2];
            }
            {
              if (Object.freeze) {
                Object.freeze(childArray);
              }
            }
            props.children = childArray;
          }
          if (type && type.defaultProps) {
            var defaultProps = type.defaultProps;
            for (propName in defaultProps) {
              if (props[propName] === void 0) {
                props[propName] = defaultProps[propName];
              }
            }
          }
          {
            if (key || ref) {
              var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
              if (key) {
                defineKeyPropWarningGetter(props, displayName);
              }
              if (ref) {
                defineRefPropWarningGetter(props, displayName);
              }
            }
          }
          return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
        }
        function cloneAndReplaceKey(oldElement, newKey) {
          var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
          return newElement;
        }
        function cloneElement(element, config, children) {
          if (element === null || element === void 0) {
            throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + element + ".");
          }
          var propName;
          var props = assign({}, element.props);
          var key = element.key;
          var ref = element.ref;
          var self = element._self;
          var source = element._source;
          var owner = element._owner;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              owner = ReactCurrentOwner.current;
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            var defaultProps;
            if (element.type && element.type.defaultProps) {
              defaultProps = element.type.defaultProps;
            }
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                if (config[propName] === void 0 && defaultProps !== void 0) {
                  props[propName] = defaultProps[propName];
                } else {
                  props[propName] = config[propName];
                }
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i = 0; i < childrenLength; i++) {
              childArray[i] = arguments[i + 2];
            }
            props.children = childArray;
          }
          return ReactElement(element.type, key, ref, self, source, owner, props);
        }
        function isValidElement(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        var SEPARATOR = ".";
        var SUBSEPARATOR = ":";
        function escape(key) {
          var escapeRegex = /[=:]/g;
          var escaperLookup = {
            "=": "=0",
            ":": "=2"
          };
          var escapedString = key.replace(escapeRegex, function(match) {
            return escaperLookup[match];
          });
          return "$" + escapedString;
        }
        var didWarnAboutMaps = false;
        var userProvidedKeyEscapeRegex = /\/+/g;
        function escapeUserProvidedKey(text) {
          return text.replace(userProvidedKeyEscapeRegex, "$&/");
        }
        function getElementKey(element, index) {
          if (typeof element === "object" && element !== null && element.key != null) {
            {
              checkKeyStringCoercion(element.key);
            }
            return escape("" + element.key);
          }
          return index.toString(36);
        }
        function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
          var type = typeof children;
          if (type === "undefined" || type === "boolean") {
            children = null;
          }
          var invokeCallback = false;
          if (children === null) {
            invokeCallback = true;
          } else {
            switch (type) {
              case "string":
              case "number":
                invokeCallback = true;
                break;
              case "object":
                switch (children.$$typeof) {
                  case REACT_ELEMENT_TYPE:
                  case REACT_PORTAL_TYPE:
                    invokeCallback = true;
                }
            }
          }
          if (invokeCallback) {
            var _child = children;
            var mappedChild = callback(_child);
            var childKey = nameSoFar === "" ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;
            if (isArray(mappedChild)) {
              var escapedChildKey = "";
              if (childKey != null) {
                escapedChildKey = escapeUserProvidedKey(childKey) + "/";
              }
              mapIntoArray(mappedChild, array, escapedChildKey, "", function(c) {
                return c;
              });
            } else if (mappedChild != null) {
              if (isValidElement(mappedChild)) {
                {
                  if (mappedChild.key && (!_child || _child.key !== mappedChild.key)) {
                    checkKeyStringCoercion(mappedChild.key);
                  }
                }
                mappedChild = cloneAndReplaceKey(
                  mappedChild,
                  // Keep both the (mapped) and old keys if they differ, just as
                  // traverseAllChildren used to do for objects as children
                  escapedPrefix + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
                  (mappedChild.key && (!_child || _child.key !== mappedChild.key) ? (
                    // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
                    // eslint-disable-next-line react-internal/safe-string-coercion
                    escapeUserProvidedKey("" + mappedChild.key) + "/"
                  ) : "") + childKey
                );
              }
              array.push(mappedChild);
            }
            return 1;
          }
          var child;
          var nextName;
          var subtreeCount = 0;
          var nextNamePrefix = nameSoFar === "" ? SEPARATOR : nameSoFar + SUBSEPARATOR;
          if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
              child = children[i];
              nextName = nextNamePrefix + getElementKey(child, i);
              subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
            }
          } else {
            var iteratorFn = getIteratorFn(children);
            if (typeof iteratorFn === "function") {
              var iterableChildren = children;
              {
                if (iteratorFn === iterableChildren.entries) {
                  if (!didWarnAboutMaps) {
                    warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead.");
                  }
                  didWarnAboutMaps = true;
                }
              }
              var iterator = iteratorFn.call(iterableChildren);
              var step;
              var ii = 0;
              while (!(step = iterator.next()).done) {
                child = step.value;
                nextName = nextNamePrefix + getElementKey(child, ii++);
                subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
              }
            } else if (type === "object") {
              var childrenString = String(children);
              throw new Error("Objects are not valid as a React child (found: " + (childrenString === "[object Object]" ? "object with keys {" + Object.keys(children).join(", ") + "}" : childrenString) + "). If you meant to render a collection of children, use an array instead.");
            }
          }
          return subtreeCount;
        }
        function mapChildren(children, func, context) {
          if (children == null) {
            return children;
          }
          var result = [];
          var count = 0;
          mapIntoArray(children, result, "", "", function(child) {
            return func.call(context, child, count++);
          });
          return result;
        }
        function countChildren(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        }
        function forEachChildren(children, forEachFunc, forEachContext) {
          mapChildren(children, function() {
            forEachFunc.apply(this, arguments);
          }, forEachContext);
        }
        function toArray(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        }
        function onlyChild(children) {
          if (!isValidElement(children)) {
            throw new Error("React.Children.only expected to receive a single React element child.");
          }
          return children;
        }
        function createContext(defaultValue) {
          var context = {
            $$typeof: REACT_CONTEXT_TYPE,
            // As a workaround to support multiple concurrent renderers, we categorize
            // some renderers as primary and others as secondary. We only expect
            // there to be two concurrent renderers at most: React Native (primary) and
            // Fabric (secondary); React DOM (primary) and React ART (secondary).
            // Secondary renderers store their context values on separate fields.
            _currentValue: defaultValue,
            _currentValue2: defaultValue,
            // Used to track how many concurrent renderers this context currently
            // supports within in a single renderer. Such as parallel server rendering.
            _threadCount: 0,
            // These are circular
            Provider: null,
            Consumer: null,
            // Add these to use same hidden class in VM as ServerContext
            _defaultValue: null,
            _globalName: null
          };
          context.Provider = {
            $$typeof: REACT_PROVIDER_TYPE,
            _context: context
          };
          var hasWarnedAboutUsingNestedContextConsumers = false;
          var hasWarnedAboutUsingConsumerProvider = false;
          var hasWarnedAboutDisplayNameOnConsumer = false;
          {
            var Consumer = {
              $$typeof: REACT_CONTEXT_TYPE,
              _context: context
            };
            Object.defineProperties(Consumer, {
              Provider: {
                get: function() {
                  if (!hasWarnedAboutUsingConsumerProvider) {
                    hasWarnedAboutUsingConsumerProvider = true;
                    error("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?");
                  }
                  return context.Provider;
                },
                set: function(_Provider) {
                  context.Provider = _Provider;
                }
              },
              _currentValue: {
                get: function() {
                  return context._currentValue;
                },
                set: function(_currentValue) {
                  context._currentValue = _currentValue;
                }
              },
              _currentValue2: {
                get: function() {
                  return context._currentValue2;
                },
                set: function(_currentValue2) {
                  context._currentValue2 = _currentValue2;
                }
              },
              _threadCount: {
                get: function() {
                  return context._threadCount;
                },
                set: function(_threadCount) {
                  context._threadCount = _threadCount;
                }
              },
              Consumer: {
                get: function() {
                  if (!hasWarnedAboutUsingNestedContextConsumers) {
                    hasWarnedAboutUsingNestedContextConsumers = true;
                    error("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?");
                  }
                  return context.Consumer;
                }
              },
              displayName: {
                get: function() {
                  return context.displayName;
                },
                set: function(displayName) {
                  if (!hasWarnedAboutDisplayNameOnConsumer) {
                    warn("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", displayName);
                    hasWarnedAboutDisplayNameOnConsumer = true;
                  }
                }
              }
            });
            context.Consumer = Consumer;
          }
          {
            context._currentRenderer = null;
            context._currentRenderer2 = null;
          }
          return context;
        }
        var Uninitialized = -1;
        var Pending = 0;
        var Resolved = 1;
        var Rejected = 2;
        function lazyInitializer(payload) {
          if (payload._status === Uninitialized) {
            var ctor = payload._result;
            var thenable = ctor();
            thenable.then(function(moduleObject2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var resolved = payload;
                resolved._status = Resolved;
                resolved._result = moduleObject2;
              }
            }, function(error2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var rejected = payload;
                rejected._status = Rejected;
                rejected._result = error2;
              }
            });
            if (payload._status === Uninitialized) {
              var pending = payload;
              pending._status = Pending;
              pending._result = thenable;
            }
          }
          if (payload._status === Resolved) {
            var moduleObject = payload._result;
            {
              if (moduleObject === void 0) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?", moduleObject);
              }
            }
            {
              if (!("default" in moduleObject)) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))", moduleObject);
              }
            }
            return moduleObject.default;
          } else {
            throw payload._result;
          }
        }
        function lazy(ctor) {
          var payload = {
            // We use these fields to store the result.
            _status: Uninitialized,
            _result: ctor
          };
          var lazyType = {
            $$typeof: REACT_LAZY_TYPE,
            _payload: payload,
            _init: lazyInitializer
          };
          {
            var defaultProps;
            var propTypes;
            Object.defineProperties(lazyType, {
              defaultProps: {
                configurable: true,
                get: function() {
                  return defaultProps;
                },
                set: function(newDefaultProps) {
                  error("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  defaultProps = newDefaultProps;
                  Object.defineProperty(lazyType, "defaultProps", {
                    enumerable: true
                  });
                }
              },
              propTypes: {
                configurable: true,
                get: function() {
                  return propTypes;
                },
                set: function(newPropTypes) {
                  error("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  propTypes = newPropTypes;
                  Object.defineProperty(lazyType, "propTypes", {
                    enumerable: true
                  });
                }
              }
            });
          }
          return lazyType;
        }
        function forwardRef(render) {
          {
            if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
              error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).");
            } else if (typeof render !== "function") {
              error("forwardRef requires a render function but was given %s.", render === null ? "null" : typeof render);
            } else {
              if (render.length !== 0 && render.length !== 2) {
                error("forwardRef render functions accept exactly two parameters: props and ref. %s", render.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.");
              }
            }
            if (render != null) {
              if (render.defaultProps != null || render.propTypes != null) {
                error("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
              }
            }
          }
          var elementType = {
            $$typeof: REACT_FORWARD_REF_TYPE,
            render
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!render.name && !render.displayName) {
                  render.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        var REACT_MODULE_REFERENCE;
        {
          REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
        }
        function isValidElementType(type) {
          if (typeof type === "string" || typeof type === "function") {
            return true;
          }
          if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
            return true;
          }
          if (typeof type === "object" && type !== null) {
            if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
            // types supported by any Flight configuration anywhere since
            // we don't know which Flight build this will end up being used
            // with.
            type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
              return true;
            }
          }
          return false;
        }
        function memo(type, compare) {
          {
            if (!isValidElementType(type)) {
              error("memo: The first argument must be a component. Instead received: %s", type === null ? "null" : typeof type);
            }
          }
          var elementType = {
            $$typeof: REACT_MEMO_TYPE,
            type,
            compare: compare === void 0 ? null : compare
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!type.name && !type.displayName) {
                  type.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        function resolveDispatcher() {
          var dispatcher = ReactCurrentDispatcher.current;
          {
            if (dispatcher === null) {
              error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
            }
          }
          return dispatcher;
        }
        function useContext(Context) {
          var dispatcher = resolveDispatcher();
          {
            if (Context._context !== void 0) {
              var realContext = Context._context;
              if (realContext.Consumer === Context) {
                error("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?");
              } else if (realContext.Provider === Context) {
                error("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
              }
            }
          }
          return dispatcher.useContext(Context);
        }
        function useState(initialState) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useState(initialState);
        }
        function useReducer(reducer, initialArg, init) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useReducer(reducer, initialArg, init);
        }
        function useRef(initialValue) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useRef(initialValue);
        }
        function useEffect2(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useEffect(create, deps);
        }
        function useInsertionEffect(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useInsertionEffect(create, deps);
        }
        function useLayoutEffect(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useLayoutEffect(create, deps);
        }
        function useCallback(callback, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useCallback(callback, deps);
        }
        function useMemo(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useMemo(create, deps);
        }
        function useImperativeHandle(ref, create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useImperativeHandle(ref, create, deps);
        }
        function useDebugValue(value, formatterFn) {
          {
            var dispatcher = resolveDispatcher();
            return dispatcher.useDebugValue(value, formatterFn);
          }
        }
        function useTransition() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useTransition();
        }
        function useDeferredValue(value) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useDeferredValue(value);
        }
        function useId() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useId();
        }
        function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
        }
        var disabledDepth = 0;
        var prevLog;
        var prevInfo;
        var prevWarn;
        var prevError;
        var prevGroup;
        var prevGroupCollapsed;
        var prevGroupEnd;
        function disabledLog() {
        }
        disabledLog.__reactDisabledLog = true;
        function disableLogs() {
          {
            if (disabledDepth === 0) {
              prevLog = console.log;
              prevInfo = console.info;
              prevWarn = console.warn;
              prevError = console.error;
              prevGroup = console.group;
              prevGroupCollapsed = console.groupCollapsed;
              prevGroupEnd = console.groupEnd;
              var props = {
                configurable: true,
                enumerable: true,
                value: disabledLog,
                writable: true
              };
              Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
              });
            }
            disabledDepth++;
          }
        }
        function reenableLogs() {
          {
            disabledDepth--;
            if (disabledDepth === 0) {
              var props = {
                configurable: true,
                enumerable: true,
                writable: true
              };
              Object.defineProperties(console, {
                log: assign({}, props, {
                  value: prevLog
                }),
                info: assign({}, props, {
                  value: prevInfo
                }),
                warn: assign({}, props, {
                  value: prevWarn
                }),
                error: assign({}, props, {
                  value: prevError
                }),
                group: assign({}, props, {
                  value: prevGroup
                }),
                groupCollapsed: assign({}, props, {
                  value: prevGroupCollapsed
                }),
                groupEnd: assign({}, props, {
                  value: prevGroupEnd
                })
              });
            }
            if (disabledDepth < 0) {
              error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
            }
          }
        }
        var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
        var prefix;
        function describeBuiltInComponentFrame(name, source, ownerFn) {
          {
            if (prefix === void 0) {
              try {
                throw Error();
              } catch (x) {
                var match = x.stack.trim().match(/\n( *(at )?)/);
                prefix = match && match[1] || "";
              }
            }
            return "\n" + prefix + name;
          }
        }
        var reentry = false;
        var componentFrameCache;
        {
          var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
          componentFrameCache = new PossiblyWeakMap();
        }
        function describeNativeComponentFrame(fn, construct) {
          if (!fn || reentry) {
            return "";
          }
          {
            var frame = componentFrameCache.get(fn);
            if (frame !== void 0) {
              return frame;
            }
          }
          var control;
          reentry = true;
          var previousPrepareStackTrace = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          var previousDispatcher;
          {
            previousDispatcher = ReactCurrentDispatcher$1.current;
            ReactCurrentDispatcher$1.current = null;
            disableLogs();
          }
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if (typeof Reflect === "object" && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x) {
                  control = x;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x) {
                control = x;
              }
              fn();
            }
          } catch (sample) {
            if (sample && control && typeof sample.stack === "string") {
              var sampleLines = sample.stack.split("\n");
              var controlLines = control.stack.split("\n");
              var s = sampleLines.length - 1;
              var c = controlLines.length - 1;
              while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                c--;
              }
              for (; s >= 1 && c >= 0; s--, c--) {
                if (sampleLines[s] !== controlLines[c]) {
                  if (s !== 1 || c !== 1) {
                    do {
                      s--;
                      c--;
                      if (c < 0 || sampleLines[s] !== controlLines[c]) {
                        var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                        if (fn.displayName && _frame.includes("<anonymous>")) {
                          _frame = _frame.replace("<anonymous>", fn.displayName);
                        }
                        {
                          if (typeof fn === "function") {
                            componentFrameCache.set(fn, _frame);
                          }
                        }
                        return _frame;
                      }
                    } while (s >= 1 && c >= 0);
                  }
                  break;
                }
              }
            }
          } finally {
            reentry = false;
            {
              ReactCurrentDispatcher$1.current = previousDispatcher;
              reenableLogs();
            }
            Error.prepareStackTrace = previousPrepareStackTrace;
          }
          var name = fn ? fn.displayName || fn.name : "";
          var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
          {
            if (typeof fn === "function") {
              componentFrameCache.set(fn, syntheticFrame);
            }
          }
          return syntheticFrame;
        }
        function describeFunctionComponentFrame(fn, source, ownerFn) {
          {
            return describeNativeComponentFrame(fn, false);
          }
        }
        function shouldConstruct(Component2) {
          var prototype = Component2.prototype;
          return !!(prototype && prototype.isReactComponent);
        }
        function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
          if (type == null) {
            return "";
          }
          if (typeof type === "function") {
            {
              return describeNativeComponentFrame(type, shouldConstruct(type));
            }
          }
          if (typeof type === "string") {
            return describeBuiltInComponentFrame(type);
          }
          switch (type) {
            case REACT_SUSPENSE_TYPE:
              return describeBuiltInComponentFrame("Suspense");
            case REACT_SUSPENSE_LIST_TYPE:
              return describeBuiltInComponentFrame("SuspenseList");
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE:
                return describeFunctionComponentFrame(type.render);
              case REACT_MEMO_TYPE:
                return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x) {
                }
              }
            }
          }
          return "";
        }
        var loggedTypeFailures = {};
        var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame$1.setExtraStackFrame(null);
            }
          }
        }
        function checkPropTypes(typeSpecs, values, location, componentName, element) {
          {
            var has = Function.call.bind(hasOwnProperty);
            for (var typeSpecName in typeSpecs) {
              if (has(typeSpecs, typeSpecName)) {
                var error$1 = void 0;
                try {
                  if (typeof typeSpecs[typeSpecName] !== "function") {
                    var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                    err.name = "Invariant Violation";
                    throw err;
                  }
                  error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
                } catch (ex) {
                  error$1 = ex;
                }
                if (error$1 && !(error$1 instanceof Error)) {
                  setCurrentlyValidatingElement(element);
                  error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                  setCurrentlyValidatingElement(null);
                }
                if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                  loggedTypeFailures[error$1.message] = true;
                  setCurrentlyValidatingElement(element);
                  error("Failed %s type: %s", location, error$1.message);
                  setCurrentlyValidatingElement(null);
                }
              }
            }
          }
        }
        function setCurrentlyValidatingElement$1(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              setExtraStackFrame(stack);
            } else {
              setExtraStackFrame(null);
            }
          }
        }
        var propTypesMisspellWarningShown;
        {
          propTypesMisspellWarningShown = false;
        }
        function getDeclarationErrorAddendum() {
          if (ReactCurrentOwner.current) {
            var name = getComponentNameFromType(ReactCurrentOwner.current.type);
            if (name) {
              return "\n\nCheck the render method of `" + name + "`.";
            }
          }
          return "";
        }
        function getSourceInfoErrorAddendum(source) {
          if (source !== void 0) {
            var fileName = source.fileName.replace(/^.*[\\\/]/, "");
            var lineNumber = source.lineNumber;
            return "\n\nCheck your code at " + fileName + ":" + lineNumber + ".";
          }
          return "";
        }
        function getSourceInfoErrorAddendumForProps(elementProps) {
          if (elementProps !== null && elementProps !== void 0) {
            return getSourceInfoErrorAddendum(elementProps.__source);
          }
          return "";
        }
        var ownerHasKeyUseWarning = {};
        function getCurrentComponentErrorInfo(parentType) {
          var info = getDeclarationErrorAddendum();
          if (!info) {
            var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
            if (parentName) {
              info = "\n\nCheck the top-level render call using <" + parentName + ">.";
            }
          }
          return info;
        }
        function validateExplicitKey(element, parentType) {
          if (!element._store || element._store.validated || element.key != null) {
            return;
          }
          element._store.validated = true;
          var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
          if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
            return;
          }
          ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
          var childOwner = "";
          if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
            childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
          }
          {
            setCurrentlyValidatingElement$1(element);
            error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
            setCurrentlyValidatingElement$1(null);
          }
        }
        function validateChildKeys(node, parentType) {
          if (typeof node !== "object") {
            return;
          }
          if (isArray(node)) {
            for (var i = 0; i < node.length; i++) {
              var child = node[i];
              if (isValidElement(child)) {
                validateExplicitKey(child, parentType);
              }
            }
          } else if (isValidElement(node)) {
            if (node._store) {
              node._store.validated = true;
            }
          } else if (node) {
            var iteratorFn = getIteratorFn(node);
            if (typeof iteratorFn === "function") {
              if (iteratorFn !== node.entries) {
                var iterator = iteratorFn.call(node);
                var step;
                while (!(step = iterator.next()).done) {
                  if (isValidElement(step.value)) {
                    validateExplicitKey(step.value, parentType);
                  }
                }
              }
            }
          }
        }
        function validatePropTypes(element) {
          {
            var type = element.type;
            if (type === null || type === void 0 || typeof type === "string") {
              return;
            }
            var propTypes;
            if (typeof type === "function") {
              propTypes = type.propTypes;
            } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
            // Inner props are checked in the reconciler.
            type.$$typeof === REACT_MEMO_TYPE)) {
              propTypes = type.propTypes;
            } else {
              return;
            }
            if (propTypes) {
              var name = getComponentNameFromType(type);
              checkPropTypes(propTypes, element.props, "prop", name, element);
            } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
              propTypesMisspellWarningShown = true;
              var _name = getComponentNameFromType(type);
              error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
            }
            if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
              error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
            }
          }
        }
        function validateFragmentProps(fragment) {
          {
            var keys = Object.keys(fragment.props);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              if (key !== "children" && key !== "key") {
                setCurrentlyValidatingElement$1(fragment);
                error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
                setCurrentlyValidatingElement$1(null);
                break;
              }
            }
            if (fragment.ref !== null) {
              setCurrentlyValidatingElement$1(fragment);
              error("Invalid attribute `ref` supplied to `React.Fragment`.");
              setCurrentlyValidatingElement$1(null);
            }
          }
        }
        function createElementWithValidation(type, props, children) {
          var validType = isValidElementType(type);
          if (!validType) {
            var info = "";
            if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
              info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
            }
            var sourceInfo = getSourceInfoErrorAddendumForProps(props);
            if (sourceInfo) {
              info += sourceInfo;
            } else {
              info += getDeclarationErrorAddendum();
            }
            var typeString;
            if (type === null) {
              typeString = "null";
            } else if (isArray(type)) {
              typeString = "array";
            } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
              typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
              info = " Did you accidentally export a JSX literal instead of a component?";
            } else {
              typeString = typeof type;
            }
            {
              error("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
            }
          }
          var element = createElement.apply(this, arguments);
          if (element == null) {
            return element;
          }
          if (validType) {
            for (var i = 2; i < arguments.length; i++) {
              validateChildKeys(arguments[i], type);
            }
          }
          if (type === REACT_FRAGMENT_TYPE) {
            validateFragmentProps(element);
          } else {
            validatePropTypes(element);
          }
          return element;
        }
        var didWarnAboutDeprecatedCreateFactory = false;
        function createFactoryWithValidation(type) {
          var validatedFactory = createElementWithValidation.bind(null, type);
          validatedFactory.type = type;
          {
            if (!didWarnAboutDeprecatedCreateFactory) {
              didWarnAboutDeprecatedCreateFactory = true;
              warn("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.");
            }
            Object.defineProperty(validatedFactory, "type", {
              enumerable: false,
              get: function() {
                warn("Factory.type is deprecated. Access the class directly before passing it to createFactory.");
                Object.defineProperty(this, "type", {
                  value: type
                });
                return type;
              }
            });
          }
          return validatedFactory;
        }
        function cloneElementWithValidation(element, props, children) {
          var newElement = cloneElement.apply(this, arguments);
          for (var i = 2; i < arguments.length; i++) {
            validateChildKeys(arguments[i], newElement.type);
          }
          validatePropTypes(newElement);
          return newElement;
        }
        function startTransition(scope, options) {
          var prevTransition = ReactCurrentBatchConfig.transition;
          ReactCurrentBatchConfig.transition = {};
          var currentTransition = ReactCurrentBatchConfig.transition;
          {
            ReactCurrentBatchConfig.transition._updatedFibers = /* @__PURE__ */ new Set();
          }
          try {
            scope();
          } finally {
            ReactCurrentBatchConfig.transition = prevTransition;
            {
              if (prevTransition === null && currentTransition._updatedFibers) {
                var updatedFibersCount = currentTransition._updatedFibers.size;
                if (updatedFibersCount > 10) {
                  warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.");
                }
                currentTransition._updatedFibers.clear();
              }
            }
          }
        }
        var didWarnAboutMessageChannel = false;
        var enqueueTaskImpl = null;
        function enqueueTask(task) {
          if (enqueueTaskImpl === null) {
            try {
              var requireString = ("require" + Math.random()).slice(0, 7);
              var nodeRequire = module2 && module2[requireString];
              enqueueTaskImpl = nodeRequire.call(module2, "timers").setImmediate;
            } catch (_err) {
              enqueueTaskImpl = function(callback) {
                {
                  if (didWarnAboutMessageChannel === false) {
                    didWarnAboutMessageChannel = true;
                    if (typeof MessageChannel === "undefined") {
                      error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning.");
                    }
                  }
                }
                var channel = new MessageChannel();
                channel.port1.onmessage = callback;
                channel.port2.postMessage(void 0);
              };
            }
          }
          return enqueueTaskImpl(task);
        }
        var actScopeDepth = 0;
        var didWarnNoAwaitAct = false;
        function act(callback) {
          {
            var prevActScopeDepth = actScopeDepth;
            actScopeDepth++;
            if (ReactCurrentActQueue.current === null) {
              ReactCurrentActQueue.current = [];
            }
            var prevIsBatchingLegacy = ReactCurrentActQueue.isBatchingLegacy;
            var result;
            try {
              ReactCurrentActQueue.isBatchingLegacy = true;
              result = callback();
              if (!prevIsBatchingLegacy && ReactCurrentActQueue.didScheduleLegacyUpdate) {
                var queue = ReactCurrentActQueue.current;
                if (queue !== null) {
                  ReactCurrentActQueue.didScheduleLegacyUpdate = false;
                  flushActQueue(queue);
                }
              }
            } catch (error2) {
              popActScope(prevActScopeDepth);
              throw error2;
            } finally {
              ReactCurrentActQueue.isBatchingLegacy = prevIsBatchingLegacy;
            }
            if (result !== null && typeof result === "object" && typeof result.then === "function") {
              var thenableResult = result;
              var wasAwaited = false;
              var thenable = {
                then: function(resolve, reject) {
                  wasAwaited = true;
                  thenableResult.then(function(returnValue2) {
                    popActScope(prevActScopeDepth);
                    if (actScopeDepth === 0) {
                      recursivelyFlushAsyncActWork(returnValue2, resolve, reject);
                    } else {
                      resolve(returnValue2);
                    }
                  }, function(error2) {
                    popActScope(prevActScopeDepth);
                    reject(error2);
                  });
                }
              };
              {
                if (!didWarnNoAwaitAct && typeof Promise !== "undefined") {
                  Promise.resolve().then(function() {
                  }).then(function() {
                    if (!wasAwaited) {
                      didWarnNoAwaitAct = true;
                      error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);");
                    }
                  });
                }
              }
              return thenable;
            } else {
              var returnValue = result;
              popActScope(prevActScopeDepth);
              if (actScopeDepth === 0) {
                var _queue = ReactCurrentActQueue.current;
                if (_queue !== null) {
                  flushActQueue(_queue);
                  ReactCurrentActQueue.current = null;
                }
                var _thenable = {
                  then: function(resolve, reject) {
                    if (ReactCurrentActQueue.current === null) {
                      ReactCurrentActQueue.current = [];
                      recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                    } else {
                      resolve(returnValue);
                    }
                  }
                };
                return _thenable;
              } else {
                var _thenable2 = {
                  then: function(resolve, reject) {
                    resolve(returnValue);
                  }
                };
                return _thenable2;
              }
            }
          }
        }
        function popActScope(prevActScopeDepth) {
          {
            if (prevActScopeDepth !== actScopeDepth - 1) {
              error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. ");
            }
            actScopeDepth = prevActScopeDepth;
          }
        }
        function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
          {
            var queue = ReactCurrentActQueue.current;
            if (queue !== null) {
              try {
                flushActQueue(queue);
                enqueueTask(function() {
                  if (queue.length === 0) {
                    ReactCurrentActQueue.current = null;
                    resolve(returnValue);
                  } else {
                    recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                  }
                });
              } catch (error2) {
                reject(error2);
              }
            } else {
              resolve(returnValue);
            }
          }
        }
        var isFlushing = false;
        function flushActQueue(queue) {
          {
            if (!isFlushing) {
              isFlushing = true;
              var i = 0;
              try {
                for (; i < queue.length; i++) {
                  var callback = queue[i];
                  do {
                    callback = callback(true);
                  } while (callback !== null);
                }
                queue.length = 0;
              } catch (error2) {
                queue = queue.slice(i + 1);
                throw error2;
              } finally {
                isFlushing = false;
              }
            }
          }
        }
        var createElement$1 = createElementWithValidation;
        var cloneElement$1 = cloneElementWithValidation;
        var createFactory = createFactoryWithValidation;
        var Children = {
          map: mapChildren,
          forEach: forEachChildren,
          count: countChildren,
          toArray,
          only: onlyChild
        };
        exports2.Children = Children;
        exports2.Component = Component;
        exports2.Fragment = REACT_FRAGMENT_TYPE;
        exports2.Profiler = REACT_PROFILER_TYPE;
        exports2.PureComponent = PureComponent;
        exports2.StrictMode = REACT_STRICT_MODE_TYPE;
        exports2.Suspense = REACT_SUSPENSE_TYPE;
        exports2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
        exports2.act = act;
        exports2.cloneElement = cloneElement$1;
        exports2.createContext = createContext;
        exports2.createElement = createElement$1;
        exports2.createFactory = createFactory;
        exports2.createRef = createRef;
        exports2.forwardRef = forwardRef;
        exports2.isValidElement = isValidElement;
        exports2.lazy = lazy;
        exports2.memo = memo;
        exports2.startTransition = startTransition;
        exports2.unstable_act = act;
        exports2.useCallback = useCallback;
        exports2.useContext = useContext;
        exports2.useDebugValue = useDebugValue;
        exports2.useDeferredValue = useDeferredValue;
        exports2.useEffect = useEffect2;
        exports2.useId = useId;
        exports2.useImperativeHandle = useImperativeHandle;
        exports2.useInsertionEffect = useInsertionEffect;
        exports2.useLayoutEffect = useLayoutEffect;
        exports2.useMemo = useMemo;
        exports2.useReducer = useReducer;
        exports2.useRef = useRef;
        exports2.useState = useState;
        exports2.useSyncExternalStore = useSyncExternalStore;
        exports2.useTransition = useTransition;
        exports2.version = ReactVersion;
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
        }
      })();
    }
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports2, module2) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module2.exports = require_react_production_min();
    } else {
      module2.exports = require_react_development();
    }
  }
});

// node_modules/react-dom/cjs/react-dom-server-legacy.node.production.min.js
var require_react_dom_server_legacy_node_production_min = __commonJS({
  "node_modules/react-dom/cjs/react-dom-server-legacy.node.production.min.js"(exports2) {
    "use strict";
    var ea = require_react();
    var fa = require("stream");
    var n = Object.prototype.hasOwnProperty;
    var ha = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/;
    var ia = {};
    var ja = {};
    function ka(a) {
      if (n.call(ja, a)) return true;
      if (n.call(ia, a)) return false;
      if (ha.test(a)) return ja[a] = true;
      ia[a] = true;
      return false;
    }
    function q(a, b, c, d, f, e, g) {
      this.acceptsBooleans = 2 === b || 3 === b || 4 === b;
      this.attributeName = d;
      this.attributeNamespace = f;
      this.mustUseProperty = c;
      this.propertyName = a;
      this.type = b;
      this.sanitizeURL = e;
      this.removeEmptyString = g;
    }
    var r = {};
    "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a) {
      r[a] = new q(a, 0, false, a, null, false, false);
    });
    [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(a) {
      var b = a[0];
      r[b] = new q(b, 1, false, a[1], null, false, false);
    });
    ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(a) {
      r[a] = new q(a, 2, false, a.toLowerCase(), null, false, false);
    });
    ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(a) {
      r[a] = new q(a, 2, false, a, null, false, false);
    });
    "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a) {
      r[a] = new q(a, 3, false, a.toLowerCase(), null, false, false);
    });
    ["checked", "multiple", "muted", "selected"].forEach(function(a) {
      r[a] = new q(a, 3, true, a, null, false, false);
    });
    ["capture", "download"].forEach(function(a) {
      r[a] = new q(a, 4, false, a, null, false, false);
    });
    ["cols", "rows", "size", "span"].forEach(function(a) {
      r[a] = new q(a, 6, false, a, null, false, false);
    });
    ["rowSpan", "start"].forEach(function(a) {
      r[a] = new q(a, 5, false, a.toLowerCase(), null, false, false);
    });
    var la = /[\-:]([a-z])/g;
    function ma(a) {
      return a[1].toUpperCase();
    }
    "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a) {
      var b = a.replace(
        la,
        ma
      );
      r[b] = new q(b, 1, false, a, null, false, false);
    });
    "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a) {
      var b = a.replace(la, ma);
      r[b] = new q(b, 1, false, a, "http://www.w3.org/1999/xlink", false, false);
    });
    ["xml:base", "xml:lang", "xml:space"].forEach(function(a) {
      var b = a.replace(la, ma);
      r[b] = new q(b, 1, false, a, "http://www.w3.org/XML/1998/namespace", false, false);
    });
    ["tabIndex", "crossOrigin"].forEach(function(a) {
      r[a] = new q(a, 1, false, a.toLowerCase(), null, false, false);
    });
    r.xlinkHref = new q("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
    ["src", "href", "action", "formAction"].forEach(function(a) {
      r[a] = new q(a, 1, false, a.toLowerCase(), null, true, true);
    });
    var t = {
      animationIterationCount: true,
      aspectRatio: true,
      borderImageOutset: true,
      borderImageSlice: true,
      borderImageWidth: true,
      boxFlex: true,
      boxFlexGroup: true,
      boxOrdinalGroup: true,
      columnCount: true,
      columns: true,
      flex: true,
      flexGrow: true,
      flexPositive: true,
      flexShrink: true,
      flexNegative: true,
      flexOrder: true,
      gridArea: true,
      gridRow: true,
      gridRowEnd: true,
      gridRowSpan: true,
      gridRowStart: true,
      gridColumn: true,
      gridColumnEnd: true,
      gridColumnSpan: true,
      gridColumnStart: true,
      fontWeight: true,
      lineClamp: true,
      lineHeight: true,
      opacity: true,
      order: true,
      orphans: true,
      tabSize: true,
      widows: true,
      zIndex: true,
      zoom: true,
      fillOpacity: true,
      floodOpacity: true,
      stopOpacity: true,
      strokeDasharray: true,
      strokeDashoffset: true,
      strokeMiterlimit: true,
      strokeOpacity: true,
      strokeWidth: true
    };
    var na = ["Webkit", "ms", "Moz", "O"];
    Object.keys(t).forEach(function(a) {
      na.forEach(function(b) {
        b = b + a.charAt(0).toUpperCase() + a.substring(1);
        t[b] = t[a];
      });
    });
    var oa = /["'&<>]/;
    function u(a) {
      if ("boolean" === typeof a || "number" === typeof a) return "" + a;
      a = "" + a;
      var b = oa.exec(a);
      if (b) {
        var c = "", d, f = 0;
        for (d = b.index; d < a.length; d++) {
          switch (a.charCodeAt(d)) {
            case 34:
              b = "&quot;";
              break;
            case 38:
              b = "&amp;";
              break;
            case 39:
              b = "&#x27;";
              break;
            case 60:
              b = "&lt;";
              break;
            case 62:
              b = "&gt;";
              break;
            default:
              continue;
          }
          f !== d && (c += a.substring(f, d));
          f = d + 1;
          c += b;
        }
        a = f !== d ? c + a.substring(f, d) : c;
      }
      return a;
    }
    var pa = /([A-Z])/g;
    var qa = /^ms-/;
    var ra = Array.isArray;
    function v(a, b) {
      return { insertionMode: a, selectedValue: b };
    }
    function sa(a, b, c) {
      switch (b) {
        case "select":
          return v(1, null != c.value ? c.value : c.defaultValue);
        case "svg":
          return v(2, null);
        case "math":
          return v(3, null);
        case "foreignObject":
          return v(1, null);
        case "table":
          return v(4, null);
        case "thead":
        case "tbody":
        case "tfoot":
          return v(5, null);
        case "colgroup":
          return v(7, null);
        case "tr":
          return v(6, null);
      }
      return 4 <= a.insertionMode || 0 === a.insertionMode ? v(1, null) : a;
    }
    var ta = /* @__PURE__ */ new Map();
    function ua(a, b, c) {
      if ("object" !== typeof c) throw Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
      b = true;
      for (var d in c) if (n.call(c, d)) {
        var f = c[d];
        if (null != f && "boolean" !== typeof f && "" !== f) {
          if (0 === d.indexOf("--")) {
            var e = u(d);
            f = u(("" + f).trim());
          } else {
            e = d;
            var g = ta.get(e);
            void 0 !== g ? e = g : (g = u(e.replace(pa, "-$1").toLowerCase().replace(qa, "-ms-")), ta.set(e, g), e = g);
            f = "number" === typeof f ? 0 === f || n.call(
              t,
              d
            ) ? "" + f : f + "px" : u(("" + f).trim());
          }
          b ? (b = false, a.push(' style="', e, ":", f)) : a.push(";", e, ":", f);
        }
      }
      b || a.push('"');
    }
    function w(a, b, c, d) {
      switch (c) {
        case "style":
          ua(a, b, d);
          return;
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
          return;
      }
      if (!(2 < c.length) || "o" !== c[0] && "O" !== c[0] || "n" !== c[1] && "N" !== c[1]) {
        if (b = r.hasOwnProperty(c) ? r[c] : null, null !== b) {
          switch (typeof d) {
            case "function":
            case "symbol":
              return;
            case "boolean":
              if (!b.acceptsBooleans) return;
          }
          c = b.attributeName;
          switch (b.type) {
            case 3:
              d && a.push(" ", c, '=""');
              break;
            case 4:
              true === d ? a.push(" ", c, '=""') : false !== d && a.push(" ", c, '="', u(d), '"');
              break;
            case 5:
              isNaN(d) || a.push(" ", c, '="', u(d), '"');
              break;
            case 6:
              !isNaN(d) && 1 <= d && a.push(" ", c, '="', u(d), '"');
              break;
            default:
              b.sanitizeURL && (d = "" + d), a.push(" ", c, '="', u(d), '"');
          }
        } else if (ka(c)) {
          switch (typeof d) {
            case "function":
            case "symbol":
              return;
            case "boolean":
              if (b = c.toLowerCase().slice(0, 5), "data-" !== b && "aria-" !== b) return;
          }
          a.push(" ", c, '="', u(d), '"');
        }
      }
    }
    function x(a, b, c) {
      if (null != b) {
        if (null != c) throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
        if ("object" !== typeof b || !("__html" in b)) throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
        b = b.__html;
        null !== b && void 0 !== b && a.push("" + b);
      }
    }
    function va(a) {
      var b = "";
      ea.Children.forEach(a, function(a2) {
        null != a2 && (b += a2);
      });
      return b;
    }
    function wa(a, b, c, d) {
      a.push(z(c));
      var f = c = null, e;
      for (e in b) if (n.call(b, e)) {
        var g = b[e];
        if (null != g) switch (e) {
          case "children":
            c = g;
            break;
          case "dangerouslySetInnerHTML":
            f = g;
            break;
          default:
            w(a, d, e, g);
        }
      }
      a.push(">");
      x(a, f, c);
      return "string" === typeof c ? (a.push(u(c)), null) : c;
    }
    var xa = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/;
    var ya = /* @__PURE__ */ new Map();
    function z(a) {
      var b = ya.get(a);
      if (void 0 === b) {
        if (!xa.test(a)) throw Error("Invalid tag: " + a);
        b = "<" + a;
        ya.set(a, b);
      }
      return b;
    }
    function za(a, b, c, d, f) {
      switch (b) {
        case "select":
          a.push(z("select"));
          var e = null, g = null;
          for (l in c) if (n.call(c, l)) {
            var h = c[l];
            if (null != h) switch (l) {
              case "children":
                e = h;
                break;
              case "dangerouslySetInnerHTML":
                g = h;
                break;
              case "defaultValue":
              case "value":
                break;
              default:
                w(a, d, l, h);
            }
          }
          a.push(">");
          x(a, g, e);
          return e;
        case "option":
          g = f.selectedValue;
          a.push(z("option"));
          var k = h = null, m = null;
          var l = null;
          for (e in c) if (n.call(c, e)) {
            var p = c[e];
            if (null != p) switch (e) {
              case "children":
                h = p;
                break;
              case "selected":
                m = p;
                break;
              case "dangerouslySetInnerHTML":
                l = p;
                break;
              case "value":
                k = p;
              default:
                w(a, d, e, p);
            }
          }
          if (null != g) if (c = null !== k ? "" + k : va(h), ra(g)) for (d = 0; d < g.length; d++) {
            if ("" + g[d] === c) {
              a.push(' selected=""');
              break;
            }
          }
          else "" + g === c && a.push(' selected=""');
          else m && a.push(' selected=""');
          a.push(">");
          x(a, l, h);
          return h;
        case "textarea":
          a.push(z("textarea"));
          l = g = e = null;
          for (h in c) if (n.call(c, h) && (k = c[h], null != k)) switch (h) {
            case "children":
              l = k;
              break;
            case "value":
              e = k;
              break;
            case "defaultValue":
              g = k;
              break;
            case "dangerouslySetInnerHTML":
              throw Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
            default:
              w(a, d, h, k);
          }
          null === e && null !== g && (e = g);
          a.push(">");
          if (null != l) {
            if (null != e) throw Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
            if (ra(l) && 1 < l.length) throw Error("<textarea> can only have at most one child.");
            e = "" + l;
          }
          "string" === typeof e && "\n" === e[0] && a.push("\n");
          null !== e && a.push(u("" + e));
          return null;
        case "input":
          a.push(z("input"));
          k = l = h = e = null;
          for (g in c) if (n.call(c, g) && (m = c[g], null != m)) switch (g) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw Error("input is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
            case "defaultChecked":
              k = m;
              break;
            case "defaultValue":
              h = m;
              break;
            case "checked":
              l = m;
              break;
            case "value":
              e = m;
              break;
            default:
              w(a, d, g, m);
          }
          null !== l ? w(a, d, "checked", l) : null !== k && w(a, d, "checked", k);
          null !== e ? w(a, d, "value", e) : null !== h && w(a, d, "value", h);
          a.push("/>");
          return null;
        case "menuitem":
          a.push(z("menuitem"));
          for (var B in c) if (n.call(c, B) && (e = c[B], null != e)) switch (B) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw Error("menuitems cannot have `children` nor `dangerouslySetInnerHTML`.");
            default:
              w(
                a,
                d,
                B,
                e
              );
          }
          a.push(">");
          return null;
        case "title":
          a.push(z("title"));
          e = null;
          for (p in c) if (n.call(c, p) && (g = c[p], null != g)) switch (p) {
            case "children":
              e = g;
              break;
            case "dangerouslySetInnerHTML":
              throw Error("`dangerouslySetInnerHTML` does not make sense on <title>.");
            default:
              w(a, d, p, g);
          }
          a.push(">");
          return e;
        case "listing":
        case "pre":
          a.push(z(b));
          g = e = null;
          for (k in c) if (n.call(c, k) && (h = c[k], null != h)) switch (k) {
            case "children":
              e = h;
              break;
            case "dangerouslySetInnerHTML":
              g = h;
              break;
            default:
              w(a, d, k, h);
          }
          a.push(">");
          if (null != g) {
            if (null != e) throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
            if ("object" !== typeof g || !("__html" in g)) throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
            c = g.__html;
            null !== c && void 0 !== c && ("string" === typeof c && 0 < c.length && "\n" === c[0] ? a.push("\n", c) : a.push("" + c));
          }
          "string" === typeof e && "\n" === e[0] && a.push("\n");
          return e;
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "img":
        case "keygen":
        case "link":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
          a.push(z(b));
          for (var C in c) if (n.call(c, C) && (e = c[C], null != e)) switch (C) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw Error(b + " is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
            default:
              w(a, d, C, e);
          }
          a.push("/>");
          return null;
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return wa(a, c, b, d);
        case "html":
          return 0 === f.insertionMode && a.push("<!DOCTYPE html>"), wa(a, c, b, d);
        default:
          if (-1 === b.indexOf("-") && "string" !== typeof c.is) return wa(a, c, b, d);
          a.push(z(b));
          g = e = null;
          for (m in c) if (n.call(c, m) && (h = c[m], null != h)) switch (m) {
            case "children":
              e = h;
              break;
            case "dangerouslySetInnerHTML":
              g = h;
              break;
            case "style":
              ua(a, d, h);
              break;
            case "suppressContentEditableWarning":
            case "suppressHydrationWarning":
              break;
            default:
              ka(m) && "function" !== typeof h && "symbol" !== typeof h && a.push(" ", m, '="', u(h), '"');
          }
          a.push(">");
          x(a, g, e);
          return e;
      }
    }
    function Aa(a, b, c) {
      a.push('<!--$?--><template id="');
      if (null === c) throw Error("An ID must have been assigned before we can complete the boundary.");
      a.push(c);
      return a.push('"></template>');
    }
    function Ba(a, b, c, d) {
      switch (c.insertionMode) {
        case 0:
        case 1:
          return a.push('<div hidden id="'), a.push(b.segmentPrefix), b = d.toString(16), a.push(b), a.push('">');
        case 2:
          return a.push('<svg aria-hidden="true" style="display:none" id="'), a.push(b.segmentPrefix), b = d.toString(16), a.push(b), a.push('">');
        case 3:
          return a.push('<math aria-hidden="true" style="display:none" id="'), a.push(b.segmentPrefix), b = d.toString(16), a.push(b), a.push('">');
        case 4:
          return a.push('<table hidden id="'), a.push(b.segmentPrefix), b = d.toString(16), a.push(b), a.push('">');
        case 5:
          return a.push('<table hidden><tbody id="'), a.push(b.segmentPrefix), b = d.toString(16), a.push(b), a.push('">');
        case 6:
          return a.push('<table hidden><tr id="'), a.push(b.segmentPrefix), b = d.toString(16), a.push(b), a.push('">');
        case 7:
          return a.push('<table hidden><colgroup id="'), a.push(b.segmentPrefix), b = d.toString(16), a.push(b), a.push('">');
        default:
          throw Error("Unknown insertion mode. This is a bug in React.");
      }
    }
    function Ca(a, b) {
      switch (b.insertionMode) {
        case 0:
        case 1:
          return a.push("</div>");
        case 2:
          return a.push("</svg>");
        case 3:
          return a.push("</math>");
        case 4:
          return a.push("</table>");
        case 5:
          return a.push("</tbody></table>");
        case 6:
          return a.push("</tr></table>");
        case 7:
          return a.push("</colgroup></table>");
        default:
          throw Error("Unknown insertion mode. This is a bug in React.");
      }
    }
    var Da = /[<\u2028\u2029]/g;
    function Ea(a) {
      return JSON.stringify(a).replace(Da, function(a2) {
        switch (a2) {
          case "<":
            return "\\u003c";
          case "\u2028":
            return "\\u2028";
          case "\u2029":
            return "\\u2029";
          default:
            throw Error("escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
        }
      });
    }
    function Fa(a, b) {
      b = void 0 === b ? "" : b;
      return { bootstrapChunks: [], startInlineScript: "<script>", placeholderPrefix: b + "P:", segmentPrefix: b + "S:", boundaryPrefix: b + "B:", idPrefix: b, nextSuspenseID: 0, sentCompleteSegmentFunction: false, sentCompleteBoundaryFunction: false, sentClientRenderFunction: false, generateStaticMarkup: a };
    }
    function Ga() {
      return { insertionMode: 1, selectedValue: null };
    }
    function Ha(a, b, c, d) {
      if (c.generateStaticMarkup) return a.push(u(b)), false;
      "" === b ? a = d : (d && a.push("<!-- -->"), a.push(u(b)), a = true);
      return a;
    }
    var A = Object.assign;
    var Ia = Symbol.for("react.element");
    var Ja = Symbol.for("react.portal");
    var Ka = Symbol.for("react.fragment");
    var La = Symbol.for("react.strict_mode");
    var Ma = Symbol.for("react.profiler");
    var Na = Symbol.for("react.provider");
    var Oa = Symbol.for("react.context");
    var Pa = Symbol.for("react.forward_ref");
    var Qa = Symbol.for("react.suspense");
    var Ra = Symbol.for("react.suspense_list");
    var Sa = Symbol.for("react.memo");
    var Ta = Symbol.for("react.lazy");
    var Ua = Symbol.for("react.scope");
    var Va = Symbol.for("react.debug_trace_mode");
    var Wa = Symbol.for("react.legacy_hidden");
    var Xa = Symbol.for("react.default_value");
    var Ya = Symbol.iterator;
    function Za(a) {
      if (null == a) return null;
      if ("function" === typeof a) return a.displayName || a.name || null;
      if ("string" === typeof a) return a;
      switch (a) {
        case Ka:
          return "Fragment";
        case Ja:
          return "Portal";
        case Ma:
          return "Profiler";
        case La:
          return "StrictMode";
        case Qa:
          return "Suspense";
        case Ra:
          return "SuspenseList";
      }
      if ("object" === typeof a) switch (a.$$typeof) {
        case Oa:
          return (a.displayName || "Context") + ".Consumer";
        case Na:
          return (a._context.displayName || "Context") + ".Provider";
        case Pa:
          var b = a.render;
          a = a.displayName;
          a || (a = b.displayName || b.name || "", a = "" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
          return a;
        case Sa:
          return b = a.displayName || null, null !== b ? b : Za(a.type) || "Memo";
        case Ta:
          b = a._payload;
          a = a._init;
          try {
            return Za(a(b));
          } catch (c) {
          }
      }
      return null;
    }
    var $a = {};
    function ab(a, b) {
      a = a.contextTypes;
      if (!a) return $a;
      var c = {}, d;
      for (d in a) c[d] = b[d];
      return c;
    }
    var D = null;
    function E(a, b) {
      if (a !== b) {
        a.context._currentValue2 = a.parentValue;
        a = a.parent;
        var c = b.parent;
        if (null === a) {
          if (null !== c) throw Error("The stacks must reach the root at the same time. This is a bug in React.");
        } else {
          if (null === c) throw Error("The stacks must reach the root at the same time. This is a bug in React.");
          E(a, c);
        }
        b.context._currentValue2 = b.value;
      }
    }
    function bb(a) {
      a.context._currentValue2 = a.parentValue;
      a = a.parent;
      null !== a && bb(a);
    }
    function cb(a) {
      var b = a.parent;
      null !== b && cb(b);
      a.context._currentValue2 = a.value;
    }
    function db(a, b) {
      a.context._currentValue2 = a.parentValue;
      a = a.parent;
      if (null === a) throw Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
      a.depth === b.depth ? E(a, b) : db(a, b);
    }
    function eb(a, b) {
      var c = b.parent;
      if (null === c) throw Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
      a.depth === c.depth ? E(a, c) : eb(a, c);
      b.context._currentValue2 = b.value;
    }
    function F(a) {
      var b = D;
      b !== a && (null === b ? cb(a) : null === a ? bb(b) : b.depth === a.depth ? E(b, a) : b.depth > a.depth ? db(b, a) : eb(b, a), D = a);
    }
    var fb = { isMounted: function() {
      return false;
    }, enqueueSetState: function(a, b) {
      a = a._reactInternals;
      null !== a.queue && a.queue.push(b);
    }, enqueueReplaceState: function(a, b) {
      a = a._reactInternals;
      a.replace = true;
      a.queue = [b];
    }, enqueueForceUpdate: function() {
    } };
    function gb(a, b, c, d) {
      var f = void 0 !== a.state ? a.state : null;
      a.updater = fb;
      a.props = c;
      a.state = f;
      var e = { queue: [], replace: false };
      a._reactInternals = e;
      var g = b.contextType;
      a.context = "object" === typeof g && null !== g ? g._currentValue2 : d;
      g = b.getDerivedStateFromProps;
      "function" === typeof g && (g = g(c, f), f = null === g || void 0 === g ? f : A({}, f, g), a.state = f);
      if ("function" !== typeof b.getDerivedStateFromProps && "function" !== typeof a.getSnapshotBeforeUpdate && ("function" === typeof a.UNSAFE_componentWillMount || "function" === typeof a.componentWillMount)) if (b = a.state, "function" === typeof a.componentWillMount && a.componentWillMount(), "function" === typeof a.UNSAFE_componentWillMount && a.UNSAFE_componentWillMount(), b !== a.state && fb.enqueueReplaceState(a, a.state, null), null !== e.queue && 0 < e.queue.length) if (b = e.queue, g = e.replace, e.queue = null, e.replace = false, g && 1 === b.length) a.state = b[0];
      else {
        e = g ? b[0] : a.state;
        f = true;
        for (g = g ? 1 : 0; g < b.length; g++) {
          var h = b[g];
          h = "function" === typeof h ? h.call(a, e, c, d) : h;
          null != h && (f ? (f = false, e = A({}, e, h)) : A(e, h));
        }
        a.state = e;
      }
      else e.queue = null;
    }
    var hb = { id: 1, overflow: "" };
    function ib(a, b, c) {
      var d = a.id;
      a = a.overflow;
      var f = 32 - G(d) - 1;
      d &= ~(1 << f);
      c += 1;
      var e = 32 - G(b) + f;
      if (30 < e) {
        var g = f - f % 5;
        e = (d & (1 << g) - 1).toString(32);
        d >>= g;
        f -= g;
        return { id: 1 << 32 - G(b) + f | c << f | d, overflow: e + a };
      }
      return { id: 1 << e | c << f | d, overflow: a };
    }
    var G = Math.clz32 ? Math.clz32 : jb;
    var kb = Math.log;
    var lb = Math.LN2;
    function jb(a) {
      a >>>= 0;
      return 0 === a ? 32 : 31 - (kb(a) / lb | 0) | 0;
    }
    function mb(a, b) {
      return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
    }
    var nb = "function" === typeof Object.is ? Object.is : mb;
    var H = null;
    var ob = null;
    var I = null;
    var J = null;
    var K = false;
    var L = false;
    var M = 0;
    var N = null;
    var O = 0;
    function P() {
      if (null === H) throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
      return H;
    }
    function rb() {
      if (0 < O) throw Error("Rendered more hooks than during the previous render");
      return { memoizedState: null, queue: null, next: null };
    }
    function sb() {
      null === J ? null === I ? (K = false, I = J = rb()) : (K = true, J = I) : null === J.next ? (K = false, J = J.next = rb()) : (K = true, J = J.next);
      return J;
    }
    function tb() {
      ob = H = null;
      L = false;
      I = null;
      O = 0;
      J = N = null;
    }
    function ub(a, b) {
      return "function" === typeof b ? b(a) : b;
    }
    function vb(a, b, c) {
      H = P();
      J = sb();
      if (K) {
        var d = J.queue;
        b = d.dispatch;
        if (null !== N && (c = N.get(d), void 0 !== c)) {
          N.delete(d);
          d = J.memoizedState;
          do
            d = a(d, c.action), c = c.next;
          while (null !== c);
          J.memoizedState = d;
          return [d, b];
        }
        return [J.memoizedState, b];
      }
      a = a === ub ? "function" === typeof b ? b() : b : void 0 !== c ? c(b) : b;
      J.memoizedState = a;
      a = J.queue = { last: null, dispatch: null };
      a = a.dispatch = wb.bind(null, H, a);
      return [J.memoizedState, a];
    }
    function xb(a, b) {
      H = P();
      J = sb();
      b = void 0 === b ? null : b;
      if (null !== J) {
        var c = J.memoizedState;
        if (null !== c && null !== b) {
          var d = c[1];
          a: if (null === d) d = false;
          else {
            for (var f = 0; f < d.length && f < b.length; f++) if (!nb(b[f], d[f])) {
              d = false;
              break a;
            }
            d = true;
          }
          if (d) return c[0];
        }
      }
      a = a();
      J.memoizedState = [a, b];
      return a;
    }
    function wb(a, b, c) {
      if (25 <= O) throw Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
      if (a === H) if (L = true, a = { action: c, next: null }, null === N && (N = /* @__PURE__ */ new Map()), c = N.get(b), void 0 === c) N.set(b, a);
      else {
        for (b = c; null !== b.next; ) b = b.next;
        b.next = a;
      }
    }
    function yb() {
      throw Error("startTransition cannot be called during server rendering.");
    }
    function Q() {
    }
    var zb = { readContext: function(a) {
      return a._currentValue2;
    }, useContext: function(a) {
      P();
      return a._currentValue2;
    }, useMemo: xb, useReducer: vb, useRef: function(a) {
      H = P();
      J = sb();
      var b = J.memoizedState;
      return null === b ? (a = { current: a }, J.memoizedState = a) : b;
    }, useState: function(a) {
      return vb(ub, a);
    }, useInsertionEffect: Q, useLayoutEffect: function() {
    }, useCallback: function(a, b) {
      return xb(function() {
        return a;
      }, b);
    }, useImperativeHandle: Q, useEffect: Q, useDebugValue: Q, useDeferredValue: function(a) {
      P();
      return a;
    }, useTransition: function() {
      P();
      return [false, yb];
    }, useId: function() {
      var a = ob.treeContext;
      var b = a.overflow;
      a = a.id;
      a = (a & ~(1 << 32 - G(a) - 1)).toString(32) + b;
      var c = R;
      if (null === c) throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component.");
      b = M++;
      a = ":" + c.idPrefix + "R" + a;
      0 < b && (a += "H" + b.toString(32));
      return a + ":";
    }, useMutableSource: function(a, b) {
      P();
      return b(a._source);
    }, useSyncExternalStore: function(a, b, c) {
      if (void 0 === c) throw Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
      return c();
    } };
    var R = null;
    var Ab = ea.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher;
    function Bb(a) {
      console.error(a);
      return null;
    }
    function S() {
    }
    function Cb(a, b, c, d, f, e, g, h, k) {
      var m = [], l = /* @__PURE__ */ new Set();
      b = { destination: null, responseState: b, progressiveChunkSize: void 0 === d ? 12800 : d, status: 0, fatalError: null, nextSegmentId: 0, allPendingTasks: 0, pendingRootTasks: 0, completedRootSegment: null, abortableTasks: l, pingedTasks: m, clientRenderedBoundaries: [], completedBoundaries: [], partialBoundaries: [], onError: void 0 === f ? Bb : f, onAllReady: void 0 === e ? S : e, onShellReady: void 0 === g ? S : g, onShellError: void 0 === h ? S : h, onFatalError: void 0 === k ? S : k };
      c = T2(b, 0, null, c, false, false);
      c.parentFlushed = true;
      a = Db(b, a, null, c, l, $a, null, hb);
      m.push(a);
      return b;
    }
    function Db(a, b, c, d, f, e, g, h) {
      a.allPendingTasks++;
      null === c ? a.pendingRootTasks++ : c.pendingTasks++;
      var k = { node: b, ping: function() {
        var b2 = a.pingedTasks;
        b2.push(k);
        1 === b2.length && Eb(a);
      }, blockedBoundary: c, blockedSegment: d, abortSet: f, legacyContext: e, context: g, treeContext: h };
      f.add(k);
      return k;
    }
    function T2(a, b, c, d, f, e) {
      return { status: 0, id: -1, index: b, parentFlushed: false, chunks: [], children: [], formatContext: d, boundary: c, lastPushedText: f, textEmbedded: e };
    }
    function U(a, b) {
      a = a.onError(b);
      if (null != a && "string" !== typeof a) throw Error('onError returned something with a type other than "string". onError should return a string and may return null or undefined but must not return anything else. It received something of type "' + typeof a + '" instead');
      return a;
    }
    function V(a, b) {
      var c = a.onShellError;
      c(b);
      c = a.onFatalError;
      c(b);
      null !== a.destination ? (a.status = 2, a.destination.destroy(b)) : (a.status = 1, a.fatalError = b);
    }
    function Fb(a, b, c, d, f) {
      H = {};
      ob = b;
      M = 0;
      for (a = c(d, f); L; ) L = false, M = 0, O += 1, J = null, a = c(d, f);
      tb();
      return a;
    }
    function Gb(a, b, c, d) {
      var f = c.render(), e = d.childContextTypes;
      if (null !== e && void 0 !== e) {
        var g = b.legacyContext;
        if ("function" !== typeof c.getChildContext) d = g;
        else {
          c = c.getChildContext();
          for (var h in c) if (!(h in e)) throw Error((Za(d) || "Unknown") + '.getChildContext(): key "' + h + '" is not defined in childContextTypes.');
          d = A({}, g, c);
        }
        b.legacyContext = d;
        W(a, b, f);
        b.legacyContext = g;
      } else W(a, b, f);
    }
    function Hb(a, b) {
      if (a && a.defaultProps) {
        b = A({}, b);
        a = a.defaultProps;
        for (var c in a) void 0 === b[c] && (b[c] = a[c]);
        return b;
      }
      return b;
    }
    function Ib(a, b, c, d, f) {
      if ("function" === typeof c) if (c.prototype && c.prototype.isReactComponent) {
        f = ab(c, b.legacyContext);
        var e = c.contextType;
        e = new c(d, "object" === typeof e && null !== e ? e._currentValue2 : f);
        gb(e, c, d, f);
        Gb(a, b, e, c);
      } else {
        e = ab(c, b.legacyContext);
        f = Fb(a, b, c, d, e);
        var g = 0 !== M;
        if ("object" === typeof f && null !== f && "function" === typeof f.render && void 0 === f.$$typeof) gb(f, c, d, e), Gb(a, b, f, c);
        else if (g) {
          d = b.treeContext;
          b.treeContext = ib(d, 1, 0);
          try {
            W(a, b, f);
          } finally {
            b.treeContext = d;
          }
        } else W(a, b, f);
      }
      else if ("string" === typeof c) {
        f = b.blockedSegment;
        e = za(f.chunks, c, d, a.responseState, f.formatContext);
        f.lastPushedText = false;
        g = f.formatContext;
        f.formatContext = sa(g, c, d);
        Jb(a, b, e);
        f.formatContext = g;
        switch (c) {
          case "area":
          case "base":
          case "br":
          case "col":
          case "embed":
          case "hr":
          case "img":
          case "input":
          case "keygen":
          case "link":
          case "meta":
          case "param":
          case "source":
          case "track":
          case "wbr":
            break;
          default:
            f.chunks.push("</", c, ">");
        }
        f.lastPushedText = false;
      } else {
        switch (c) {
          case Wa:
          case Va:
          case La:
          case Ma:
          case Ka:
            W(a, b, d.children);
            return;
          case Ra:
            W(a, b, d.children);
            return;
          case Ua:
            throw Error("ReactDOMServer does not yet support scope components.");
          case Qa:
            a: {
              c = b.blockedBoundary;
              f = b.blockedSegment;
              e = d.fallback;
              d = d.children;
              g = /* @__PURE__ */ new Set();
              var h = { id: null, rootSegmentID: -1, parentFlushed: false, pendingTasks: 0, forceClientRender: false, completedSegments: [], byteSize: 0, fallbackAbortableTasks: g, errorDigest: null }, k = T2(a, f.chunks.length, h, f.formatContext, false, false);
              f.children.push(k);
              f.lastPushedText = false;
              var m = T2(a, 0, null, f.formatContext, false, false);
              m.parentFlushed = true;
              b.blockedBoundary = h;
              b.blockedSegment = m;
              try {
                if (Jb(a, b, d), a.responseState.generateStaticMarkup || m.lastPushedText && m.textEmbedded && m.chunks.push("<!-- -->"), m.status = 1, X(h, m), 0 === h.pendingTasks) break a;
              } catch (l) {
                m.status = 4, h.forceClientRender = true, h.errorDigest = U(a, l);
              } finally {
                b.blockedBoundary = c, b.blockedSegment = f;
              }
              b = Db(a, e, c, k, g, b.legacyContext, b.context, b.treeContext);
              a.pingedTasks.push(b);
            }
            return;
        }
        if ("object" === typeof c && null !== c) switch (c.$$typeof) {
          case Pa:
            d = Fb(a, b, c.render, d, f);
            if (0 !== M) {
              c = b.treeContext;
              b.treeContext = ib(c, 1, 0);
              try {
                W(a, b, d);
              } finally {
                b.treeContext = c;
              }
            } else W(a, b, d);
            return;
          case Sa:
            c = c.type;
            d = Hb(c, d);
            Ib(a, b, c, d, f);
            return;
          case Na:
            f = d.children;
            c = c._context;
            d = d.value;
            e = c._currentValue2;
            c._currentValue2 = d;
            g = D;
            D = d = { parent: g, depth: null === g ? 0 : g.depth + 1, context: c, parentValue: e, value: d };
            b.context = d;
            W(a, b, f);
            a = D;
            if (null === a) throw Error("Tried to pop a Context at the root of the app. This is a bug in React.");
            d = a.parentValue;
            a.context._currentValue2 = d === Xa ? a.context._defaultValue : d;
            a = D = a.parent;
            b.context = a;
            return;
          case Oa:
            d = d.children;
            d = d(c._currentValue2);
            W(a, b, d);
            return;
          case Ta:
            f = c._init;
            c = f(c._payload);
            d = Hb(c, d);
            Ib(a, b, c, d, void 0);
            return;
        }
        throw Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: " + ((null == c ? c : typeof c) + "."));
      }
    }
    function W(a, b, c) {
      b.node = c;
      if ("object" === typeof c && null !== c) {
        switch (c.$$typeof) {
          case Ia:
            Ib(a, b, c.type, c.props, c.ref);
            return;
          case Ja:
            throw Error("Portals are not currently supported by the server renderer. Render them conditionally so that they only appear on the client render.");
          case Ta:
            var d = c._init;
            c = d(c._payload);
            W(a, b, c);
            return;
        }
        if (ra(c)) {
          Kb(a, b, c);
          return;
        }
        null === c || "object" !== typeof c ? d = null : (d = Ya && c[Ya] || c["@@iterator"], d = "function" === typeof d ? d : null);
        if (d && (d = d.call(c))) {
          c = d.next();
          if (!c.done) {
            var f = [];
            do
              f.push(c.value), c = d.next();
            while (!c.done);
            Kb(a, b, f);
          }
          return;
        }
        a = Object.prototype.toString.call(c);
        throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === a ? "object with keys {" + Object.keys(c).join(", ") + "}" : a) + "). If you meant to render a collection of children, use an array instead.");
      }
      "string" === typeof c ? (d = b.blockedSegment, d.lastPushedText = Ha(b.blockedSegment.chunks, c, a.responseState, d.lastPushedText)) : "number" === typeof c && (d = b.blockedSegment, d.lastPushedText = Ha(
        b.blockedSegment.chunks,
        "" + c,
        a.responseState,
        d.lastPushedText
      ));
    }
    function Kb(a, b, c) {
      for (var d = c.length, f = 0; f < d; f++) {
        var e = b.treeContext;
        b.treeContext = ib(e, d, f);
        try {
          Jb(a, b, c[f]);
        } finally {
          b.treeContext = e;
        }
      }
    }
    function Jb(a, b, c) {
      var d = b.blockedSegment.formatContext, f = b.legacyContext, e = b.context;
      try {
        return W(a, b, c);
      } catch (k) {
        if (tb(), "object" === typeof k && null !== k && "function" === typeof k.then) {
          c = k;
          var g = b.blockedSegment, h = T2(a, g.chunks.length, null, g.formatContext, g.lastPushedText, true);
          g.children.push(h);
          g.lastPushedText = false;
          a = Db(a, b.node, b.blockedBoundary, h, b.abortSet, b.legacyContext, b.context, b.treeContext).ping;
          c.then(a, a);
          b.blockedSegment.formatContext = d;
          b.legacyContext = f;
          b.context = e;
          F(e);
        } else throw b.blockedSegment.formatContext = d, b.legacyContext = f, b.context = e, F(e), k;
      }
    }
    function Lb(a) {
      var b = a.blockedBoundary;
      a = a.blockedSegment;
      a.status = 3;
      Mb(this, b, a);
    }
    function Nb(a, b, c) {
      var d = a.blockedBoundary;
      a.blockedSegment.status = 3;
      null === d ? (b.allPendingTasks--, 2 !== b.status && (b.status = 2, null !== b.destination && b.destination.push(null))) : (d.pendingTasks--, d.forceClientRender || (d.forceClientRender = true, d.errorDigest = b.onError(void 0 === c ? Error("The render was aborted by the server without a reason.") : c), d.parentFlushed && b.clientRenderedBoundaries.push(d)), d.fallbackAbortableTasks.forEach(function(a2) {
        return Nb(a2, b, c);
      }), d.fallbackAbortableTasks.clear(), b.allPendingTasks--, 0 === b.allPendingTasks && (a = b.onAllReady, a()));
    }
    function X(a, b) {
      if (0 === b.chunks.length && 1 === b.children.length && null === b.children[0].boundary) {
        var c = b.children[0];
        c.id = b.id;
        c.parentFlushed = true;
        1 === c.status && X(a, c);
      } else a.completedSegments.push(b);
    }
    function Mb(a, b, c) {
      if (null === b) {
        if (c.parentFlushed) {
          if (null !== a.completedRootSegment) throw Error("There can only be one root segment. This is a bug in React.");
          a.completedRootSegment = c;
        }
        a.pendingRootTasks--;
        0 === a.pendingRootTasks && (a.onShellError = S, b = a.onShellReady, b());
      } else b.pendingTasks--, b.forceClientRender || (0 === b.pendingTasks ? (c.parentFlushed && 1 === c.status && X(b, c), b.parentFlushed && a.completedBoundaries.push(b), b.fallbackAbortableTasks.forEach(Lb, a), b.fallbackAbortableTasks.clear()) : c.parentFlushed && 1 === c.status && (X(b, c), 1 === b.completedSegments.length && b.parentFlushed && a.partialBoundaries.push(b)));
      a.allPendingTasks--;
      0 === a.allPendingTasks && (a = a.onAllReady, a());
    }
    function Eb(a) {
      if (2 !== a.status) {
        var b = D, c = Ab.current;
        Ab.current = zb;
        var d = R;
        R = a.responseState;
        try {
          var f = a.pingedTasks, e;
          for (e = 0; e < f.length; e++) {
            var g = f[e];
            var h = a, k = g.blockedSegment;
            if (0 === k.status) {
              F(g.context);
              try {
                W(h, g, g.node), h.responseState.generateStaticMarkup || k.lastPushedText && k.textEmbedded && k.chunks.push("<!-- -->"), g.abortSet.delete(g), k.status = 1, Mb(h, g.blockedBoundary, k);
              } catch (y) {
                if (tb(), "object" === typeof y && null !== y && "function" === typeof y.then) {
                  var m = g.ping;
                  y.then(m, m);
                } else {
                  g.abortSet.delete(g);
                  k.status = 4;
                  var l = g.blockedBoundary, p = y, B = U(h, p);
                  null === l ? V(h, p) : (l.pendingTasks--, l.forceClientRender || (l.forceClientRender = true, l.errorDigest = B, l.parentFlushed && h.clientRenderedBoundaries.push(l)));
                  h.allPendingTasks--;
                  if (0 === h.allPendingTasks) {
                    var C = h.onAllReady;
                    C();
                  }
                }
              } finally {
              }
            }
          }
          f.splice(0, e);
          null !== a.destination && Ob(a, a.destination);
        } catch (y) {
          U(a, y), V(a, y);
        } finally {
          R = d, Ab.current = c, c === zb && F(b);
        }
      }
    }
    function Y(a, b, c) {
      c.parentFlushed = true;
      switch (c.status) {
        case 0:
          var d = c.id = a.nextSegmentId++;
          c.lastPushedText = false;
          c.textEmbedded = false;
          a = a.responseState;
          b.push('<template id="');
          b.push(a.placeholderPrefix);
          a = d.toString(16);
          b.push(a);
          return b.push('"></template>');
        case 1:
          c.status = 2;
          var f = true;
          d = c.chunks;
          var e = 0;
          c = c.children;
          for (var g = 0; g < c.length; g++) {
            for (f = c[g]; e < f.index; e++) b.push(d[e]);
            f = Z(a, b, f);
          }
          for (; e < d.length - 1; e++) b.push(d[e]);
          e < d.length && (f = b.push(d[e]));
          return f;
        default:
          throw Error("Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.");
      }
    }
    function Z(a, b, c) {
      var d = c.boundary;
      if (null === d) return Y(a, b, c);
      d.parentFlushed = true;
      if (d.forceClientRender) return a.responseState.generateStaticMarkup || (d = d.errorDigest, b.push("<!--$!-->"), b.push("<template"), d && (b.push(' data-dgst="'), d = u(d), b.push(d), b.push('"')), b.push("></template>")), Y(a, b, c), a = a.responseState.generateStaticMarkup ? true : b.push("<!--/$-->"), a;
      if (0 < d.pendingTasks) {
        d.rootSegmentID = a.nextSegmentId++;
        0 < d.completedSegments.length && a.partialBoundaries.push(d);
        var f = a.responseState;
        var e = f.nextSuspenseID++;
        f = f.boundaryPrefix + e.toString(16);
        d = d.id = f;
        Aa(b, a.responseState, d);
        Y(a, b, c);
        return b.push("<!--/$-->");
      }
      if (d.byteSize > a.progressiveChunkSize) return d.rootSegmentID = a.nextSegmentId++, a.completedBoundaries.push(d), Aa(b, a.responseState, d.id), Y(a, b, c), b.push("<!--/$-->");
      a.responseState.generateStaticMarkup || b.push("<!--$-->");
      c = d.completedSegments;
      if (1 !== c.length) throw Error("A previously unvisited boundary must have exactly one root segment. This is a bug in React.");
      Z(a, b, c[0]);
      a = a.responseState.generateStaticMarkup ? true : b.push("<!--/$-->");
      return a;
    }
    function Pb(a, b, c) {
      Ba(b, a.responseState, c.formatContext, c.id);
      Z(a, b, c);
      return Ca(b, c.formatContext);
    }
    function Qb(a, b, c) {
      for (var d = c.completedSegments, f = 0; f < d.length; f++) Rb(a, b, c, d[f]);
      d.length = 0;
      a = a.responseState;
      d = c.id;
      c = c.rootSegmentID;
      b.push(a.startInlineScript);
      a.sentCompleteBoundaryFunction ? b.push('$RC("') : (a.sentCompleteBoundaryFunction = true, b.push('function $RC(a,b){a=document.getElementById(a);b=document.getElementById(b);b.parentNode.removeChild(b);if(a){a=a.previousSibling;var f=a.parentNode,c=a.nextSibling,e=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d)if(0===e)break;else e--;else"$"!==d&&"$?"!==d&&"$!"!==d||e++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;b.firstChild;)f.insertBefore(b.firstChild,c);a.data="$";a._reactRetry&&a._reactRetry()}};$RC("'));
      if (null === d) throw Error("An ID must have been assigned before we can complete the boundary.");
      c = c.toString(16);
      b.push(d);
      b.push('","');
      b.push(a.segmentPrefix);
      b.push(c);
      return b.push('")</script>');
    }
    function Rb(a, b, c, d) {
      if (2 === d.status) return true;
      var f = d.id;
      if (-1 === f) {
        if (-1 === (d.id = c.rootSegmentID)) throw Error("A root segment ID must have been assigned by now. This is a bug in React.");
        return Pb(a, b, d);
      }
      Pb(a, b, d);
      a = a.responseState;
      b.push(a.startInlineScript);
      a.sentCompleteSegmentFunction ? b.push('$RS("') : (a.sentCompleteSegmentFunction = true, b.push('function $RS(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)};$RS("'));
      b.push(a.segmentPrefix);
      f = f.toString(16);
      b.push(f);
      b.push('","');
      b.push(a.placeholderPrefix);
      b.push(f);
      return b.push('")</script>');
    }
    function Ob(a, b) {
      try {
        var c = a.completedRootSegment;
        if (null !== c && 0 === a.pendingRootTasks) {
          Z(a, b, c);
          a.completedRootSegment = null;
          var d = a.responseState.bootstrapChunks;
          for (c = 0; c < d.length - 1; c++) b.push(d[c]);
          c < d.length && b.push(d[c]);
        }
        var f = a.clientRenderedBoundaries, e;
        for (e = 0; e < f.length; e++) {
          var g = f[e];
          d = b;
          var h = a.responseState, k = g.id, m = g.errorDigest, l = g.errorMessage, p = g.errorComponentStack;
          d.push(h.startInlineScript);
          h.sentClientRenderFunction ? d.push('$RX("') : (h.sentClientRenderFunction = true, d.push('function $RX(b,c,d,e){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),b._reactRetry&&b._reactRetry())};$RX("'));
          if (null === k) throw Error("An ID must have been assigned before we can complete the boundary.");
          d.push(k);
          d.push('"');
          if (m || l || p) {
            d.push(",");
            var B = Ea(m || "");
            d.push(B);
          }
          if (l || p) {
            d.push(",");
            var C = Ea(l || "");
            d.push(C);
          }
          if (p) {
            d.push(",");
            var y = Ea(p);
            d.push(y);
          }
          if (!d.push(")</script>")) {
            a.destination = null;
            e++;
            f.splice(0, e);
            return;
          }
        }
        f.splice(0, e);
        var aa = a.completedBoundaries;
        for (e = 0; e < aa.length; e++) if (!Qb(a, b, aa[e])) {
          a.destination = null;
          e++;
          aa.splice(0, e);
          return;
        }
        aa.splice(0, e);
        var ba = a.partialBoundaries;
        for (e = 0; e < ba.length; e++) {
          var pb = ba[e];
          a: {
            f = a;
            g = b;
            var ca = pb.completedSegments;
            for (h = 0; h < ca.length; h++) if (!Rb(f, g, pb, ca[h])) {
              h++;
              ca.splice(0, h);
              var qb = false;
              break a;
            }
            ca.splice(0, h);
            qb = true;
          }
          if (!qb) {
            a.destination = null;
            e++;
            ba.splice(0, e);
            return;
          }
        }
        ba.splice(0, e);
        var da = a.completedBoundaries;
        for (e = 0; e < da.length; e++) if (!Qb(a, b, da[e])) {
          a.destination = null;
          e++;
          da.splice(0, e);
          return;
        }
        da.splice(0, e);
      } finally {
        0 === a.allPendingTasks && 0 === a.pingedTasks.length && 0 === a.clientRenderedBoundaries.length && 0 === a.completedBoundaries.length && b.push(null);
      }
    }
    function Sb(a, b) {
      if (1 === a.status) a.status = 2, b.destroy(a.fatalError);
      else if (2 !== a.status && null === a.destination) {
        a.destination = b;
        try {
          Ob(a, b);
        } catch (c) {
          U(a, c), V(a, c);
        }
      }
    }
    function Tb(a, b) {
      try {
        var c = a.abortableTasks;
        c.forEach(function(c2) {
          return Nb(c2, a, b);
        });
        c.clear();
        null !== a.destination && Ob(a, a.destination);
      } catch (d) {
        U(a, d), V(a, d);
      }
    }
    function Ub() {
    }
    function Vb(a, b, c, d) {
      var f = false, e = null, g = "", h = false;
      a = Cb(a, Fa(c, b ? b.identifierPrefix : void 0), Ga(), Infinity, Ub, void 0, function() {
        h = true;
      }, void 0, void 0);
      Eb(a);
      Tb(a, d);
      Sb(a, { push: function(a2) {
        null !== a2 && (g += a2);
        return true;
      }, destroy: function(a2) {
        f = true;
        e = a2;
      } });
      if (f) throw e;
      if (!h) throw Error("A component suspended while responding to synchronous input. This will cause the UI to be replaced with a loading indicator. To fix, updates that suspend should be wrapped with startTransition.");
      return g;
    }
    function Wb(a, b) {
      a.prototype = Object.create(b.prototype);
      a.prototype.constructor = a;
      a.__proto__ = b;
    }
    var Xb = (function(a) {
      function b() {
        var b2 = a.call(this, {}) || this;
        b2.request = null;
        b2.startedFlowing = false;
        return b2;
      }
      Wb(b, a);
      var c = b.prototype;
      c._destroy = function(a2, b2) {
        Tb(this.request);
        b2(a2);
      };
      c._read = function() {
        this.startedFlowing && Sb(this.request, this);
      };
      return b;
    })(fa.Readable);
    function Yb() {
    }
    function Zb(a, b) {
      var c = new Xb(), d = Cb(a, Fa(false, b ? b.identifierPrefix : void 0), Ga(), Infinity, Yb, function() {
        c.startedFlowing = true;
        Sb(d, c);
      }, void 0, void 0);
      c.request = d;
      Eb(d);
      return c;
    }
    exports2.renderToNodeStream = function(a, b) {
      return Zb(a, b);
    };
    exports2.renderToStaticMarkup = function(a, b) {
      return Vb(a, b, true, 'The server used "renderToStaticMarkup" which does not support Suspense. If you intended to have the server wait for the suspended component please switch to "renderToPipeableStream" which supports Suspense on the server');
    };
    exports2.renderToStaticNodeStream = function(a, b) {
      return Zb(a, b);
    };
    exports2.renderToString = function(a, b) {
      return Vb(a, b, false, 'The server used "renderToString" which does not support Suspense. If you intended for this Suspense boundary to render the fallback content on the server consider throwing an Error somewhere within the Suspense boundary. If you intended to have the server wait for the suspended component please switch to "renderToPipeableStream" which supports Suspense on the server');
    };
    exports2.version = "18.3.1";
  }
});

// node_modules/react-dom/cjs/react-dom-server.node.production.min.js
var require_react_dom_server_node_production_min = __commonJS({
  "node_modules/react-dom/cjs/react-dom-server.node.production.min.js"(exports2) {
    "use strict";
    var aa = require("util");
    var ba = require_react();
    var k = null;
    var l = 0;
    var q = true;
    function r(a, b) {
      if ("string" === typeof b) {
        if (0 !== b.length) if (2048 < 3 * b.length) 0 < l && (t(a, k.subarray(0, l)), k = new Uint8Array(2048), l = 0), t(a, u.encode(b));
        else {
          var c = k;
          0 < l && (c = k.subarray(l));
          c = u.encodeInto(b, c);
          var d = c.read;
          l += c.written;
          d < b.length && (t(a, k), k = new Uint8Array(2048), l = u.encodeInto(b.slice(d), k).written);
          2048 === l && (t(a, k), k = new Uint8Array(2048), l = 0);
        }
      } else 0 !== b.byteLength && (2048 < b.byteLength ? (0 < l && (t(a, k.subarray(0, l)), k = new Uint8Array(2048), l = 0), t(a, b)) : (c = k.length - l, c < b.byteLength && (0 === c ? t(
        a,
        k
      ) : (k.set(b.subarray(0, c), l), l += c, t(a, k), b = b.subarray(c)), k = new Uint8Array(2048), l = 0), k.set(b, l), l += b.byteLength, 2048 === l && (t(a, k), k = new Uint8Array(2048), l = 0)));
    }
    function t(a, b) {
      a = a.write(b);
      q = q && a;
    }
    function w(a, b) {
      r(a, b);
      return q;
    }
    function ca(a) {
      k && 0 < l && a.write(k.subarray(0, l));
      k = null;
      l = 0;
      q = true;
    }
    var u = new aa.TextEncoder();
    function x(a) {
      return u.encode(a);
    }
    var y = Object.prototype.hasOwnProperty;
    var da = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/;
    var ea = {};
    var fa = {};
    function ha(a) {
      if (y.call(fa, a)) return true;
      if (y.call(ea, a)) return false;
      if (da.test(a)) return fa[a] = true;
      ea[a] = true;
      return false;
    }
    function z(a, b, c, d, f, e, g) {
      this.acceptsBooleans = 2 === b || 3 === b || 4 === b;
      this.attributeName = d;
      this.attributeNamespace = f;
      this.mustUseProperty = c;
      this.propertyName = a;
      this.type = b;
      this.sanitizeURL = e;
      this.removeEmptyString = g;
    }
    var A = {};
    "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a) {
      A[a] = new z(a, 0, false, a, null, false, false);
    });
    [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(a) {
      var b = a[0];
      A[b] = new z(b, 1, false, a[1], null, false, false);
    });
    ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(a) {
      A[a] = new z(a, 2, false, a.toLowerCase(), null, false, false);
    });
    ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(a) {
      A[a] = new z(a, 2, false, a, null, false, false);
    });
    "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a) {
      A[a] = new z(a, 3, false, a.toLowerCase(), null, false, false);
    });
    ["checked", "multiple", "muted", "selected"].forEach(function(a) {
      A[a] = new z(a, 3, true, a, null, false, false);
    });
    ["capture", "download"].forEach(function(a) {
      A[a] = new z(a, 4, false, a, null, false, false);
    });
    ["cols", "rows", "size", "span"].forEach(function(a) {
      A[a] = new z(a, 6, false, a, null, false, false);
    });
    ["rowSpan", "start"].forEach(function(a) {
      A[a] = new z(a, 5, false, a.toLowerCase(), null, false, false);
    });
    var ia = /[\-:]([a-z])/g;
    function ja(a) {
      return a[1].toUpperCase();
    }
    "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a) {
      var b = a.replace(
        ia,
        ja
      );
      A[b] = new z(b, 1, false, a, null, false, false);
    });
    "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a) {
      var b = a.replace(ia, ja);
      A[b] = new z(b, 1, false, a, "http://www.w3.org/1999/xlink", false, false);
    });
    ["xml:base", "xml:lang", "xml:space"].forEach(function(a) {
      var b = a.replace(ia, ja);
      A[b] = new z(b, 1, false, a, "http://www.w3.org/XML/1998/namespace", false, false);
    });
    ["tabIndex", "crossOrigin"].forEach(function(a) {
      A[a] = new z(a, 1, false, a.toLowerCase(), null, false, false);
    });
    A.xlinkHref = new z("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
    ["src", "href", "action", "formAction"].forEach(function(a) {
      A[a] = new z(a, 1, false, a.toLowerCase(), null, true, true);
    });
    var B = {
      animationIterationCount: true,
      aspectRatio: true,
      borderImageOutset: true,
      borderImageSlice: true,
      borderImageWidth: true,
      boxFlex: true,
      boxFlexGroup: true,
      boxOrdinalGroup: true,
      columnCount: true,
      columns: true,
      flex: true,
      flexGrow: true,
      flexPositive: true,
      flexShrink: true,
      flexNegative: true,
      flexOrder: true,
      gridArea: true,
      gridRow: true,
      gridRowEnd: true,
      gridRowSpan: true,
      gridRowStart: true,
      gridColumn: true,
      gridColumnEnd: true,
      gridColumnSpan: true,
      gridColumnStart: true,
      fontWeight: true,
      lineClamp: true,
      lineHeight: true,
      opacity: true,
      order: true,
      orphans: true,
      tabSize: true,
      widows: true,
      zIndex: true,
      zoom: true,
      fillOpacity: true,
      floodOpacity: true,
      stopOpacity: true,
      strokeDasharray: true,
      strokeDashoffset: true,
      strokeMiterlimit: true,
      strokeOpacity: true,
      strokeWidth: true
    };
    var ka = ["Webkit", "ms", "Moz", "O"];
    Object.keys(B).forEach(function(a) {
      ka.forEach(function(b) {
        b = b + a.charAt(0).toUpperCase() + a.substring(1);
        B[b] = B[a];
      });
    });
    var la = /["'&<>]/;
    function F(a) {
      if ("boolean" === typeof a || "number" === typeof a) return "" + a;
      a = "" + a;
      var b = la.exec(a);
      if (b) {
        var c = "", d, f = 0;
        for (d = b.index; d < a.length; d++) {
          switch (a.charCodeAt(d)) {
            case 34:
              b = "&quot;";
              break;
            case 38:
              b = "&amp;";
              break;
            case 39:
              b = "&#x27;";
              break;
            case 60:
              b = "&lt;";
              break;
            case 62:
              b = "&gt;";
              break;
            default:
              continue;
          }
          f !== d && (c += a.substring(f, d));
          f = d + 1;
          c += b;
        }
        a = f !== d ? c + a.substring(f, d) : c;
      }
      return a;
    }
    var ma = /([A-Z])/g;
    var pa = /^ms-/;
    var qa = Array.isArray;
    var ra = x("<script>");
    var sa = x("</script>");
    var ta = x('<script src="');
    var ua = x('<script type="module" src="');
    var va = x('" async=""></script>');
    var wa = /(<\/|<)(s)(cript)/gi;
    function xa(a, b, c, d) {
      return "" + b + ("s" === c ? "\\u0073" : "\\u0053") + d;
    }
    function G(a, b) {
      return { insertionMode: a, selectedValue: b };
    }
    function ya(a, b, c) {
      switch (b) {
        case "select":
          return G(1, null != c.value ? c.value : c.defaultValue);
        case "svg":
          return G(2, null);
        case "math":
          return G(3, null);
        case "foreignObject":
          return G(1, null);
        case "table":
          return G(4, null);
        case "thead":
        case "tbody":
        case "tfoot":
          return G(5, null);
        case "colgroup":
          return G(7, null);
        case "tr":
          return G(6, null);
      }
      return 4 <= a.insertionMode || 0 === a.insertionMode ? G(1, null) : a;
    }
    var za = x("<!-- -->");
    function Aa(a, b, c, d) {
      if ("" === b) return d;
      d && a.push(za);
      a.push(F(b));
      return true;
    }
    var Ba = /* @__PURE__ */ new Map();
    var Ca = x(' style="');
    var Da = x(":");
    var Ea = x(";");
    function Fa(a, b, c) {
      if ("object" !== typeof c) throw Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
      b = true;
      for (var d in c) if (y.call(c, d)) {
        var f = c[d];
        if (null != f && "boolean" !== typeof f && "" !== f) {
          if (0 === d.indexOf("--")) {
            var e = F(d);
            f = F(("" + f).trim());
          } else {
            e = d;
            var g = Ba.get(e);
            void 0 !== g ? e = g : (g = x(F(e.replace(ma, "-$1").toLowerCase().replace(pa, "-ms-"))), Ba.set(e, g), e = g);
            f = "number" === typeof f ? 0 === f || y.call(
              B,
              d
            ) ? "" + f : f + "px" : F(("" + f).trim());
          }
          b ? (b = false, a.push(Ca, e, Da, f)) : a.push(Ea, e, Da, f);
        }
      }
      b || a.push(H);
    }
    var I = x(" ");
    var J = x('="');
    var H = x('"');
    var Ga = x('=""');
    function K(a, b, c, d) {
      switch (c) {
        case "style":
          Fa(a, b, d);
          return;
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
          return;
      }
      if (!(2 < c.length) || "o" !== c[0] && "O" !== c[0] || "n" !== c[1] && "N" !== c[1]) {
        if (b = A.hasOwnProperty(c) ? A[c] : null, null !== b) {
          switch (typeof d) {
            case "function":
            case "symbol":
              return;
            case "boolean":
              if (!b.acceptsBooleans) return;
          }
          c = b.attributeName;
          switch (b.type) {
            case 3:
              d && a.push(I, c, Ga);
              break;
            case 4:
              true === d ? a.push(I, c, Ga) : false !== d && a.push(I, c, J, F(d), H);
              break;
            case 5:
              isNaN(d) || a.push(I, c, J, F(d), H);
              break;
            case 6:
              !isNaN(d) && 1 <= d && a.push(I, c, J, F(d), H);
              break;
            default:
              b.sanitizeURL && (d = "" + d), a.push(I, c, J, F(d), H);
          }
        } else if (ha(c)) {
          switch (typeof d) {
            case "function":
            case "symbol":
              return;
            case "boolean":
              if (b = c.toLowerCase().slice(0, 5), "data-" !== b && "aria-" !== b) return;
          }
          a.push(I, c, J, F(d), H);
        }
      }
    }
    var L = x(">");
    var Ha = x("/>");
    function M(a, b, c) {
      if (null != b) {
        if (null != c) throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
        if ("object" !== typeof b || !("__html" in b)) throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
        b = b.__html;
        null !== b && void 0 !== b && a.push("" + b);
      }
    }
    function Ia(a) {
      var b = "";
      ba.Children.forEach(a, function(a2) {
        null != a2 && (b += a2);
      });
      return b;
    }
    var Ja = x(' selected=""');
    function Ka(a, b, c, d) {
      a.push(N(c));
      var f = c = null, e;
      for (e in b) if (y.call(b, e)) {
        var g = b[e];
        if (null != g) switch (e) {
          case "children":
            c = g;
            break;
          case "dangerouslySetInnerHTML":
            f = g;
            break;
          default:
            K(a, d, e, g);
        }
      }
      a.push(L);
      M(a, f, c);
      return "string" === typeof c ? (a.push(F(c)), null) : c;
    }
    var La = x("\n");
    var Ma = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/;
    var Na = /* @__PURE__ */ new Map();
    function N(a) {
      var b = Na.get(a);
      if (void 0 === b) {
        if (!Ma.test(a)) throw Error("Invalid tag: " + a);
        b = x("<" + a);
        Na.set(a, b);
      }
      return b;
    }
    var Oa = x("<!DOCTYPE html>");
    function Pa(a, b, c, d, f) {
      switch (b) {
        case "select":
          a.push(N("select"));
          var e = null, g = null;
          for (p in c) if (y.call(c, p)) {
            var h = c[p];
            if (null != h) switch (p) {
              case "children":
                e = h;
                break;
              case "dangerouslySetInnerHTML":
                g = h;
                break;
              case "defaultValue":
              case "value":
                break;
              default:
                K(a, d, p, h);
            }
          }
          a.push(L);
          M(a, g, e);
          return e;
        case "option":
          g = f.selectedValue;
          a.push(N("option"));
          var m = h = null, n = null;
          var p = null;
          for (e in c) if (y.call(c, e)) {
            var v = c[e];
            if (null != v) switch (e) {
              case "children":
                h = v;
                break;
              case "selected":
                n = v;
                break;
              case "dangerouslySetInnerHTML":
                p = v;
                break;
              case "value":
                m = v;
              default:
                K(a, d, e, v);
            }
          }
          if (null != g) if (c = null !== m ? "" + m : Ia(h), qa(g)) for (d = 0; d < g.length; d++) {
            if ("" + g[d] === c) {
              a.push(Ja);
              break;
            }
          }
          else "" + g === c && a.push(Ja);
          else n && a.push(Ja);
          a.push(L);
          M(a, p, h);
          return h;
        case "textarea":
          a.push(N("textarea"));
          p = g = e = null;
          for (h in c) if (y.call(c, h) && (m = c[h], null != m)) switch (h) {
            case "children":
              p = m;
              break;
            case "value":
              e = m;
              break;
            case "defaultValue":
              g = m;
              break;
            case "dangerouslySetInnerHTML":
              throw Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
            default:
              K(a, d, h, m);
          }
          null === e && null !== g && (e = g);
          a.push(L);
          if (null != p) {
            if (null != e) throw Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
            if (qa(p) && 1 < p.length) throw Error("<textarea> can only have at most one child.");
            e = "" + p;
          }
          "string" === typeof e && "\n" === e[0] && a.push(La);
          null !== e && a.push(F("" + e));
          return null;
        case "input":
          a.push(N("input"));
          m = p = h = e = null;
          for (g in c) if (y.call(c, g) && (n = c[g], null != n)) switch (g) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw Error("input is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
            case "defaultChecked":
              m = n;
              break;
            case "defaultValue":
              h = n;
              break;
            case "checked":
              p = n;
              break;
            case "value":
              e = n;
              break;
            default:
              K(a, d, g, n);
          }
          null !== p ? K(a, d, "checked", p) : null !== m && K(a, d, "checked", m);
          null !== e ? K(a, d, "value", e) : null !== h && K(a, d, "value", h);
          a.push(Ha);
          return null;
        case "menuitem":
          a.push(N("menuitem"));
          for (var C in c) if (y.call(c, C) && (e = c[C], null != e)) switch (C) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw Error("menuitems cannot have `children` nor `dangerouslySetInnerHTML`.");
            default:
              K(a, d, C, e);
          }
          a.push(L);
          return null;
        case "title":
          a.push(N("title"));
          e = null;
          for (v in c) if (y.call(c, v) && (g = c[v], null != g)) switch (v) {
            case "children":
              e = g;
              break;
            case "dangerouslySetInnerHTML":
              throw Error("`dangerouslySetInnerHTML` does not make sense on <title>.");
            default:
              K(a, d, v, g);
          }
          a.push(L);
          return e;
        case "listing":
        case "pre":
          a.push(N(b));
          g = e = null;
          for (m in c) if (y.call(c, m) && (h = c[m], null != h)) switch (m) {
            case "children":
              e = h;
              break;
            case "dangerouslySetInnerHTML":
              g = h;
              break;
            default:
              K(a, d, m, h);
          }
          a.push(L);
          if (null != g) {
            if (null != e) throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
            if ("object" !== typeof g || !("__html" in g)) throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
            c = g.__html;
            null !== c && void 0 !== c && ("string" === typeof c && 0 < c.length && "\n" === c[0] ? a.push(La, c) : a.push("" + c));
          }
          "string" === typeof e && "\n" === e[0] && a.push(La);
          return e;
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "img":
        case "keygen":
        case "link":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
          a.push(N(b));
          for (var D in c) if (y.call(c, D) && (e = c[D], null != e)) switch (D) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw Error(b + " is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
            default:
              K(a, d, D, e);
          }
          a.push(Ha);
          return null;
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return Ka(a, c, b, d);
        case "html":
          return 0 === f.insertionMode && a.push(Oa), Ka(
            a,
            c,
            b,
            d
          );
        default:
          if (-1 === b.indexOf("-") && "string" !== typeof c.is) return Ka(a, c, b, d);
          a.push(N(b));
          g = e = null;
          for (n in c) if (y.call(c, n) && (h = c[n], null != h)) switch (n) {
            case "children":
              e = h;
              break;
            case "dangerouslySetInnerHTML":
              g = h;
              break;
            case "style":
              Fa(a, d, h);
              break;
            case "suppressContentEditableWarning":
            case "suppressHydrationWarning":
              break;
            default:
              ha(n) && "function" !== typeof h && "symbol" !== typeof h && a.push(I, n, J, F(h), H);
          }
          a.push(L);
          M(a, g, e);
          return e;
      }
    }
    var Qa = x("</");
    var Ra = x(">");
    var Sa = x('<template id="');
    var Ta = x('"></template>');
    var Ua = x("<!--$-->");
    var Va = x('<!--$?--><template id="');
    var Wa = x('"></template>');
    var Xa = x("<!--$!-->");
    var Ya = x("<!--/$-->");
    var Za = x("<template");
    var $a = x('"');
    var ab = x(' data-dgst="');
    x(' data-msg="');
    x(' data-stck="');
    var bb = x("></template>");
    function cb(a, b, c) {
      r(a, Va);
      if (null === c) throw Error("An ID must have been assigned before we can complete the boundary.");
      r(a, c);
      return w(a, Wa);
    }
    var db = x('<div hidden id="');
    var eb = x('">');
    var fb = x("</div>");
    var gb = x('<svg aria-hidden="true" style="display:none" id="');
    var hb = x('">');
    var ib = x("</svg>");
    var jb = x('<math aria-hidden="true" style="display:none" id="');
    var kb = x('">');
    var lb = x("</math>");
    var mb = x('<table hidden id="');
    var nb = x('">');
    var ob = x("</table>");
    var pb = x('<table hidden><tbody id="');
    var qb = x('">');
    var rb = x("</tbody></table>");
    var sb = x('<table hidden><tr id="');
    var tb = x('">');
    var ub = x("</tr></table>");
    var vb = x('<table hidden><colgroup id="');
    var wb = x('">');
    var xb = x("</colgroup></table>");
    function yb(a, b, c, d) {
      switch (c.insertionMode) {
        case 0:
        case 1:
          return r(a, db), r(a, b.segmentPrefix), r(a, d.toString(16)), w(a, eb);
        case 2:
          return r(a, gb), r(a, b.segmentPrefix), r(a, d.toString(16)), w(a, hb);
        case 3:
          return r(a, jb), r(a, b.segmentPrefix), r(a, d.toString(16)), w(a, kb);
        case 4:
          return r(a, mb), r(a, b.segmentPrefix), r(a, d.toString(16)), w(a, nb);
        case 5:
          return r(a, pb), r(a, b.segmentPrefix), r(a, d.toString(16)), w(a, qb);
        case 6:
          return r(a, sb), r(a, b.segmentPrefix), r(a, d.toString(16)), w(a, tb);
        case 7:
          return r(a, vb), r(
            a,
            b.segmentPrefix
          ), r(a, d.toString(16)), w(a, wb);
        default:
          throw Error("Unknown insertion mode. This is a bug in React.");
      }
    }
    function zb(a, b) {
      switch (b.insertionMode) {
        case 0:
        case 1:
          return w(a, fb);
        case 2:
          return w(a, ib);
        case 3:
          return w(a, lb);
        case 4:
          return w(a, ob);
        case 5:
          return w(a, rb);
        case 6:
          return w(a, ub);
        case 7:
          return w(a, xb);
        default:
          throw Error("Unknown insertion mode. This is a bug in React.");
      }
    }
    var Ab = x('function $RS(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)};$RS("');
    var Bb = x('$RS("');
    var Cb = x('","');
    var Db = x('")</script>');
    var Fb = x('function $RC(a,b){a=document.getElementById(a);b=document.getElementById(b);b.parentNode.removeChild(b);if(a){a=a.previousSibling;var f=a.parentNode,c=a.nextSibling,e=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d)if(0===e)break;else e--;else"$"!==d&&"$?"!==d&&"$!"!==d||e++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;b.firstChild;)f.insertBefore(b.firstChild,c);a.data="$";a._reactRetry&&a._reactRetry()}};$RC("');
    var Gb = x('$RC("');
    var Hb = x('","');
    var Ib = x('")</script>');
    var Jb = x('function $RX(b,c,d,e){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),b._reactRetry&&b._reactRetry())};$RX("');
    var Kb = x('$RX("');
    var Lb = x('"');
    var Mb = x(")</script>");
    var Nb = x(",");
    var Ob = /[<\u2028\u2029]/g;
    function Pb(a) {
      return JSON.stringify(a).replace(Ob, function(a2) {
        switch (a2) {
          case "<":
            return "\\u003c";
          case "\u2028":
            return "\\u2028";
          case "\u2029":
            return "\\u2029";
          default:
            throw Error("escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
        }
      });
    }
    var O = Object.assign;
    var Qb = Symbol.for("react.element");
    var Rb = Symbol.for("react.portal");
    var Sb = Symbol.for("react.fragment");
    var Tb = Symbol.for("react.strict_mode");
    var Ub = Symbol.for("react.profiler");
    var Vb = Symbol.for("react.provider");
    var Wb = Symbol.for("react.context");
    var Xb = Symbol.for("react.forward_ref");
    var Yb = Symbol.for("react.suspense");
    var Zb = Symbol.for("react.suspense_list");
    var $b = Symbol.for("react.memo");
    var ac = Symbol.for("react.lazy");
    var bc = Symbol.for("react.scope");
    var cc = Symbol.for("react.debug_trace_mode");
    var dc = Symbol.for("react.legacy_hidden");
    var ec = Symbol.for("react.default_value");
    var fc = Symbol.iterator;
    function gc(a) {
      if (null == a) return null;
      if ("function" === typeof a) return a.displayName || a.name || null;
      if ("string" === typeof a) return a;
      switch (a) {
        case Sb:
          return "Fragment";
        case Rb:
          return "Portal";
        case Ub:
          return "Profiler";
        case Tb:
          return "StrictMode";
        case Yb:
          return "Suspense";
        case Zb:
          return "SuspenseList";
      }
      if ("object" === typeof a) switch (a.$$typeof) {
        case Wb:
          return (a.displayName || "Context") + ".Consumer";
        case Vb:
          return (a._context.displayName || "Context") + ".Provider";
        case Xb:
          var b = a.render;
          a = a.displayName;
          a || (a = b.displayName || b.name || "", a = "" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
          return a;
        case $b:
          return b = a.displayName || null, null !== b ? b : gc(a.type) || "Memo";
        case ac:
          b = a._payload;
          a = a._init;
          try {
            return gc(a(b));
          } catch (c) {
          }
      }
      return null;
    }
    var hc = {};
    function ic(a, b) {
      a = a.contextTypes;
      if (!a) return hc;
      var c = {}, d;
      for (d in a) c[d] = b[d];
      return c;
    }
    var P = null;
    function Q(a, b) {
      if (a !== b) {
        a.context._currentValue = a.parentValue;
        a = a.parent;
        var c = b.parent;
        if (null === a) {
          if (null !== c) throw Error("The stacks must reach the root at the same time. This is a bug in React.");
        } else {
          if (null === c) throw Error("The stacks must reach the root at the same time. This is a bug in React.");
          Q(a, c);
        }
        b.context._currentValue = b.value;
      }
    }
    function jc(a) {
      a.context._currentValue = a.parentValue;
      a = a.parent;
      null !== a && jc(a);
    }
    function kc(a) {
      var b = a.parent;
      null !== b && kc(b);
      a.context._currentValue = a.value;
    }
    function lc(a, b) {
      a.context._currentValue = a.parentValue;
      a = a.parent;
      if (null === a) throw Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
      a.depth === b.depth ? Q(a, b) : lc(a, b);
    }
    function mc(a, b) {
      var c = b.parent;
      if (null === c) throw Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
      a.depth === c.depth ? Q(a, c) : mc(a, c);
      b.context._currentValue = b.value;
    }
    function nc(a) {
      var b = P;
      b !== a && (null === b ? kc(a) : null === a ? jc(b) : b.depth === a.depth ? Q(b, a) : b.depth > a.depth ? lc(b, a) : mc(b, a), P = a);
    }
    var oc = { isMounted: function() {
      return false;
    }, enqueueSetState: function(a, b) {
      a = a._reactInternals;
      null !== a.queue && a.queue.push(b);
    }, enqueueReplaceState: function(a, b) {
      a = a._reactInternals;
      a.replace = true;
      a.queue = [b];
    }, enqueueForceUpdate: function() {
    } };
    function pc(a, b, c, d) {
      var f = void 0 !== a.state ? a.state : null;
      a.updater = oc;
      a.props = c;
      a.state = f;
      var e = { queue: [], replace: false };
      a._reactInternals = e;
      var g = b.contextType;
      a.context = "object" === typeof g && null !== g ? g._currentValue : d;
      g = b.getDerivedStateFromProps;
      "function" === typeof g && (g = g(c, f), f = null === g || void 0 === g ? f : O({}, f, g), a.state = f);
      if ("function" !== typeof b.getDerivedStateFromProps && "function" !== typeof a.getSnapshotBeforeUpdate && ("function" === typeof a.UNSAFE_componentWillMount || "function" === typeof a.componentWillMount)) if (b = a.state, "function" === typeof a.componentWillMount && a.componentWillMount(), "function" === typeof a.UNSAFE_componentWillMount && a.UNSAFE_componentWillMount(), b !== a.state && oc.enqueueReplaceState(a, a.state, null), null !== e.queue && 0 < e.queue.length) if (b = e.queue, g = e.replace, e.queue = null, e.replace = false, g && 1 === b.length) a.state = b[0];
      else {
        e = g ? b[0] : a.state;
        f = true;
        for (g = g ? 1 : 0; g < b.length; g++) {
          var h = b[g];
          h = "function" === typeof h ? h.call(a, e, c, d) : h;
          null != h && (f ? (f = false, e = O({}, e, h)) : O(e, h));
        }
        a.state = e;
      }
      else e.queue = null;
    }
    var qc = { id: 1, overflow: "" };
    function rc(a, b, c) {
      var d = a.id;
      a = a.overflow;
      var f = 32 - sc(d) - 1;
      d &= ~(1 << f);
      c += 1;
      var e = 32 - sc(b) + f;
      if (30 < e) {
        var g = f - f % 5;
        e = (d & (1 << g) - 1).toString(32);
        d >>= g;
        f -= g;
        return { id: 1 << 32 - sc(b) + f | c << f | d, overflow: e + a };
      }
      return { id: 1 << e | c << f | d, overflow: a };
    }
    var sc = Math.clz32 ? Math.clz32 : tc;
    var uc = Math.log;
    var vc = Math.LN2;
    function tc(a) {
      a >>>= 0;
      return 0 === a ? 32 : 31 - (uc(a) / vc | 0) | 0;
    }
    function wc(a, b) {
      return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
    }
    var xc = "function" === typeof Object.is ? Object.is : wc;
    var R = null;
    var yc = null;
    var zc = null;
    var S = null;
    var T2 = false;
    var Ac = false;
    var U = 0;
    var V = null;
    var Bc = 0;
    function W() {
      if (null === R) throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
      return R;
    }
    function Cc() {
      if (0 < Bc) throw Error("Rendered more hooks than during the previous render");
      return { memoizedState: null, queue: null, next: null };
    }
    function Dc() {
      null === S ? null === zc ? (T2 = false, zc = S = Cc()) : (T2 = true, S = zc) : null === S.next ? (T2 = false, S = S.next = Cc()) : (T2 = true, S = S.next);
      return S;
    }
    function Ec() {
      yc = R = null;
      Ac = false;
      zc = null;
      Bc = 0;
      S = V = null;
    }
    function Fc(a, b) {
      return "function" === typeof b ? b(a) : b;
    }
    function Gc(a, b, c) {
      R = W();
      S = Dc();
      if (T2) {
        var d = S.queue;
        b = d.dispatch;
        if (null !== V && (c = V.get(d), void 0 !== c)) {
          V.delete(d);
          d = S.memoizedState;
          do
            d = a(d, c.action), c = c.next;
          while (null !== c);
          S.memoizedState = d;
          return [d, b];
        }
        return [S.memoizedState, b];
      }
      a = a === Fc ? "function" === typeof b ? b() : b : void 0 !== c ? c(b) : b;
      S.memoizedState = a;
      a = S.queue = { last: null, dispatch: null };
      a = a.dispatch = Hc.bind(null, R, a);
      return [S.memoizedState, a];
    }
    function Ic(a, b) {
      R = W();
      S = Dc();
      b = void 0 === b ? null : b;
      if (null !== S) {
        var c = S.memoizedState;
        if (null !== c && null !== b) {
          var d = c[1];
          a: if (null === d) d = false;
          else {
            for (var f = 0; f < d.length && f < b.length; f++) if (!xc(b[f], d[f])) {
              d = false;
              break a;
            }
            d = true;
          }
          if (d) return c[0];
        }
      }
      a = a();
      S.memoizedState = [a, b];
      return a;
    }
    function Hc(a, b, c) {
      if (25 <= Bc) throw Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
      if (a === R) if (Ac = true, a = { action: c, next: null }, null === V && (V = /* @__PURE__ */ new Map()), c = V.get(b), void 0 === c) V.set(b, a);
      else {
        for (b = c; null !== b.next; ) b = b.next;
        b.next = a;
      }
    }
    function Jc() {
      throw Error("startTransition cannot be called during server rendering.");
    }
    function Kc() {
    }
    var Mc = { readContext: function(a) {
      return a._currentValue;
    }, useContext: function(a) {
      W();
      return a._currentValue;
    }, useMemo: Ic, useReducer: Gc, useRef: function(a) {
      R = W();
      S = Dc();
      var b = S.memoizedState;
      return null === b ? (a = { current: a }, S.memoizedState = a) : b;
    }, useState: function(a) {
      return Gc(Fc, a);
    }, useInsertionEffect: Kc, useLayoutEffect: function() {
    }, useCallback: function(a, b) {
      return Ic(function() {
        return a;
      }, b);
    }, useImperativeHandle: Kc, useEffect: Kc, useDebugValue: Kc, useDeferredValue: function(a) {
      W();
      return a;
    }, useTransition: function() {
      W();
      return [false, Jc];
    }, useId: function() {
      var a = yc.treeContext;
      var b = a.overflow;
      a = a.id;
      a = (a & ~(1 << 32 - sc(a) - 1)).toString(32) + b;
      var c = Lc;
      if (null === c) throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component.");
      b = U++;
      a = ":" + c.idPrefix + "R" + a;
      0 < b && (a += "H" + b.toString(32));
      return a + ":";
    }, useMutableSource: function(a, b) {
      W();
      return b(a._source);
    }, useSyncExternalStore: function(a, b, c) {
      if (void 0 === c) throw Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
      return c();
    } };
    var Lc = null;
    var Nc = ba.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher;
    function Oc(a) {
      console.error(a);
      return null;
    }
    function X() {
    }
    function Pc(a, b) {
      var c = a.pingedTasks;
      c.push(b);
      1 === c.length && setImmediate(function() {
        return Qc(a);
      });
    }
    function Rc(a, b, c, d, f, e, g, h) {
      a.allPendingTasks++;
      null === c ? a.pendingRootTasks++ : c.pendingTasks++;
      var m = { node: b, ping: function() {
        return Pc(a, m);
      }, blockedBoundary: c, blockedSegment: d, abortSet: f, legacyContext: e, context: g, treeContext: h };
      f.add(m);
      return m;
    }
    function Sc(a, b, c, d, f, e) {
      return { status: 0, id: -1, index: b, parentFlushed: false, chunks: [], children: [], formatContext: d, boundary: c, lastPushedText: f, textEmbedded: e };
    }
    function Y(a, b) {
      a = a.onError(b);
      if (null != a && "string" !== typeof a) throw Error('onError returned something with a type other than "string". onError should return a string and may return null or undefined but must not return anything else. It received something of type "' + typeof a + '" instead');
      return a;
    }
    function Tc(a, b) {
      var c = a.onShellError;
      c(b);
      c = a.onFatalError;
      c(b);
      null !== a.destination ? (a.status = 2, a.destination.destroy(b)) : (a.status = 1, a.fatalError = b);
    }
    function Uc(a, b, c, d, f) {
      R = {};
      yc = b;
      U = 0;
      for (a = c(d, f); Ac; ) Ac = false, U = 0, Bc += 1, S = null, a = c(d, f);
      Ec();
      return a;
    }
    function Vc(a, b, c, d) {
      var f = c.render(), e = d.childContextTypes;
      if (null !== e && void 0 !== e) {
        var g = b.legacyContext;
        if ("function" !== typeof c.getChildContext) d = g;
        else {
          c = c.getChildContext();
          for (var h in c) if (!(h in e)) throw Error((gc(d) || "Unknown") + '.getChildContext(): key "' + h + '" is not defined in childContextTypes.');
          d = O({}, g, c);
        }
        b.legacyContext = d;
        Z(a, b, f);
        b.legacyContext = g;
      } else Z(a, b, f);
    }
    function Wc(a, b) {
      if (a && a.defaultProps) {
        b = O({}, b);
        a = a.defaultProps;
        for (var c in a) void 0 === b[c] && (b[c] = a[c]);
        return b;
      }
      return b;
    }
    function Xc(a, b, c, d, f) {
      if ("function" === typeof c) if (c.prototype && c.prototype.isReactComponent) {
        f = ic(c, b.legacyContext);
        var e = c.contextType;
        e = new c(d, "object" === typeof e && null !== e ? e._currentValue : f);
        pc(e, c, d, f);
        Vc(a, b, e, c);
      } else {
        e = ic(c, b.legacyContext);
        f = Uc(a, b, c, d, e);
        var g = 0 !== U;
        if ("object" === typeof f && null !== f && "function" === typeof f.render && void 0 === f.$$typeof) pc(f, c, d, e), Vc(a, b, f, c);
        else if (g) {
          d = b.treeContext;
          b.treeContext = rc(d, 1, 0);
          try {
            Z(a, b, f);
          } finally {
            b.treeContext = d;
          }
        } else Z(a, b, f);
      }
      else if ("string" === typeof c) {
        f = b.blockedSegment;
        e = Pa(f.chunks, c, d, a.responseState, f.formatContext);
        f.lastPushedText = false;
        g = f.formatContext;
        f.formatContext = ya(g, c, d);
        Yc(a, b, e);
        f.formatContext = g;
        switch (c) {
          case "area":
          case "base":
          case "br":
          case "col":
          case "embed":
          case "hr":
          case "img":
          case "input":
          case "keygen":
          case "link":
          case "meta":
          case "param":
          case "source":
          case "track":
          case "wbr":
            break;
          default:
            f.chunks.push(Qa, c, Ra);
        }
        f.lastPushedText = false;
      } else {
        switch (c) {
          case dc:
          case cc:
          case Tb:
          case Ub:
          case Sb:
            Z(a, b, d.children);
            return;
          case Zb:
            Z(
              a,
              b,
              d.children
            );
            return;
          case bc:
            throw Error("ReactDOMServer does not yet support scope components.");
          case Yb:
            a: {
              c = b.blockedBoundary;
              f = b.blockedSegment;
              e = d.fallback;
              d = d.children;
              g = /* @__PURE__ */ new Set();
              var h = { id: null, rootSegmentID: -1, parentFlushed: false, pendingTasks: 0, forceClientRender: false, completedSegments: [], byteSize: 0, fallbackAbortableTasks: g, errorDigest: null }, m = Sc(a, f.chunks.length, h, f.formatContext, false, false);
              f.children.push(m);
              f.lastPushedText = false;
              var n = Sc(a, 0, null, f.formatContext, false, false);
              n.parentFlushed = true;
              b.blockedBoundary = h;
              b.blockedSegment = n;
              try {
                if (Yc(a, b, d), n.lastPushedText && n.textEmbedded && n.chunks.push(za), n.status = 1, Zc(h, n), 0 === h.pendingTasks) break a;
              } catch (p) {
                n.status = 4, h.forceClientRender = true, h.errorDigest = Y(a, p);
              } finally {
                b.blockedBoundary = c, b.blockedSegment = f;
              }
              b = Rc(a, e, c, m, g, b.legacyContext, b.context, b.treeContext);
              a.pingedTasks.push(b);
            }
            return;
        }
        if ("object" === typeof c && null !== c) switch (c.$$typeof) {
          case Xb:
            d = Uc(a, b, c.render, d, f);
            if (0 !== U) {
              c = b.treeContext;
              b.treeContext = rc(c, 1, 0);
              try {
                Z(a, b, d);
              } finally {
                b.treeContext = c;
              }
            } else Z(
              a,
              b,
              d
            );
            return;
          case $b:
            c = c.type;
            d = Wc(c, d);
            Xc(a, b, c, d, f);
            return;
          case Vb:
            f = d.children;
            c = c._context;
            d = d.value;
            e = c._currentValue;
            c._currentValue = d;
            g = P;
            P = d = { parent: g, depth: null === g ? 0 : g.depth + 1, context: c, parentValue: e, value: d };
            b.context = d;
            Z(a, b, f);
            a = P;
            if (null === a) throw Error("Tried to pop a Context at the root of the app. This is a bug in React.");
            d = a.parentValue;
            a.context._currentValue = d === ec ? a.context._defaultValue : d;
            a = P = a.parent;
            b.context = a;
            return;
          case Wb:
            d = d.children;
            d = d(c._currentValue);
            Z(a, b, d);
            return;
          case ac:
            f = c._init;
            c = f(c._payload);
            d = Wc(c, d);
            Xc(a, b, c, d, void 0);
            return;
        }
        throw Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: " + ((null == c ? c : typeof c) + "."));
      }
    }
    function Z(a, b, c) {
      b.node = c;
      if ("object" === typeof c && null !== c) {
        switch (c.$$typeof) {
          case Qb:
            Xc(a, b, c.type, c.props, c.ref);
            return;
          case Rb:
            throw Error("Portals are not currently supported by the server renderer. Render them conditionally so that they only appear on the client render.");
          case ac:
            var d = c._init;
            c = d(c._payload);
            Z(a, b, c);
            return;
        }
        if (qa(c)) {
          $c(a, b, c);
          return;
        }
        null === c || "object" !== typeof c ? d = null : (d = fc && c[fc] || c["@@iterator"], d = "function" === typeof d ? d : null);
        if (d && (d = d.call(c))) {
          c = d.next();
          if (!c.done) {
            var f = [];
            do
              f.push(c.value), c = d.next();
            while (!c.done);
            $c(a, b, f);
          }
          return;
        }
        a = Object.prototype.toString.call(c);
        throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === a ? "object with keys {" + Object.keys(c).join(", ") + "}" : a) + "). If you meant to render a collection of children, use an array instead.");
      }
      "string" === typeof c ? (d = b.blockedSegment, d.lastPushedText = Aa(b.blockedSegment.chunks, c, a.responseState, d.lastPushedText)) : "number" === typeof c && (d = b.blockedSegment, d.lastPushedText = Aa(
        b.blockedSegment.chunks,
        "" + c,
        a.responseState,
        d.lastPushedText
      ));
    }
    function $c(a, b, c) {
      for (var d = c.length, f = 0; f < d; f++) {
        var e = b.treeContext;
        b.treeContext = rc(e, d, f);
        try {
          Yc(a, b, c[f]);
        } finally {
          b.treeContext = e;
        }
      }
    }
    function Yc(a, b, c) {
      var d = b.blockedSegment.formatContext, f = b.legacyContext, e = b.context;
      try {
        return Z(a, b, c);
      } catch (m) {
        if (Ec(), "object" === typeof m && null !== m && "function" === typeof m.then) {
          c = m;
          var g = b.blockedSegment, h = Sc(a, g.chunks.length, null, g.formatContext, g.lastPushedText, true);
          g.children.push(h);
          g.lastPushedText = false;
          a = Rc(a, b.node, b.blockedBoundary, h, b.abortSet, b.legacyContext, b.context, b.treeContext).ping;
          c.then(a, a);
          b.blockedSegment.formatContext = d;
          b.legacyContext = f;
          b.context = e;
          nc(e);
        } else throw b.blockedSegment.formatContext = d, b.legacyContext = f, b.context = e, nc(e), m;
      }
    }
    function ad(a) {
      var b = a.blockedBoundary;
      a = a.blockedSegment;
      a.status = 3;
      bd(this, b, a);
    }
    function cd(a, b, c) {
      var d = a.blockedBoundary;
      a.blockedSegment.status = 3;
      null === d ? (b.allPendingTasks--, 2 !== b.status && (b.status = 2, null !== b.destination && b.destination.end())) : (d.pendingTasks--, d.forceClientRender || (d.forceClientRender = true, d.errorDigest = b.onError(void 0 === c ? Error("The render was aborted by the server without a reason.") : c), d.parentFlushed && b.clientRenderedBoundaries.push(d)), d.fallbackAbortableTasks.forEach(function(a2) {
        return cd(a2, b, c);
      }), d.fallbackAbortableTasks.clear(), b.allPendingTasks--, 0 === b.allPendingTasks && (a = b.onAllReady, a()));
    }
    function Zc(a, b) {
      if (0 === b.chunks.length && 1 === b.children.length && null === b.children[0].boundary) {
        var c = b.children[0];
        c.id = b.id;
        c.parentFlushed = true;
        1 === c.status && Zc(a, c);
      } else a.completedSegments.push(b);
    }
    function bd(a, b, c) {
      if (null === b) {
        if (c.parentFlushed) {
          if (null !== a.completedRootSegment) throw Error("There can only be one root segment. This is a bug in React.");
          a.completedRootSegment = c;
        }
        a.pendingRootTasks--;
        0 === a.pendingRootTasks && (a.onShellError = X, b = a.onShellReady, b());
      } else b.pendingTasks--, b.forceClientRender || (0 === b.pendingTasks ? (c.parentFlushed && 1 === c.status && Zc(b, c), b.parentFlushed && a.completedBoundaries.push(b), b.fallbackAbortableTasks.forEach(ad, a), b.fallbackAbortableTasks.clear()) : c.parentFlushed && 1 === c.status && (Zc(b, c), 1 === b.completedSegments.length && b.parentFlushed && a.partialBoundaries.push(b)));
      a.allPendingTasks--;
      0 === a.allPendingTasks && (a = a.onAllReady, a());
    }
    function Qc(a) {
      if (2 !== a.status) {
        var b = P, c = Nc.current;
        Nc.current = Mc;
        var d = Lc;
        Lc = a.responseState;
        try {
          var f = a.pingedTasks, e;
          for (e = 0; e < f.length; e++) {
            var g = f[e];
            var h = a, m = g.blockedSegment;
            if (0 === m.status) {
              nc(g.context);
              try {
                Z(h, g, g.node), m.lastPushedText && m.textEmbedded && m.chunks.push(za), g.abortSet.delete(g), m.status = 1, bd(h, g.blockedBoundary, m);
              } catch (E) {
                if (Ec(), "object" === typeof E && null !== E && "function" === typeof E.then) {
                  var n = g.ping;
                  E.then(n, n);
                } else {
                  g.abortSet.delete(g);
                  m.status = 4;
                  var p = g.blockedBoundary, v = E, C = Y(h, v);
                  null === p ? Tc(h, v) : (p.pendingTasks--, p.forceClientRender || (p.forceClientRender = true, p.errorDigest = C, p.parentFlushed && h.clientRenderedBoundaries.push(p)));
                  h.allPendingTasks--;
                  if (0 === h.allPendingTasks) {
                    var D = h.onAllReady;
                    D();
                  }
                }
              } finally {
              }
            }
          }
          f.splice(0, e);
          null !== a.destination && dd(a, a.destination);
        } catch (E) {
          Y(a, E), Tc(a, E);
        } finally {
          Lc = d, Nc.current = c, c === Mc && nc(b);
        }
      }
    }
    function ed(a, b, c) {
      c.parentFlushed = true;
      switch (c.status) {
        case 0:
          var d = c.id = a.nextSegmentId++;
          c.lastPushedText = false;
          c.textEmbedded = false;
          a = a.responseState;
          r(b, Sa);
          r(b, a.placeholderPrefix);
          a = d.toString(16);
          r(b, a);
          return w(b, Ta);
        case 1:
          c.status = 2;
          var f = true;
          d = c.chunks;
          var e = 0;
          c = c.children;
          for (var g = 0; g < c.length; g++) {
            for (f = c[g]; e < f.index; e++) r(b, d[e]);
            f = fd(a, b, f);
          }
          for (; e < d.length - 1; e++) r(b, d[e]);
          e < d.length && (f = w(b, d[e]));
          return f;
        default:
          throw Error("Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.");
      }
    }
    function fd(a, b, c) {
      var d = c.boundary;
      if (null === d) return ed(a, b, c);
      d.parentFlushed = true;
      if (d.forceClientRender) d = d.errorDigest, w(b, Xa), r(b, Za), d && (r(b, ab), r(b, F(d)), r(b, $a)), w(b, bb), ed(a, b, c);
      else if (0 < d.pendingTasks) {
        d.rootSegmentID = a.nextSegmentId++;
        0 < d.completedSegments.length && a.partialBoundaries.push(d);
        var f = a.responseState;
        var e = f.nextSuspenseID++;
        f = x(f.boundaryPrefix + e.toString(16));
        d = d.id = f;
        cb(b, a.responseState, d);
        ed(a, b, c);
      } else if (d.byteSize > a.progressiveChunkSize) d.rootSegmentID = a.nextSegmentId++, a.completedBoundaries.push(d), cb(b, a.responseState, d.id), ed(a, b, c);
      else {
        w(b, Ua);
        c = d.completedSegments;
        if (1 !== c.length) throw Error("A previously unvisited boundary must have exactly one root segment. This is a bug in React.");
        fd(a, b, c[0]);
      }
      return w(b, Ya);
    }
    function gd(a, b, c) {
      yb(b, a.responseState, c.formatContext, c.id);
      fd(a, b, c);
      return zb(b, c.formatContext);
    }
    function hd(a, b, c) {
      for (var d = c.completedSegments, f = 0; f < d.length; f++) id(a, b, c, d[f]);
      d.length = 0;
      a = a.responseState;
      d = c.id;
      c = c.rootSegmentID;
      r(b, a.startInlineScript);
      a.sentCompleteBoundaryFunction ? r(b, Gb) : (a.sentCompleteBoundaryFunction = true, r(b, Fb));
      if (null === d) throw Error("An ID must have been assigned before we can complete the boundary.");
      c = c.toString(16);
      r(b, d);
      r(b, Hb);
      r(b, a.segmentPrefix);
      r(b, c);
      return w(b, Ib);
    }
    function id(a, b, c, d) {
      if (2 === d.status) return true;
      var f = d.id;
      if (-1 === f) {
        if (-1 === (d.id = c.rootSegmentID)) throw Error("A root segment ID must have been assigned by now. This is a bug in React.");
        return gd(a, b, d);
      }
      gd(a, b, d);
      a = a.responseState;
      r(b, a.startInlineScript);
      a.sentCompleteSegmentFunction ? r(b, Bb) : (a.sentCompleteSegmentFunction = true, r(b, Ab));
      r(b, a.segmentPrefix);
      f = f.toString(16);
      r(b, f);
      r(b, Cb);
      r(b, a.placeholderPrefix);
      r(b, f);
      return w(b, Db);
    }
    function dd(a, b) {
      k = new Uint8Array(2048);
      l = 0;
      q = true;
      try {
        var c = a.completedRootSegment;
        if (null !== c && 0 === a.pendingRootTasks) {
          fd(a, b, c);
          a.completedRootSegment = null;
          var d = a.responseState.bootstrapChunks;
          for (c = 0; c < d.length - 1; c++) r(b, d[c]);
          c < d.length && w(b, d[c]);
        }
        var f = a.clientRenderedBoundaries, e;
        for (e = 0; e < f.length; e++) {
          var g = f[e];
          d = b;
          var h = a.responseState, m = g.id, n = g.errorDigest, p = g.errorMessage, v = g.errorComponentStack;
          r(d, h.startInlineScript);
          h.sentClientRenderFunction ? r(d, Kb) : (h.sentClientRenderFunction = true, r(d, Jb));
          if (null === m) throw Error("An ID must have been assigned before we can complete the boundary.");
          r(d, m);
          r(d, Lb);
          if (n || p || v) r(d, Nb), r(d, Pb(n || ""));
          if (p || v) r(d, Nb), r(d, Pb(p || ""));
          v && (r(d, Nb), r(d, Pb(v)));
          if (!w(d, Mb)) {
            a.destination = null;
            e++;
            f.splice(0, e);
            return;
          }
        }
        f.splice(0, e);
        var C = a.completedBoundaries;
        for (e = 0; e < C.length; e++) if (!hd(a, b, C[e])) {
          a.destination = null;
          e++;
          C.splice(0, e);
          return;
        }
        C.splice(0, e);
        ca(b);
        k = new Uint8Array(2048);
        l = 0;
        q = true;
        var D = a.partialBoundaries;
        for (e = 0; e < D.length; e++) {
          var E = D[e];
          a: {
            f = a;
            g = b;
            var na = E.completedSegments;
            for (h = 0; h < na.length; h++) if (!id(f, g, E, na[h])) {
              h++;
              na.splice(0, h);
              var Eb = false;
              break a;
            }
            na.splice(0, h);
            Eb = true;
          }
          if (!Eb) {
            a.destination = null;
            e++;
            D.splice(0, e);
            return;
          }
        }
        D.splice(0, e);
        var oa = a.completedBoundaries;
        for (e = 0; e < oa.length; e++) if (!hd(a, b, oa[e])) {
          a.destination = null;
          e++;
          oa.splice(0, e);
          return;
        }
        oa.splice(0, e);
      } finally {
        ca(b), "function" === typeof b.flush && b.flush(), 0 === a.allPendingTasks && 0 === a.pingedTasks.length && 0 === a.clientRenderedBoundaries.length && 0 === a.completedBoundaries.length && b.end();
      }
    }
    function jd(a) {
      setImmediate(function() {
        return Qc(a);
      });
    }
    function kd(a, b) {
      if (1 === a.status) a.status = 2, b.destroy(a.fatalError);
      else if (2 !== a.status && null === a.destination) {
        a.destination = b;
        try {
          dd(a, b);
        } catch (c) {
          Y(a, c), Tc(a, c);
        }
      }
    }
    function ld(a, b) {
      try {
        var c = a.abortableTasks;
        c.forEach(function(c2) {
          return cd(c2, a, b);
        });
        c.clear();
        null !== a.destination && dd(a, a.destination);
      } catch (d) {
        Y(a, d), Tc(a, d);
      }
    }
    function md(a, b) {
      return function() {
        return kd(b, a);
      };
    }
    function nd(a, b) {
      return function() {
        return ld(a, b);
      };
    }
    function od(a, b) {
      var c = b ? b.identifierPrefix : void 0, d = b ? b.nonce : void 0, f = b ? b.bootstrapScriptContent : void 0, e = b ? b.bootstrapScripts : void 0;
      var g = b ? b.bootstrapModules : void 0;
      c = void 0 === c ? "" : c;
      d = void 0 === d ? ra : x('<script nonce="' + F(d) + '">');
      var h = [];
      void 0 !== f && h.push(d, ("" + f).replace(wa, xa), sa);
      if (void 0 !== e) for (f = 0; f < e.length; f++) h.push(ta, F(e[f]), va);
      if (void 0 !== g) for (e = 0; e < g.length; e++) h.push(ua, F(g[e]), va);
      g = {
        bootstrapChunks: h,
        startInlineScript: d,
        placeholderPrefix: x(c + "P:"),
        segmentPrefix: x(c + "S:"),
        boundaryPrefix: c + "B:",
        idPrefix: c,
        nextSuspenseID: 0,
        sentCompleteSegmentFunction: false,
        sentCompleteBoundaryFunction: false,
        sentClientRenderFunction: false
      };
      e = b ? b.namespaceURI : void 0;
      e = G("http://www.w3.org/2000/svg" === e ? 2 : "http://www.w3.org/1998/Math/MathML" === e ? 3 : 0, null);
      f = b ? b.progressiveChunkSize : void 0;
      d = b ? b.onError : void 0;
      h = b ? b.onAllReady : void 0;
      var m = b ? b.onShellReady : void 0, n = b ? b.onShellError : void 0;
      b = [];
      c = /* @__PURE__ */ new Set();
      g = {
        destination: null,
        responseState: g,
        progressiveChunkSize: void 0 === f ? 12800 : f,
        status: 0,
        fatalError: null,
        nextSegmentId: 0,
        allPendingTasks: 0,
        pendingRootTasks: 0,
        completedRootSegment: null,
        abortableTasks: c,
        pingedTasks: b,
        clientRenderedBoundaries: [],
        completedBoundaries: [],
        partialBoundaries: [],
        onError: void 0 === d ? Oc : d,
        onAllReady: void 0 === h ? X : h,
        onShellReady: void 0 === m ? X : m,
        onShellError: void 0 === n ? X : n,
        onFatalError: X
      };
      e = Sc(g, 0, null, e, false, false);
      e.parentFlushed = true;
      a = Rc(g, a, null, e, c, hc, null, qc);
      b.push(a);
      return g;
    }
    exports2.renderToPipeableStream = function(a, b) {
      var c = od(a, b), d = false;
      jd(c);
      return { pipe: function(a2) {
        if (d) throw Error("React currently only supports piping to one writable stream.");
        d = true;
        kd(c, a2);
        a2.on("drain", md(a2, c));
        a2.on("error", nd(c, Error("The destination stream errored while writing data.")));
        a2.on("close", nd(c, Error("The destination stream closed early.")));
        return a2;
      }, abort: function(a2) {
        ld(c, a2);
      } };
    };
    exports2.version = "18.3.1";
  }
});

// node_modules/react-dom/cjs/react-dom-server-legacy.node.development.js
var require_react_dom_server_legacy_node_development = __commonJS({
  "node_modules/react-dom/cjs/react-dom-server-legacy.node.development.js"(exports2) {
    "use strict";
    if (process.env.NODE_ENV !== "production") {
      (function() {
        "use strict";
        var React3 = require_react();
        var stream = require("stream");
        var ReactVersion = "18.3.1";
        var ReactSharedInternals = React3.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        function warn(format) {
          {
            {
              for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }
              printWarning("warn", format, args);
            }
          }
        }
        function error(format) {
          {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame2.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            var argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        function scheduleWork(callback) {
          callback();
        }
        function beginWriting(destination) {
        }
        function writeChunk(destination, chunk) {
          writeChunkAndReturn(destination, chunk);
        }
        function writeChunkAndReturn(destination, chunk) {
          return destination.push(chunk);
        }
        function completeWriting(destination) {
        }
        function close(destination) {
          destination.push(null);
        }
        function stringToChunk(content) {
          return content;
        }
        function stringToPrecomputedChunk(content) {
          return content;
        }
        function closeWithError(destination, error2) {
          destination.destroy(error2);
        }
        function typeName(value) {
          {
            var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
            var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            return type;
          }
        }
        function willCoercionThrow(value) {
          {
            try {
              testStringCoercion(value);
              return false;
            } catch (e) {
              return true;
            }
          }
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkAttributeStringCoercion(value, attributeName) {
          {
            if (willCoercionThrow(value)) {
              error("The provided `%s` attribute is an unsupported type %s. This value must be coerced to a string before before using it here.", attributeName, typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function checkCSSPropertyStringCoercion(value, propName) {
          {
            if (willCoercionThrow(value)) {
              error("The provided `%s` CSS property is an unsupported type %s. This value must be coerced to a string before before using it here.", propName, typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function checkHtmlStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("The provided HTML markup uses a value of unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var RESERVED = 0;
        var STRING = 1;
        var BOOLEANISH_STRING = 2;
        var BOOLEAN = 3;
        var OVERLOADED_BOOLEAN = 4;
        var NUMERIC = 5;
        var POSITIVE_NUMERIC = 6;
        var ATTRIBUTE_NAME_START_CHAR = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
        var ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
        var VALID_ATTRIBUTE_NAME_REGEX = new RegExp("^[" + ATTRIBUTE_NAME_START_CHAR + "][" + ATTRIBUTE_NAME_CHAR + "]*$");
        var illegalAttributeNameCache = {};
        var validatedAttributeNameCache = {};
        function isAttributeNameSafe(attributeName) {
          if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) {
            return true;
          }
          if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) {
            return false;
          }
          if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
            validatedAttributeNameCache[attributeName] = true;
            return true;
          }
          illegalAttributeNameCache[attributeName] = true;
          {
            error("Invalid attribute name: `%s`", attributeName);
          }
          return false;
        }
        function shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag) {
          if (propertyInfo !== null && propertyInfo.type === RESERVED) {
            return false;
          }
          switch (typeof value) {
            case "function":
            // $FlowIssue symbol is perfectly valid here
            case "symbol":
              return true;
            case "boolean": {
              if (isCustomComponentTag) {
                return false;
              }
              if (propertyInfo !== null) {
                return !propertyInfo.acceptsBooleans;
              } else {
                var prefix2 = name.toLowerCase().slice(0, 5);
                return prefix2 !== "data-" && prefix2 !== "aria-";
              }
            }
            default:
              return false;
          }
        }
        function getPropertyInfo(name) {
          return properties.hasOwnProperty(name) ? properties[name] : null;
        }
        function PropertyInfoRecord(name, type, mustUseProperty, attributeName, attributeNamespace, sanitizeURL2, removeEmptyString) {
          this.acceptsBooleans = type === BOOLEANISH_STRING || type === BOOLEAN || type === OVERLOADED_BOOLEAN;
          this.attributeName = attributeName;
          this.attributeNamespace = attributeNamespace;
          this.mustUseProperty = mustUseProperty;
          this.propertyName = name;
          this.type = type;
          this.sanitizeURL = sanitizeURL2;
          this.removeEmptyString = removeEmptyString;
        }
        var properties = {};
        var reservedProps = [
          "children",
          "dangerouslySetInnerHTML",
          // TODO: This prevents the assignment of defaultValue to regular
          // elements (not just inputs). Now that ReactDOMInput assigns to the
          // defaultValue property -- do we need this?
          "defaultValue",
          "defaultChecked",
          "innerHTML",
          "suppressContentEditableWarning",
          "suppressHydrationWarning",
          "style"
        ];
        reservedProps.forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            RESERVED,
            false,
            // mustUseProperty
            name,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(_ref) {
          var name = _ref[0], attributeName = _ref[1];
          properties[name] = new PropertyInfoRecord(
            name,
            STRING,
            false,
            // mustUseProperty
            attributeName,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            BOOLEANISH_STRING,
            false,
            // mustUseProperty
            name.toLowerCase(),
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            BOOLEANISH_STRING,
            false,
            // mustUseProperty
            name,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [
          "allowFullScreen",
          "async",
          // Note: there is a special case that prevents it from being written to the DOM
          // on the client side because the browsers are inconsistent. Instead we call focus().
          "autoFocus",
          "autoPlay",
          "controls",
          "default",
          "defer",
          "disabled",
          "disablePictureInPicture",
          "disableRemotePlayback",
          "formNoValidate",
          "hidden",
          "loop",
          "noModule",
          "noValidate",
          "open",
          "playsInline",
          "readOnly",
          "required",
          "reversed",
          "scoped",
          "seamless",
          // Microdata
          "itemScope"
        ].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            BOOLEAN,
            false,
            // mustUseProperty
            name.toLowerCase(),
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [
          "checked",
          // Note: `option.selected` is not updated if `select.multiple` is
          // disabled with `removeAttribute`. We have special logic for handling this.
          "multiple",
          "muted",
          "selected"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            BOOLEAN,
            true,
            // mustUseProperty
            name,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [
          "capture",
          "download"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            OVERLOADED_BOOLEAN,
            false,
            // mustUseProperty
            name,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [
          "cols",
          "rows",
          "size",
          "span"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            POSITIVE_NUMERIC,
            false,
            // mustUseProperty
            name,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        ["rowSpan", "start"].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            NUMERIC,
            false,
            // mustUseProperty
            name.toLowerCase(),
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        var CAMELIZE = /[\-\:]([a-z])/g;
        var capitalize = function(token) {
          return token[1].toUpperCase();
        };
        [
          "accent-height",
          "alignment-baseline",
          "arabic-form",
          "baseline-shift",
          "cap-height",
          "clip-path",
          "clip-rule",
          "color-interpolation",
          "color-interpolation-filters",
          "color-profile",
          "color-rendering",
          "dominant-baseline",
          "enable-background",
          "fill-opacity",
          "fill-rule",
          "flood-color",
          "flood-opacity",
          "font-family",
          "font-size",
          "font-size-adjust",
          "font-stretch",
          "font-style",
          "font-variant",
          "font-weight",
          "glyph-name",
          "glyph-orientation-horizontal",
          "glyph-orientation-vertical",
          "horiz-adv-x",
          "horiz-origin-x",
          "image-rendering",
          "letter-spacing",
          "lighting-color",
          "marker-end",
          "marker-mid",
          "marker-start",
          "overline-position",
          "overline-thickness",
          "paint-order",
          "panose-1",
          "pointer-events",
          "rendering-intent",
          "shape-rendering",
          "stop-color",
          "stop-opacity",
          "strikethrough-position",
          "strikethrough-thickness",
          "stroke-dasharray",
          "stroke-dashoffset",
          "stroke-linecap",
          "stroke-linejoin",
          "stroke-miterlimit",
          "stroke-opacity",
          "stroke-width",
          "text-anchor",
          "text-decoration",
          "text-rendering",
          "underline-position",
          "underline-thickness",
          "unicode-bidi",
          "unicode-range",
          "units-per-em",
          "v-alphabetic",
          "v-hanging",
          "v-ideographic",
          "v-mathematical",
          "vector-effect",
          "vert-adv-y",
          "vert-origin-x",
          "vert-origin-y",
          "word-spacing",
          "writing-mode",
          "xmlns:xlink",
          "x-height"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(attributeName) {
          var name = attributeName.replace(CAMELIZE, capitalize);
          properties[name] = new PropertyInfoRecord(
            name,
            STRING,
            false,
            // mustUseProperty
            attributeName,
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [
          "xlink:actuate",
          "xlink:arcrole",
          "xlink:role",
          "xlink:show",
          "xlink:title",
          "xlink:type"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(attributeName) {
          var name = attributeName.replace(CAMELIZE, capitalize);
          properties[name] = new PropertyInfoRecord(
            name,
            STRING,
            false,
            // mustUseProperty
            attributeName,
            "http://www.w3.org/1999/xlink",
            false,
            // sanitizeURL
            false
          );
        });
        [
          "xml:base",
          "xml:lang",
          "xml:space"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(attributeName) {
          var name = attributeName.replace(CAMELIZE, capitalize);
          properties[name] = new PropertyInfoRecord(
            name,
            STRING,
            false,
            // mustUseProperty
            attributeName,
            "http://www.w3.org/XML/1998/namespace",
            false,
            // sanitizeURL
            false
          );
        });
        ["tabIndex", "crossOrigin"].forEach(function(attributeName) {
          properties[attributeName] = new PropertyInfoRecord(
            attributeName,
            STRING,
            false,
            // mustUseProperty
            attributeName.toLowerCase(),
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        var xlinkHref = "xlinkHref";
        properties[xlinkHref] = new PropertyInfoRecord(
          "xlinkHref",
          STRING,
          false,
          // mustUseProperty
          "xlink:href",
          "http://www.w3.org/1999/xlink",
          true,
          // sanitizeURL
          false
        );
        ["src", "href", "action", "formAction"].forEach(function(attributeName) {
          properties[attributeName] = new PropertyInfoRecord(
            attributeName,
            STRING,
            false,
            // mustUseProperty
            attributeName.toLowerCase(),
            // attributeName
            null,
            // attributeNamespace
            true,
            // sanitizeURL
            true
          );
        });
        var isUnitlessNumber = {
          animationIterationCount: true,
          aspectRatio: true,
          borderImageOutset: true,
          borderImageSlice: true,
          borderImageWidth: true,
          boxFlex: true,
          boxFlexGroup: true,
          boxOrdinalGroup: true,
          columnCount: true,
          columns: true,
          flex: true,
          flexGrow: true,
          flexPositive: true,
          flexShrink: true,
          flexNegative: true,
          flexOrder: true,
          gridArea: true,
          gridRow: true,
          gridRowEnd: true,
          gridRowSpan: true,
          gridRowStart: true,
          gridColumn: true,
          gridColumnEnd: true,
          gridColumnSpan: true,
          gridColumnStart: true,
          fontWeight: true,
          lineClamp: true,
          lineHeight: true,
          opacity: true,
          order: true,
          orphans: true,
          tabSize: true,
          widows: true,
          zIndex: true,
          zoom: true,
          // SVG-related properties
          fillOpacity: true,
          floodOpacity: true,
          stopOpacity: true,
          strokeDasharray: true,
          strokeDashoffset: true,
          strokeMiterlimit: true,
          strokeOpacity: true,
          strokeWidth: true
        };
        function prefixKey(prefix2, key) {
          return prefix2 + key.charAt(0).toUpperCase() + key.substring(1);
        }
        var prefixes = ["Webkit", "ms", "Moz", "O"];
        Object.keys(isUnitlessNumber).forEach(function(prop) {
          prefixes.forEach(function(prefix2) {
            isUnitlessNumber[prefixKey(prefix2, prop)] = isUnitlessNumber[prop];
          });
        });
        var hasReadOnlyValue = {
          button: true,
          checkbox: true,
          image: true,
          hidden: true,
          radio: true,
          reset: true,
          submit: true
        };
        function checkControlledValueProps(tagName, props) {
          {
            if (!(hasReadOnlyValue[props.type] || props.onChange || props.onInput || props.readOnly || props.disabled || props.value == null)) {
              error("You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.");
            }
            if (!(props.onChange || props.readOnly || props.disabled || props.checked == null)) {
              error("You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.");
            }
          }
        }
        function isCustomComponent(tagName, props) {
          if (tagName.indexOf("-") === -1) {
            return typeof props.is === "string";
          }
          switch (tagName) {
            // These are reserved SVG and MathML elements.
            // We don't mind this list too much because we expect it to never grow.
            // The alternative is to track the namespace in a few places which is convoluted.
            // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
            case "annotation-xml":
            case "color-profile":
            case "font-face":
            case "font-face-src":
            case "font-face-uri":
            case "font-face-format":
            case "font-face-name":
            case "missing-glyph":
              return false;
            default:
              return true;
          }
        }
        var ariaProperties = {
          "aria-current": 0,
          // state
          "aria-description": 0,
          "aria-details": 0,
          "aria-disabled": 0,
          // state
          "aria-hidden": 0,
          // state
          "aria-invalid": 0,
          // state
          "aria-keyshortcuts": 0,
          "aria-label": 0,
          "aria-roledescription": 0,
          // Widget Attributes
          "aria-autocomplete": 0,
          "aria-checked": 0,
          "aria-expanded": 0,
          "aria-haspopup": 0,
          "aria-level": 0,
          "aria-modal": 0,
          "aria-multiline": 0,
          "aria-multiselectable": 0,
          "aria-orientation": 0,
          "aria-placeholder": 0,
          "aria-pressed": 0,
          "aria-readonly": 0,
          "aria-required": 0,
          "aria-selected": 0,
          "aria-sort": 0,
          "aria-valuemax": 0,
          "aria-valuemin": 0,
          "aria-valuenow": 0,
          "aria-valuetext": 0,
          // Live Region Attributes
          "aria-atomic": 0,
          "aria-busy": 0,
          "aria-live": 0,
          "aria-relevant": 0,
          // Drag-and-Drop Attributes
          "aria-dropeffect": 0,
          "aria-grabbed": 0,
          // Relationship Attributes
          "aria-activedescendant": 0,
          "aria-colcount": 0,
          "aria-colindex": 0,
          "aria-colspan": 0,
          "aria-controls": 0,
          "aria-describedby": 0,
          "aria-errormessage": 0,
          "aria-flowto": 0,
          "aria-labelledby": 0,
          "aria-owns": 0,
          "aria-posinset": 0,
          "aria-rowcount": 0,
          "aria-rowindex": 0,
          "aria-rowspan": 0,
          "aria-setsize": 0
        };
        var warnedProperties = {};
        var rARIA = new RegExp("^(aria)-[" + ATTRIBUTE_NAME_CHAR + "]*$");
        var rARIACamel = new RegExp("^(aria)[A-Z][" + ATTRIBUTE_NAME_CHAR + "]*$");
        function validateProperty(tagName, name) {
          {
            if (hasOwnProperty.call(warnedProperties, name) && warnedProperties[name]) {
              return true;
            }
            if (rARIACamel.test(name)) {
              var ariaName = "aria-" + name.slice(4).toLowerCase();
              var correctName = ariaProperties.hasOwnProperty(ariaName) ? ariaName : null;
              if (correctName == null) {
                error("Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.", name);
                warnedProperties[name] = true;
                return true;
              }
              if (name !== correctName) {
                error("Invalid ARIA attribute `%s`. Did you mean `%s`?", name, correctName);
                warnedProperties[name] = true;
                return true;
              }
            }
            if (rARIA.test(name)) {
              var lowerCasedName = name.toLowerCase();
              var standardName = ariaProperties.hasOwnProperty(lowerCasedName) ? lowerCasedName : null;
              if (standardName == null) {
                warnedProperties[name] = true;
                return false;
              }
              if (name !== standardName) {
                error("Unknown ARIA attribute `%s`. Did you mean `%s`?", name, standardName);
                warnedProperties[name] = true;
                return true;
              }
            }
          }
          return true;
        }
        function warnInvalidARIAProps(type, props) {
          {
            var invalidProps = [];
            for (var key in props) {
              var isValid = validateProperty(type, key);
              if (!isValid) {
                invalidProps.push(key);
              }
            }
            var unknownPropString = invalidProps.map(function(prop) {
              return "`" + prop + "`";
            }).join(", ");
            if (invalidProps.length === 1) {
              error("Invalid aria prop %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", unknownPropString, type);
            } else if (invalidProps.length > 1) {
              error("Invalid aria props %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", unknownPropString, type);
            }
          }
        }
        function validateProperties(type, props) {
          if (isCustomComponent(type, props)) {
            return;
          }
          warnInvalidARIAProps(type, props);
        }
        var didWarnValueNull = false;
        function validateProperties$1(type, props) {
          {
            if (type !== "input" && type !== "textarea" && type !== "select") {
              return;
            }
            if (props != null && props.value === null && !didWarnValueNull) {
              didWarnValueNull = true;
              if (type === "select" && props.multiple) {
                error("`value` prop on `%s` should not be null. Consider using an empty array when `multiple` is set to `true` to clear the component or `undefined` for uncontrolled components.", type);
              } else {
                error("`value` prop on `%s` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.", type);
              }
            }
          }
        }
        var possibleStandardNames = {
          // HTML
          accept: "accept",
          acceptcharset: "acceptCharset",
          "accept-charset": "acceptCharset",
          accesskey: "accessKey",
          action: "action",
          allowfullscreen: "allowFullScreen",
          alt: "alt",
          as: "as",
          async: "async",
          autocapitalize: "autoCapitalize",
          autocomplete: "autoComplete",
          autocorrect: "autoCorrect",
          autofocus: "autoFocus",
          autoplay: "autoPlay",
          autosave: "autoSave",
          capture: "capture",
          cellpadding: "cellPadding",
          cellspacing: "cellSpacing",
          challenge: "challenge",
          charset: "charSet",
          checked: "checked",
          children: "children",
          cite: "cite",
          class: "className",
          classid: "classID",
          classname: "className",
          cols: "cols",
          colspan: "colSpan",
          content: "content",
          contenteditable: "contentEditable",
          contextmenu: "contextMenu",
          controls: "controls",
          controlslist: "controlsList",
          coords: "coords",
          crossorigin: "crossOrigin",
          dangerouslysetinnerhtml: "dangerouslySetInnerHTML",
          data: "data",
          datetime: "dateTime",
          default: "default",
          defaultchecked: "defaultChecked",
          defaultvalue: "defaultValue",
          defer: "defer",
          dir: "dir",
          disabled: "disabled",
          disablepictureinpicture: "disablePictureInPicture",
          disableremoteplayback: "disableRemotePlayback",
          download: "download",
          draggable: "draggable",
          enctype: "encType",
          enterkeyhint: "enterKeyHint",
          for: "htmlFor",
          form: "form",
          formmethod: "formMethod",
          formaction: "formAction",
          formenctype: "formEncType",
          formnovalidate: "formNoValidate",
          formtarget: "formTarget",
          frameborder: "frameBorder",
          headers: "headers",
          height: "height",
          hidden: "hidden",
          high: "high",
          href: "href",
          hreflang: "hrefLang",
          htmlfor: "htmlFor",
          httpequiv: "httpEquiv",
          "http-equiv": "httpEquiv",
          icon: "icon",
          id: "id",
          imagesizes: "imageSizes",
          imagesrcset: "imageSrcSet",
          innerhtml: "innerHTML",
          inputmode: "inputMode",
          integrity: "integrity",
          is: "is",
          itemid: "itemID",
          itemprop: "itemProp",
          itemref: "itemRef",
          itemscope: "itemScope",
          itemtype: "itemType",
          keyparams: "keyParams",
          keytype: "keyType",
          kind: "kind",
          label: "label",
          lang: "lang",
          list: "list",
          loop: "loop",
          low: "low",
          manifest: "manifest",
          marginwidth: "marginWidth",
          marginheight: "marginHeight",
          max: "max",
          maxlength: "maxLength",
          media: "media",
          mediagroup: "mediaGroup",
          method: "method",
          min: "min",
          minlength: "minLength",
          multiple: "multiple",
          muted: "muted",
          name: "name",
          nomodule: "noModule",
          nonce: "nonce",
          novalidate: "noValidate",
          open: "open",
          optimum: "optimum",
          pattern: "pattern",
          placeholder: "placeholder",
          playsinline: "playsInline",
          poster: "poster",
          preload: "preload",
          profile: "profile",
          radiogroup: "radioGroup",
          readonly: "readOnly",
          referrerpolicy: "referrerPolicy",
          rel: "rel",
          required: "required",
          reversed: "reversed",
          role: "role",
          rows: "rows",
          rowspan: "rowSpan",
          sandbox: "sandbox",
          scope: "scope",
          scoped: "scoped",
          scrolling: "scrolling",
          seamless: "seamless",
          selected: "selected",
          shape: "shape",
          size: "size",
          sizes: "sizes",
          span: "span",
          spellcheck: "spellCheck",
          src: "src",
          srcdoc: "srcDoc",
          srclang: "srcLang",
          srcset: "srcSet",
          start: "start",
          step: "step",
          style: "style",
          summary: "summary",
          tabindex: "tabIndex",
          target: "target",
          title: "title",
          type: "type",
          usemap: "useMap",
          value: "value",
          width: "width",
          wmode: "wmode",
          wrap: "wrap",
          // SVG
          about: "about",
          accentheight: "accentHeight",
          "accent-height": "accentHeight",
          accumulate: "accumulate",
          additive: "additive",
          alignmentbaseline: "alignmentBaseline",
          "alignment-baseline": "alignmentBaseline",
          allowreorder: "allowReorder",
          alphabetic: "alphabetic",
          amplitude: "amplitude",
          arabicform: "arabicForm",
          "arabic-form": "arabicForm",
          ascent: "ascent",
          attributename: "attributeName",
          attributetype: "attributeType",
          autoreverse: "autoReverse",
          azimuth: "azimuth",
          basefrequency: "baseFrequency",
          baselineshift: "baselineShift",
          "baseline-shift": "baselineShift",
          baseprofile: "baseProfile",
          bbox: "bbox",
          begin: "begin",
          bias: "bias",
          by: "by",
          calcmode: "calcMode",
          capheight: "capHeight",
          "cap-height": "capHeight",
          clip: "clip",
          clippath: "clipPath",
          "clip-path": "clipPath",
          clippathunits: "clipPathUnits",
          cliprule: "clipRule",
          "clip-rule": "clipRule",
          color: "color",
          colorinterpolation: "colorInterpolation",
          "color-interpolation": "colorInterpolation",
          colorinterpolationfilters: "colorInterpolationFilters",
          "color-interpolation-filters": "colorInterpolationFilters",
          colorprofile: "colorProfile",
          "color-profile": "colorProfile",
          colorrendering: "colorRendering",
          "color-rendering": "colorRendering",
          contentscripttype: "contentScriptType",
          contentstyletype: "contentStyleType",
          cursor: "cursor",
          cx: "cx",
          cy: "cy",
          d: "d",
          datatype: "datatype",
          decelerate: "decelerate",
          descent: "descent",
          diffuseconstant: "diffuseConstant",
          direction: "direction",
          display: "display",
          divisor: "divisor",
          dominantbaseline: "dominantBaseline",
          "dominant-baseline": "dominantBaseline",
          dur: "dur",
          dx: "dx",
          dy: "dy",
          edgemode: "edgeMode",
          elevation: "elevation",
          enablebackground: "enableBackground",
          "enable-background": "enableBackground",
          end: "end",
          exponent: "exponent",
          externalresourcesrequired: "externalResourcesRequired",
          fill: "fill",
          fillopacity: "fillOpacity",
          "fill-opacity": "fillOpacity",
          fillrule: "fillRule",
          "fill-rule": "fillRule",
          filter: "filter",
          filterres: "filterRes",
          filterunits: "filterUnits",
          floodopacity: "floodOpacity",
          "flood-opacity": "floodOpacity",
          floodcolor: "floodColor",
          "flood-color": "floodColor",
          focusable: "focusable",
          fontfamily: "fontFamily",
          "font-family": "fontFamily",
          fontsize: "fontSize",
          "font-size": "fontSize",
          fontsizeadjust: "fontSizeAdjust",
          "font-size-adjust": "fontSizeAdjust",
          fontstretch: "fontStretch",
          "font-stretch": "fontStretch",
          fontstyle: "fontStyle",
          "font-style": "fontStyle",
          fontvariant: "fontVariant",
          "font-variant": "fontVariant",
          fontweight: "fontWeight",
          "font-weight": "fontWeight",
          format: "format",
          from: "from",
          fx: "fx",
          fy: "fy",
          g1: "g1",
          g2: "g2",
          glyphname: "glyphName",
          "glyph-name": "glyphName",
          glyphorientationhorizontal: "glyphOrientationHorizontal",
          "glyph-orientation-horizontal": "glyphOrientationHorizontal",
          glyphorientationvertical: "glyphOrientationVertical",
          "glyph-orientation-vertical": "glyphOrientationVertical",
          glyphref: "glyphRef",
          gradienttransform: "gradientTransform",
          gradientunits: "gradientUnits",
          hanging: "hanging",
          horizadvx: "horizAdvX",
          "horiz-adv-x": "horizAdvX",
          horizoriginx: "horizOriginX",
          "horiz-origin-x": "horizOriginX",
          ideographic: "ideographic",
          imagerendering: "imageRendering",
          "image-rendering": "imageRendering",
          in2: "in2",
          in: "in",
          inlist: "inlist",
          intercept: "intercept",
          k1: "k1",
          k2: "k2",
          k3: "k3",
          k4: "k4",
          k: "k",
          kernelmatrix: "kernelMatrix",
          kernelunitlength: "kernelUnitLength",
          kerning: "kerning",
          keypoints: "keyPoints",
          keysplines: "keySplines",
          keytimes: "keyTimes",
          lengthadjust: "lengthAdjust",
          letterspacing: "letterSpacing",
          "letter-spacing": "letterSpacing",
          lightingcolor: "lightingColor",
          "lighting-color": "lightingColor",
          limitingconeangle: "limitingConeAngle",
          local: "local",
          markerend: "markerEnd",
          "marker-end": "markerEnd",
          markerheight: "markerHeight",
          markermid: "markerMid",
          "marker-mid": "markerMid",
          markerstart: "markerStart",
          "marker-start": "markerStart",
          markerunits: "markerUnits",
          markerwidth: "markerWidth",
          mask: "mask",
          maskcontentunits: "maskContentUnits",
          maskunits: "maskUnits",
          mathematical: "mathematical",
          mode: "mode",
          numoctaves: "numOctaves",
          offset: "offset",
          opacity: "opacity",
          operator: "operator",
          order: "order",
          orient: "orient",
          orientation: "orientation",
          origin: "origin",
          overflow: "overflow",
          overlineposition: "overlinePosition",
          "overline-position": "overlinePosition",
          overlinethickness: "overlineThickness",
          "overline-thickness": "overlineThickness",
          paintorder: "paintOrder",
          "paint-order": "paintOrder",
          panose1: "panose1",
          "panose-1": "panose1",
          pathlength: "pathLength",
          patterncontentunits: "patternContentUnits",
          patterntransform: "patternTransform",
          patternunits: "patternUnits",
          pointerevents: "pointerEvents",
          "pointer-events": "pointerEvents",
          points: "points",
          pointsatx: "pointsAtX",
          pointsaty: "pointsAtY",
          pointsatz: "pointsAtZ",
          prefix: "prefix",
          preservealpha: "preserveAlpha",
          preserveaspectratio: "preserveAspectRatio",
          primitiveunits: "primitiveUnits",
          property: "property",
          r: "r",
          radius: "radius",
          refx: "refX",
          refy: "refY",
          renderingintent: "renderingIntent",
          "rendering-intent": "renderingIntent",
          repeatcount: "repeatCount",
          repeatdur: "repeatDur",
          requiredextensions: "requiredExtensions",
          requiredfeatures: "requiredFeatures",
          resource: "resource",
          restart: "restart",
          result: "result",
          results: "results",
          rotate: "rotate",
          rx: "rx",
          ry: "ry",
          scale: "scale",
          security: "security",
          seed: "seed",
          shaperendering: "shapeRendering",
          "shape-rendering": "shapeRendering",
          slope: "slope",
          spacing: "spacing",
          specularconstant: "specularConstant",
          specularexponent: "specularExponent",
          speed: "speed",
          spreadmethod: "spreadMethod",
          startoffset: "startOffset",
          stddeviation: "stdDeviation",
          stemh: "stemh",
          stemv: "stemv",
          stitchtiles: "stitchTiles",
          stopcolor: "stopColor",
          "stop-color": "stopColor",
          stopopacity: "stopOpacity",
          "stop-opacity": "stopOpacity",
          strikethroughposition: "strikethroughPosition",
          "strikethrough-position": "strikethroughPosition",
          strikethroughthickness: "strikethroughThickness",
          "strikethrough-thickness": "strikethroughThickness",
          string: "string",
          stroke: "stroke",
          strokedasharray: "strokeDasharray",
          "stroke-dasharray": "strokeDasharray",
          strokedashoffset: "strokeDashoffset",
          "stroke-dashoffset": "strokeDashoffset",
          strokelinecap: "strokeLinecap",
          "stroke-linecap": "strokeLinecap",
          strokelinejoin: "strokeLinejoin",
          "stroke-linejoin": "strokeLinejoin",
          strokemiterlimit: "strokeMiterlimit",
          "stroke-miterlimit": "strokeMiterlimit",
          strokewidth: "strokeWidth",
          "stroke-width": "strokeWidth",
          strokeopacity: "strokeOpacity",
          "stroke-opacity": "strokeOpacity",
          suppresscontenteditablewarning: "suppressContentEditableWarning",
          suppresshydrationwarning: "suppressHydrationWarning",
          surfacescale: "surfaceScale",
          systemlanguage: "systemLanguage",
          tablevalues: "tableValues",
          targetx: "targetX",
          targety: "targetY",
          textanchor: "textAnchor",
          "text-anchor": "textAnchor",
          textdecoration: "textDecoration",
          "text-decoration": "textDecoration",
          textlength: "textLength",
          textrendering: "textRendering",
          "text-rendering": "textRendering",
          to: "to",
          transform: "transform",
          typeof: "typeof",
          u1: "u1",
          u2: "u2",
          underlineposition: "underlinePosition",
          "underline-position": "underlinePosition",
          underlinethickness: "underlineThickness",
          "underline-thickness": "underlineThickness",
          unicode: "unicode",
          unicodebidi: "unicodeBidi",
          "unicode-bidi": "unicodeBidi",
          unicoderange: "unicodeRange",
          "unicode-range": "unicodeRange",
          unitsperem: "unitsPerEm",
          "units-per-em": "unitsPerEm",
          unselectable: "unselectable",
          valphabetic: "vAlphabetic",
          "v-alphabetic": "vAlphabetic",
          values: "values",
          vectoreffect: "vectorEffect",
          "vector-effect": "vectorEffect",
          version: "version",
          vertadvy: "vertAdvY",
          "vert-adv-y": "vertAdvY",
          vertoriginx: "vertOriginX",
          "vert-origin-x": "vertOriginX",
          vertoriginy: "vertOriginY",
          "vert-origin-y": "vertOriginY",
          vhanging: "vHanging",
          "v-hanging": "vHanging",
          videographic: "vIdeographic",
          "v-ideographic": "vIdeographic",
          viewbox: "viewBox",
          viewtarget: "viewTarget",
          visibility: "visibility",
          vmathematical: "vMathematical",
          "v-mathematical": "vMathematical",
          vocab: "vocab",
          widths: "widths",
          wordspacing: "wordSpacing",
          "word-spacing": "wordSpacing",
          writingmode: "writingMode",
          "writing-mode": "writingMode",
          x1: "x1",
          x2: "x2",
          x: "x",
          xchannelselector: "xChannelSelector",
          xheight: "xHeight",
          "x-height": "xHeight",
          xlinkactuate: "xlinkActuate",
          "xlink:actuate": "xlinkActuate",
          xlinkarcrole: "xlinkArcrole",
          "xlink:arcrole": "xlinkArcrole",
          xlinkhref: "xlinkHref",
          "xlink:href": "xlinkHref",
          xlinkrole: "xlinkRole",
          "xlink:role": "xlinkRole",
          xlinkshow: "xlinkShow",
          "xlink:show": "xlinkShow",
          xlinktitle: "xlinkTitle",
          "xlink:title": "xlinkTitle",
          xlinktype: "xlinkType",
          "xlink:type": "xlinkType",
          xmlbase: "xmlBase",
          "xml:base": "xmlBase",
          xmllang: "xmlLang",
          "xml:lang": "xmlLang",
          xmlns: "xmlns",
          "xml:space": "xmlSpace",
          xmlnsxlink: "xmlnsXlink",
          "xmlns:xlink": "xmlnsXlink",
          xmlspace: "xmlSpace",
          y1: "y1",
          y2: "y2",
          y: "y",
          ychannelselector: "yChannelSelector",
          z: "z",
          zoomandpan: "zoomAndPan"
        };
        var validateProperty$1 = function() {
        };
        {
          var warnedProperties$1 = {};
          var EVENT_NAME_REGEX = /^on./;
          var INVALID_EVENT_NAME_REGEX = /^on[^A-Z]/;
          var rARIA$1 = new RegExp("^(aria)-[" + ATTRIBUTE_NAME_CHAR + "]*$");
          var rARIACamel$1 = new RegExp("^(aria)[A-Z][" + ATTRIBUTE_NAME_CHAR + "]*$");
          validateProperty$1 = function(tagName, name, value, eventRegistry) {
            if (hasOwnProperty.call(warnedProperties$1, name) && warnedProperties$1[name]) {
              return true;
            }
            var lowerCasedName = name.toLowerCase();
            if (lowerCasedName === "onfocusin" || lowerCasedName === "onfocusout") {
              error("React uses onFocus and onBlur instead of onFocusIn and onFocusOut. All React events are normalized to bubble, so onFocusIn and onFocusOut are not needed/supported by React.");
              warnedProperties$1[name] = true;
              return true;
            }
            if (eventRegistry != null) {
              var registrationNameDependencies = eventRegistry.registrationNameDependencies, possibleRegistrationNames = eventRegistry.possibleRegistrationNames;
              if (registrationNameDependencies.hasOwnProperty(name)) {
                return true;
              }
              var registrationName = possibleRegistrationNames.hasOwnProperty(lowerCasedName) ? possibleRegistrationNames[lowerCasedName] : null;
              if (registrationName != null) {
                error("Invalid event handler property `%s`. Did you mean `%s`?", name, registrationName);
                warnedProperties$1[name] = true;
                return true;
              }
              if (EVENT_NAME_REGEX.test(name)) {
                error("Unknown event handler property `%s`. It will be ignored.", name);
                warnedProperties$1[name] = true;
                return true;
              }
            } else if (EVENT_NAME_REGEX.test(name)) {
              if (INVALID_EVENT_NAME_REGEX.test(name)) {
                error("Invalid event handler property `%s`. React events use the camelCase naming convention, for example `onClick`.", name);
              }
              warnedProperties$1[name] = true;
              return true;
            }
            if (rARIA$1.test(name) || rARIACamel$1.test(name)) {
              return true;
            }
            if (lowerCasedName === "innerhtml") {
              error("Directly setting property `innerHTML` is not permitted. For more information, lookup documentation on `dangerouslySetInnerHTML`.");
              warnedProperties$1[name] = true;
              return true;
            }
            if (lowerCasedName === "aria") {
              error("The `aria` attribute is reserved for future use in React. Pass individual `aria-` attributes instead.");
              warnedProperties$1[name] = true;
              return true;
            }
            if (lowerCasedName === "is" && value !== null && value !== void 0 && typeof value !== "string") {
              error("Received a `%s` for a string attribute `is`. If this is expected, cast the value to a string.", typeof value);
              warnedProperties$1[name] = true;
              return true;
            }
            if (typeof value === "number" && isNaN(value)) {
              error("Received NaN for the `%s` attribute. If this is expected, cast the value to a string.", name);
              warnedProperties$1[name] = true;
              return true;
            }
            var propertyInfo = getPropertyInfo(name);
            var isReserved = propertyInfo !== null && propertyInfo.type === RESERVED;
            if (possibleStandardNames.hasOwnProperty(lowerCasedName)) {
              var standardName = possibleStandardNames[lowerCasedName];
              if (standardName !== name) {
                error("Invalid DOM property `%s`. Did you mean `%s`?", name, standardName);
                warnedProperties$1[name] = true;
                return true;
              }
            } else if (!isReserved && name !== lowerCasedName) {
              error("React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element.", name, lowerCasedName);
              warnedProperties$1[name] = true;
              return true;
            }
            if (typeof value === "boolean" && shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
              if (value) {
                error('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.', value, name, name, value, name);
              } else {
                error('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.\n\nIf you used to conditionally omit it with %s={condition && value}, pass %s={condition ? value : undefined} instead.', value, name, name, value, name, name, name);
              }
              warnedProperties$1[name] = true;
              return true;
            }
            if (isReserved) {
              return true;
            }
            if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
              warnedProperties$1[name] = true;
              return false;
            }
            if ((value === "false" || value === "true") && propertyInfo !== null && propertyInfo.type === BOOLEAN) {
              error("Received the string `%s` for the boolean attribute `%s`. %s Did you mean %s={%s}?", value, name, value === "false" ? "The browser will interpret it as a truthy value." : 'Although this works, it will not work as expected if you pass the string "false".', name, value);
              warnedProperties$1[name] = true;
              return true;
            }
            return true;
          };
        }
        var warnUnknownProperties = function(type, props, eventRegistry) {
          {
            var unknownProps = [];
            for (var key in props) {
              var isValid = validateProperty$1(type, key, props[key], eventRegistry);
              if (!isValid) {
                unknownProps.push(key);
              }
            }
            var unknownPropString = unknownProps.map(function(prop) {
              return "`" + prop + "`";
            }).join(", ");
            if (unknownProps.length === 1) {
              error("Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", unknownPropString, type);
            } else if (unknownProps.length > 1) {
              error("Invalid values for props %s on <%s> tag. Either remove them from the element, or pass a string or number value to keep them in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", unknownPropString, type);
            }
          }
        };
        function validateProperties$2(type, props, eventRegistry) {
          if (isCustomComponent(type, props)) {
            return;
          }
          warnUnknownProperties(type, props, eventRegistry);
        }
        var warnValidStyle = function() {
        };
        {
          var badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;
          var msPattern = /^-ms-/;
          var hyphenPattern = /-(.)/g;
          var badStyleValueWithSemicolonPattern = /;\s*$/;
          var warnedStyleNames = {};
          var warnedStyleValues = {};
          var warnedForNaNValue = false;
          var warnedForInfinityValue = false;
          var camelize = function(string) {
            return string.replace(hyphenPattern, function(_, character) {
              return character.toUpperCase();
            });
          };
          var warnHyphenatedStyleName = function(name) {
            if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
              return;
            }
            warnedStyleNames[name] = true;
            error(
              "Unsupported style property %s. Did you mean %s?",
              name,
              // As Andi Smith suggests
              // (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
              // is converted to lowercase `ms`.
              camelize(name.replace(msPattern, "ms-"))
            );
          };
          var warnBadVendoredStyleName = function(name) {
            if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
              return;
            }
            warnedStyleNames[name] = true;
            error("Unsupported vendor-prefixed style property %s. Did you mean %s?", name, name.charAt(0).toUpperCase() + name.slice(1));
          };
          var warnStyleValueWithSemicolon = function(name, value) {
            if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
              return;
            }
            warnedStyleValues[value] = true;
            error(`Style property values shouldn't contain a semicolon. Try "%s: %s" instead.`, name, value.replace(badStyleValueWithSemicolonPattern, ""));
          };
          var warnStyleValueIsNaN = function(name, value) {
            if (warnedForNaNValue) {
              return;
            }
            warnedForNaNValue = true;
            error("`NaN` is an invalid value for the `%s` css style property.", name);
          };
          var warnStyleValueIsInfinity = function(name, value) {
            if (warnedForInfinityValue) {
              return;
            }
            warnedForInfinityValue = true;
            error("`Infinity` is an invalid value for the `%s` css style property.", name);
          };
          warnValidStyle = function(name, value) {
            if (name.indexOf("-") > -1) {
              warnHyphenatedStyleName(name);
            } else if (badVendoredStyleNamePattern.test(name)) {
              warnBadVendoredStyleName(name);
            } else if (badStyleValueWithSemicolonPattern.test(value)) {
              warnStyleValueWithSemicolon(name, value);
            }
            if (typeof value === "number") {
              if (isNaN(value)) {
                warnStyleValueIsNaN(name, value);
              } else if (!isFinite(value)) {
                warnStyleValueIsInfinity(name, value);
              }
            }
          };
        }
        var warnValidStyle$1 = warnValidStyle;
        var matchHtmlRegExp = /["'&<>]/;
        function escapeHtml(string) {
          {
            checkHtmlStringCoercion(string);
          }
          var str = "" + string;
          var match = matchHtmlRegExp.exec(str);
          if (!match) {
            return str;
          }
          var escape;
          var html = "";
          var index;
          var lastIndex = 0;
          for (index = match.index; index < str.length; index++) {
            switch (str.charCodeAt(index)) {
              case 34:
                escape = "&quot;";
                break;
              case 38:
                escape = "&amp;";
                break;
              case 39:
                escape = "&#x27;";
                break;
              case 60:
                escape = "&lt;";
                break;
              case 62:
                escape = "&gt;";
                break;
              default:
                continue;
            }
            if (lastIndex !== index) {
              html += str.substring(lastIndex, index);
            }
            lastIndex = index + 1;
            html += escape;
          }
          return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
        }
        function escapeTextForBrowser(text) {
          if (typeof text === "boolean" || typeof text === "number") {
            return "" + text;
          }
          return escapeHtml(text);
        }
        var uppercasePattern = /([A-Z])/g;
        var msPattern$1 = /^ms-/;
        function hyphenateStyleName(name) {
          return name.replace(uppercasePattern, "-$1").toLowerCase().replace(msPattern$1, "-ms-");
        }
        var isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;
        var didWarn = false;
        function sanitizeURL(url) {
          {
            if (!didWarn && isJavaScriptProtocol.test(url)) {
              didWarn = true;
              error("A future version of React will block javascript: URLs as a security precaution. Use event handlers instead if you can. If you need to generate unsafe HTML try using dangerouslySetInnerHTML instead. React was passed %s.", JSON.stringify(url));
            }
          }
        }
        var isArrayImpl = Array.isArray;
        function isArray(a) {
          return isArrayImpl(a);
        }
        var startInlineScript = stringToPrecomputedChunk("<script>");
        var endInlineScript = stringToPrecomputedChunk("</script>");
        var startScriptSrc = stringToPrecomputedChunk('<script src="');
        var startModuleSrc = stringToPrecomputedChunk('<script type="module" src="');
        var endAsyncScript = stringToPrecomputedChunk('" async=""></script>');
        function escapeBootstrapScriptContent(scriptText) {
          {
            checkHtmlStringCoercion(scriptText);
          }
          return ("" + scriptText).replace(scriptRegex, scriptReplacer);
        }
        var scriptRegex = /(<\/|<)(s)(cript)/gi;
        var scriptReplacer = function(match, prefix2, s, suffix) {
          return "" + prefix2 + (s === "s" ? "\\u0073" : "\\u0053") + suffix;
        };
        function createResponseState(identifierPrefix, nonce, bootstrapScriptContent, bootstrapScripts, bootstrapModules) {
          var idPrefix = identifierPrefix === void 0 ? "" : identifierPrefix;
          var inlineScriptWithNonce = nonce === void 0 ? startInlineScript : stringToPrecomputedChunk('<script nonce="' + escapeTextForBrowser(nonce) + '">');
          var bootstrapChunks = [];
          if (bootstrapScriptContent !== void 0) {
            bootstrapChunks.push(inlineScriptWithNonce, stringToChunk(escapeBootstrapScriptContent(bootstrapScriptContent)), endInlineScript);
          }
          if (bootstrapScripts !== void 0) {
            for (var i = 0; i < bootstrapScripts.length; i++) {
              bootstrapChunks.push(startScriptSrc, stringToChunk(escapeTextForBrowser(bootstrapScripts[i])), endAsyncScript);
            }
          }
          if (bootstrapModules !== void 0) {
            for (var _i = 0; _i < bootstrapModules.length; _i++) {
              bootstrapChunks.push(startModuleSrc, stringToChunk(escapeTextForBrowser(bootstrapModules[_i])), endAsyncScript);
            }
          }
          return {
            bootstrapChunks,
            startInlineScript: inlineScriptWithNonce,
            placeholderPrefix: stringToPrecomputedChunk(idPrefix + "P:"),
            segmentPrefix: stringToPrecomputedChunk(idPrefix + "S:"),
            boundaryPrefix: idPrefix + "B:",
            idPrefix,
            nextSuspenseID: 0,
            sentCompleteSegmentFunction: false,
            sentCompleteBoundaryFunction: false,
            sentClientRenderFunction: false
          };
        }
        var ROOT_HTML_MODE = 0;
        var HTML_MODE = 1;
        var SVG_MODE = 2;
        var MATHML_MODE = 3;
        var HTML_TABLE_MODE = 4;
        var HTML_TABLE_BODY_MODE = 5;
        var HTML_TABLE_ROW_MODE = 6;
        var HTML_COLGROUP_MODE = 7;
        function createFormatContext(insertionMode, selectedValue) {
          return {
            insertionMode,
            selectedValue
          };
        }
        function getChildFormatContext(parentContext, type, props) {
          switch (type) {
            case "select":
              return createFormatContext(HTML_MODE, props.value != null ? props.value : props.defaultValue);
            case "svg":
              return createFormatContext(SVG_MODE, null);
            case "math":
              return createFormatContext(MATHML_MODE, null);
            case "foreignObject":
              return createFormatContext(HTML_MODE, null);
            // Table parents are special in that their children can only be created at all if they're
            // wrapped in a table parent. So we need to encode that we're entering this mode.
            case "table":
              return createFormatContext(HTML_TABLE_MODE, null);
            case "thead":
            case "tbody":
            case "tfoot":
              return createFormatContext(HTML_TABLE_BODY_MODE, null);
            case "colgroup":
              return createFormatContext(HTML_COLGROUP_MODE, null);
            case "tr":
              return createFormatContext(HTML_TABLE_ROW_MODE, null);
          }
          if (parentContext.insertionMode >= HTML_TABLE_MODE) {
            return createFormatContext(HTML_MODE, null);
          }
          if (parentContext.insertionMode === ROOT_HTML_MODE) {
            return createFormatContext(HTML_MODE, null);
          }
          return parentContext;
        }
        var UNINITIALIZED_SUSPENSE_BOUNDARY_ID = null;
        function assignSuspenseBoundaryID(responseState) {
          var generatedID = responseState.nextSuspenseID++;
          return stringToPrecomputedChunk(responseState.boundaryPrefix + generatedID.toString(16));
        }
        function makeId(responseState, treeId, localId) {
          var idPrefix = responseState.idPrefix;
          var id = ":" + idPrefix + "R" + treeId;
          if (localId > 0) {
            id += "H" + localId.toString(32);
          }
          return id + ":";
        }
        function encodeHTMLTextNode(text) {
          return escapeTextForBrowser(text);
        }
        var textSeparator = stringToPrecomputedChunk("<!-- -->");
        function pushTextInstance(target, text, responseState, textEmbedded) {
          if (text === "") {
            return textEmbedded;
          }
          if (textEmbedded) {
            target.push(textSeparator);
          }
          target.push(stringToChunk(encodeHTMLTextNode(text)));
          return true;
        }
        function pushSegmentFinale(target, responseState, lastPushedText, textEmbedded) {
          if (lastPushedText && textEmbedded) {
            target.push(textSeparator);
          }
        }
        var styleNameCache = /* @__PURE__ */ new Map();
        function processStyleName(styleName) {
          var chunk = styleNameCache.get(styleName);
          if (chunk !== void 0) {
            return chunk;
          }
          var result = stringToPrecomputedChunk(escapeTextForBrowser(hyphenateStyleName(styleName)));
          styleNameCache.set(styleName, result);
          return result;
        }
        var styleAttributeStart = stringToPrecomputedChunk(' style="');
        var styleAssign = stringToPrecomputedChunk(":");
        var styleSeparator = stringToPrecomputedChunk(";");
        function pushStyle(target, responseState, style) {
          if (typeof style !== "object") {
            throw new Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
          }
          var isFirst = true;
          for (var styleName in style) {
            if (!hasOwnProperty.call(style, styleName)) {
              continue;
            }
            var styleValue = style[styleName];
            if (styleValue == null || typeof styleValue === "boolean" || styleValue === "") {
              continue;
            }
            var nameChunk = void 0;
            var valueChunk = void 0;
            var isCustomProperty = styleName.indexOf("--") === 0;
            if (isCustomProperty) {
              nameChunk = stringToChunk(escapeTextForBrowser(styleName));
              {
                checkCSSPropertyStringCoercion(styleValue, styleName);
              }
              valueChunk = stringToChunk(escapeTextForBrowser(("" + styleValue).trim()));
            } else {
              {
                warnValidStyle$1(styleName, styleValue);
              }
              nameChunk = processStyleName(styleName);
              if (typeof styleValue === "number") {
                if (styleValue !== 0 && !hasOwnProperty.call(isUnitlessNumber, styleName)) {
                  valueChunk = stringToChunk(styleValue + "px");
                } else {
                  valueChunk = stringToChunk("" + styleValue);
                }
              } else {
                {
                  checkCSSPropertyStringCoercion(styleValue, styleName);
                }
                valueChunk = stringToChunk(escapeTextForBrowser(("" + styleValue).trim()));
              }
            }
            if (isFirst) {
              isFirst = false;
              target.push(styleAttributeStart, nameChunk, styleAssign, valueChunk);
            } else {
              target.push(styleSeparator, nameChunk, styleAssign, valueChunk);
            }
          }
          if (!isFirst) {
            target.push(attributeEnd);
          }
        }
        var attributeSeparator = stringToPrecomputedChunk(" ");
        var attributeAssign = stringToPrecomputedChunk('="');
        var attributeEnd = stringToPrecomputedChunk('"');
        var attributeEmptyString = stringToPrecomputedChunk('=""');
        function pushAttribute(target, responseState, name, value) {
          switch (name) {
            case "style": {
              pushStyle(target, responseState, value);
              return;
            }
            case "defaultValue":
            case "defaultChecked":
            // These shouldn't be set as attributes on generic HTML elements.
            case "innerHTML":
            // Must use dangerouslySetInnerHTML instead.
            case "suppressContentEditableWarning":
            case "suppressHydrationWarning":
              return;
          }
          if (
            // shouldIgnoreAttribute
            // We have already filtered out null/undefined and reserved words.
            name.length > 2 && (name[0] === "o" || name[0] === "O") && (name[1] === "n" || name[1] === "N")
          ) {
            return;
          }
          var propertyInfo = getPropertyInfo(name);
          if (propertyInfo !== null) {
            switch (typeof value) {
              case "function":
              // $FlowIssue symbol is perfectly valid here
              case "symbol":
                return;
              case "boolean": {
                if (!propertyInfo.acceptsBooleans) {
                  return;
                }
              }
            }
            var attributeName = propertyInfo.attributeName;
            var attributeNameChunk = stringToChunk(attributeName);
            switch (propertyInfo.type) {
              case BOOLEAN:
                if (value) {
                  target.push(attributeSeparator, attributeNameChunk, attributeEmptyString);
                }
                return;
              case OVERLOADED_BOOLEAN:
                if (value === true) {
                  target.push(attributeSeparator, attributeNameChunk, attributeEmptyString);
                } else if (value === false) ;
                else {
                  target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
                }
                return;
              case NUMERIC:
                if (!isNaN(value)) {
                  target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
                }
                break;
              case POSITIVE_NUMERIC:
                if (!isNaN(value) && value >= 1) {
                  target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
                }
                break;
              default:
                if (propertyInfo.sanitizeURL) {
                  {
                    checkAttributeStringCoercion(value, attributeName);
                  }
                  value = "" + value;
                  sanitizeURL(value);
                }
                target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
            }
          } else if (isAttributeNameSafe(name)) {
            switch (typeof value) {
              case "function":
              // $FlowIssue symbol is perfectly valid here
              case "symbol":
                return;
              case "boolean": {
                var prefix2 = name.toLowerCase().slice(0, 5);
                if (prefix2 !== "data-" && prefix2 !== "aria-") {
                  return;
                }
              }
            }
            target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
          }
        }
        var endOfStartTag = stringToPrecomputedChunk(">");
        var endOfStartTagSelfClosing = stringToPrecomputedChunk("/>");
        function pushInnerHTML(target, innerHTML, children) {
          if (innerHTML != null) {
            if (children != null) {
              throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
            }
            if (typeof innerHTML !== "object" || !("__html" in innerHTML)) {
              throw new Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
            }
            var html = innerHTML.__html;
            if (html !== null && html !== void 0) {
              {
                checkHtmlStringCoercion(html);
              }
              target.push(stringToChunk("" + html));
            }
          }
        }
        var didWarnDefaultInputValue = false;
        var didWarnDefaultChecked = false;
        var didWarnDefaultSelectValue = false;
        var didWarnDefaultTextareaValue = false;
        var didWarnInvalidOptionChildren = false;
        var didWarnInvalidOptionInnerHTML = false;
        var didWarnSelectedSetOnOption = false;
        function checkSelectProp(props, propName) {
          {
            var value = props[propName];
            if (value != null) {
              var array = isArray(value);
              if (props.multiple && !array) {
                error("The `%s` prop supplied to <select> must be an array if `multiple` is true.", propName);
              } else if (!props.multiple && array) {
                error("The `%s` prop supplied to <select> must be a scalar value if `multiple` is false.", propName);
              }
            }
          }
        }
        function pushStartSelect(target, props, responseState) {
          {
            checkControlledValueProps("select", props);
            checkSelectProp(props, "value");
            checkSelectProp(props, "defaultValue");
            if (props.value !== void 0 && props.defaultValue !== void 0 && !didWarnDefaultSelectValue) {
              error("Select elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled select element and remove one of these props. More info: https://reactjs.org/link/controlled-components");
              didWarnDefaultSelectValue = true;
            }
          }
          target.push(startChunkForTag("select"));
          var children = null;
          var innerHTML = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                  children = propValue;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML = propValue;
                  break;
                case "defaultValue":
                case "value":
                  break;
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          target.push(endOfStartTag);
          pushInnerHTML(target, innerHTML, children);
          return children;
        }
        function flattenOptionChildren(children) {
          var content = "";
          React3.Children.forEach(children, function(child) {
            if (child == null) {
              return;
            }
            content += child;
            {
              if (!didWarnInvalidOptionChildren && typeof child !== "string" && typeof child !== "number") {
                didWarnInvalidOptionChildren = true;
                error("Cannot infer the option value of complex children. Pass a `value` prop or use a plain string as children to <option>.");
              }
            }
          });
          return content;
        }
        var selectedMarkerAttribute = stringToPrecomputedChunk(' selected=""');
        function pushStartOption(target, props, responseState, formatContext) {
          var selectedValue = formatContext.selectedValue;
          target.push(startChunkForTag("option"));
          var children = null;
          var value = null;
          var selected = null;
          var innerHTML = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                  children = propValue;
                  break;
                case "selected":
                  selected = propValue;
                  {
                    if (!didWarnSelectedSetOnOption) {
                      error("Use the `defaultValue` or `value` props on <select> instead of setting `selected` on <option>.");
                      didWarnSelectedSetOnOption = true;
                    }
                  }
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML = propValue;
                  break;
                // eslint-disable-next-line-no-fallthrough
                case "value":
                  value = propValue;
                // We intentionally fallthrough to also set the attribute on the node.
                // eslint-disable-next-line-no-fallthrough
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          if (selectedValue != null) {
            var stringValue;
            if (value !== null) {
              {
                checkAttributeStringCoercion(value, "value");
              }
              stringValue = "" + value;
            } else {
              {
                if (innerHTML !== null) {
                  if (!didWarnInvalidOptionInnerHTML) {
                    didWarnInvalidOptionInnerHTML = true;
                    error("Pass a `value` prop if you set dangerouslyInnerHTML so React knows which value should be selected.");
                  }
                }
              }
              stringValue = flattenOptionChildren(children);
            }
            if (isArray(selectedValue)) {
              for (var i = 0; i < selectedValue.length; i++) {
                {
                  checkAttributeStringCoercion(selectedValue[i], "value");
                }
                var v = "" + selectedValue[i];
                if (v === stringValue) {
                  target.push(selectedMarkerAttribute);
                  break;
                }
              }
            } else {
              {
                checkAttributeStringCoercion(selectedValue, "select.value");
              }
              if ("" + selectedValue === stringValue) {
                target.push(selectedMarkerAttribute);
              }
            }
          } else if (selected) {
            target.push(selectedMarkerAttribute);
          }
          target.push(endOfStartTag);
          pushInnerHTML(target, innerHTML, children);
          return children;
        }
        function pushInput(target, props, responseState) {
          {
            checkControlledValueProps("input", props);
            if (props.checked !== void 0 && props.defaultChecked !== void 0 && !didWarnDefaultChecked) {
              error("%s contains an input of type %s with both checked and defaultChecked props. Input elements must be either controlled or uncontrolled (specify either the checked prop, or the defaultChecked prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", "A component", props.type);
              didWarnDefaultChecked = true;
            }
            if (props.value !== void 0 && props.defaultValue !== void 0 && !didWarnDefaultInputValue) {
              error("%s contains an input of type %s with both value and defaultValue props. Input elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", "A component", props.type);
              didWarnDefaultInputValue = true;
            }
          }
          target.push(startChunkForTag("input"));
          var value = null;
          var defaultValue = null;
          var checked = null;
          var defaultChecked = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                case "dangerouslySetInnerHTML":
                  throw new Error("input is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
                // eslint-disable-next-line-no-fallthrough
                case "defaultChecked":
                  defaultChecked = propValue;
                  break;
                case "defaultValue":
                  defaultValue = propValue;
                  break;
                case "checked":
                  checked = propValue;
                  break;
                case "value":
                  value = propValue;
                  break;
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          if (checked !== null) {
            pushAttribute(target, responseState, "checked", checked);
          } else if (defaultChecked !== null) {
            pushAttribute(target, responseState, "checked", defaultChecked);
          }
          if (value !== null) {
            pushAttribute(target, responseState, "value", value);
          } else if (defaultValue !== null) {
            pushAttribute(target, responseState, "value", defaultValue);
          }
          target.push(endOfStartTagSelfClosing);
          return null;
        }
        function pushStartTextArea(target, props, responseState) {
          {
            checkControlledValueProps("textarea", props);
            if (props.value !== void 0 && props.defaultValue !== void 0 && !didWarnDefaultTextareaValue) {
              error("Textarea elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled textarea and remove one of these props. More info: https://reactjs.org/link/controlled-components");
              didWarnDefaultTextareaValue = true;
            }
          }
          target.push(startChunkForTag("textarea"));
          var value = null;
          var defaultValue = null;
          var children = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                  children = propValue;
                  break;
                case "value":
                  value = propValue;
                  break;
                case "defaultValue":
                  defaultValue = propValue;
                  break;
                case "dangerouslySetInnerHTML":
                  throw new Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
                // eslint-disable-next-line-no-fallthrough
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          if (value === null && defaultValue !== null) {
            value = defaultValue;
          }
          target.push(endOfStartTag);
          if (children != null) {
            {
              error("Use the `defaultValue` or `value` props instead of setting children on <textarea>.");
            }
            if (value != null) {
              throw new Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
            }
            if (isArray(children)) {
              if (children.length > 1) {
                throw new Error("<textarea> can only have at most one child.");
              }
              {
                checkHtmlStringCoercion(children[0]);
              }
              value = "" + children[0];
            }
            {
              checkHtmlStringCoercion(children);
            }
            value = "" + children;
          }
          if (typeof value === "string" && value[0] === "\n") {
            target.push(leadingNewline);
          }
          if (value !== null) {
            {
              checkAttributeStringCoercion(value, "value");
            }
            target.push(stringToChunk(encodeHTMLTextNode("" + value)));
          }
          return null;
        }
        function pushSelfClosing(target, props, tag, responseState) {
          target.push(startChunkForTag(tag));
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                case "dangerouslySetInnerHTML":
                  throw new Error(tag + " is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
                // eslint-disable-next-line-no-fallthrough
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          target.push(endOfStartTagSelfClosing);
          return null;
        }
        function pushStartMenuItem(target, props, responseState) {
          target.push(startChunkForTag("menuitem"));
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                case "dangerouslySetInnerHTML":
                  throw new Error("menuitems cannot have `children` nor `dangerouslySetInnerHTML`.");
                // eslint-disable-next-line-no-fallthrough
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          target.push(endOfStartTag);
          return null;
        }
        function pushStartTitle(target, props, responseState) {
          target.push(startChunkForTag("title"));
          var children = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                  children = propValue;
                  break;
                case "dangerouslySetInnerHTML":
                  throw new Error("`dangerouslySetInnerHTML` does not make sense on <title>.");
                // eslint-disable-next-line-no-fallthrough
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          target.push(endOfStartTag);
          {
            var child = Array.isArray(children) && children.length < 2 ? children[0] || null : children;
            if (Array.isArray(children) && children.length > 1) {
              error("A title element received an array with more than 1 element as children. In browsers title Elements can only have Text Nodes as children. If the children being rendered output more than a single text node in aggregate the browser will display markup and comments as text in the title and hydration will likely fail and fall back to client rendering");
            } else if (child != null && child.$$typeof != null) {
              error("A title element received a React element for children. In the browser title Elements can only have Text Nodes as children. If the children being rendered output more than a single text node in aggregate the browser will display markup and comments as text in the title and hydration will likely fail and fall back to client rendering");
            } else if (child != null && typeof child !== "string" && typeof child !== "number") {
              error("A title element received a value that was not a string or number for children. In the browser title Elements can only have Text Nodes as children. If the children being rendered output more than a single text node in aggregate the browser will display markup and comments as text in the title and hydration will likely fail and fall back to client rendering");
            }
          }
          return children;
        }
        function pushStartGenericElement(target, props, tag, responseState) {
          target.push(startChunkForTag(tag));
          var children = null;
          var innerHTML = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                  children = propValue;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML = propValue;
                  break;
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          target.push(endOfStartTag);
          pushInnerHTML(target, innerHTML, children);
          if (typeof children === "string") {
            target.push(stringToChunk(encodeHTMLTextNode(children)));
            return null;
          }
          return children;
        }
        function pushStartCustomElement(target, props, tag, responseState) {
          target.push(startChunkForTag(tag));
          var children = null;
          var innerHTML = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                  children = propValue;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML = propValue;
                  break;
                case "style":
                  pushStyle(target, responseState, propValue);
                  break;
                case "suppressContentEditableWarning":
                case "suppressHydrationWarning":
                  break;
                default:
                  if (isAttributeNameSafe(propKey) && typeof propValue !== "function" && typeof propValue !== "symbol") {
                    target.push(attributeSeparator, stringToChunk(propKey), attributeAssign, stringToChunk(escapeTextForBrowser(propValue)), attributeEnd);
                  }
                  break;
              }
            }
          }
          target.push(endOfStartTag);
          pushInnerHTML(target, innerHTML, children);
          return children;
        }
        var leadingNewline = stringToPrecomputedChunk("\n");
        function pushStartPreformattedElement(target, props, tag, responseState) {
          target.push(startChunkForTag(tag));
          var children = null;
          var innerHTML = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                  children = propValue;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML = propValue;
                  break;
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          target.push(endOfStartTag);
          if (innerHTML != null) {
            if (children != null) {
              throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
            }
            if (typeof innerHTML !== "object" || !("__html" in innerHTML)) {
              throw new Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
            }
            var html = innerHTML.__html;
            if (html !== null && html !== void 0) {
              if (typeof html === "string" && html.length > 0 && html[0] === "\n") {
                target.push(leadingNewline, stringToChunk(html));
              } else {
                {
                  checkHtmlStringCoercion(html);
                }
                target.push(stringToChunk("" + html));
              }
            }
          }
          if (typeof children === "string" && children[0] === "\n") {
            target.push(leadingNewline);
          }
          return children;
        }
        var VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/;
        var validatedTagCache = /* @__PURE__ */ new Map();
        function startChunkForTag(tag) {
          var tagStartChunk = validatedTagCache.get(tag);
          if (tagStartChunk === void 0) {
            if (!VALID_TAG_REGEX.test(tag)) {
              throw new Error("Invalid tag: " + tag);
            }
            tagStartChunk = stringToPrecomputedChunk("<" + tag);
            validatedTagCache.set(tag, tagStartChunk);
          }
          return tagStartChunk;
        }
        var DOCTYPE = stringToPrecomputedChunk("<!DOCTYPE html>");
        function pushStartInstance(target, type, props, responseState, formatContext) {
          {
            validateProperties(type, props);
            validateProperties$1(type, props);
            validateProperties$2(type, props, null);
            if (!props.suppressContentEditableWarning && props.contentEditable && props.children != null) {
              error("A component is `contentEditable` and contains `children` managed by React. It is now your responsibility to guarantee that none of those nodes are unexpectedly modified or duplicated. This is probably not intentional.");
            }
            if (formatContext.insertionMode !== SVG_MODE && formatContext.insertionMode !== MATHML_MODE) {
              if (type.indexOf("-") === -1 && typeof props.is !== "string" && type.toLowerCase() !== type) {
                error("<%s /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.", type);
              }
            }
          }
          switch (type) {
            // Special tags
            case "select":
              return pushStartSelect(target, props, responseState);
            case "option":
              return pushStartOption(target, props, responseState, formatContext);
            case "textarea":
              return pushStartTextArea(target, props, responseState);
            case "input":
              return pushInput(target, props, responseState);
            case "menuitem":
              return pushStartMenuItem(target, props, responseState);
            case "title":
              return pushStartTitle(target, props, responseState);
            // Newline eating tags
            case "listing":
            case "pre": {
              return pushStartPreformattedElement(target, props, type, responseState);
            }
            // Omitted close tags
            case "area":
            case "base":
            case "br":
            case "col":
            case "embed":
            case "hr":
            case "img":
            case "keygen":
            case "link":
            case "meta":
            case "param":
            case "source":
            case "track":
            case "wbr": {
              return pushSelfClosing(target, props, type, responseState);
            }
            // These are reserved SVG and MathML elements, that are never custom elements.
            // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
            case "annotation-xml":
            case "color-profile":
            case "font-face":
            case "font-face-src":
            case "font-face-uri":
            case "font-face-format":
            case "font-face-name":
            case "missing-glyph": {
              return pushStartGenericElement(target, props, type, responseState);
            }
            case "html": {
              if (formatContext.insertionMode === ROOT_HTML_MODE) {
                target.push(DOCTYPE);
              }
              return pushStartGenericElement(target, props, type, responseState);
            }
            default: {
              if (type.indexOf("-") === -1 && typeof props.is !== "string") {
                return pushStartGenericElement(target, props, type, responseState);
              } else {
                return pushStartCustomElement(target, props, type, responseState);
              }
            }
          }
        }
        var endTag1 = stringToPrecomputedChunk("</");
        var endTag2 = stringToPrecomputedChunk(">");
        function pushEndInstance(target, type, props) {
          switch (type) {
            // Omitted close tags
            // TODO: Instead of repeating this switch we could try to pass a flag from above.
            // That would require returning a tuple. Which might be ok if it gets inlined.
            case "area":
            case "base":
            case "br":
            case "col":
            case "embed":
            case "hr":
            case "img":
            case "input":
            case "keygen":
            case "link":
            case "meta":
            case "param":
            case "source":
            case "track":
            case "wbr": {
              break;
            }
            default: {
              target.push(endTag1, stringToChunk(type), endTag2);
            }
          }
        }
        function writeCompletedRoot(destination, responseState) {
          var bootstrapChunks = responseState.bootstrapChunks;
          var i = 0;
          for (; i < bootstrapChunks.length - 1; i++) {
            writeChunk(destination, bootstrapChunks[i]);
          }
          if (i < bootstrapChunks.length) {
            return writeChunkAndReturn(destination, bootstrapChunks[i]);
          }
          return true;
        }
        var placeholder1 = stringToPrecomputedChunk('<template id="');
        var placeholder2 = stringToPrecomputedChunk('"></template>');
        function writePlaceholder(destination, responseState, id) {
          writeChunk(destination, placeholder1);
          writeChunk(destination, responseState.placeholderPrefix);
          var formattedID = stringToChunk(id.toString(16));
          writeChunk(destination, formattedID);
          return writeChunkAndReturn(destination, placeholder2);
        }
        var startCompletedSuspenseBoundary = stringToPrecomputedChunk("<!--$-->");
        var startPendingSuspenseBoundary1 = stringToPrecomputedChunk('<!--$?--><template id="');
        var startPendingSuspenseBoundary2 = stringToPrecomputedChunk('"></template>');
        var startClientRenderedSuspenseBoundary = stringToPrecomputedChunk("<!--$!-->");
        var endSuspenseBoundary = stringToPrecomputedChunk("<!--/$-->");
        var clientRenderedSuspenseBoundaryError1 = stringToPrecomputedChunk("<template");
        var clientRenderedSuspenseBoundaryErrorAttrInterstitial = stringToPrecomputedChunk('"');
        var clientRenderedSuspenseBoundaryError1A = stringToPrecomputedChunk(' data-dgst="');
        var clientRenderedSuspenseBoundaryError1B = stringToPrecomputedChunk(' data-msg="');
        var clientRenderedSuspenseBoundaryError1C = stringToPrecomputedChunk(' data-stck="');
        var clientRenderedSuspenseBoundaryError2 = stringToPrecomputedChunk("></template>");
        function writeStartCompletedSuspenseBoundary(destination, responseState) {
          return writeChunkAndReturn(destination, startCompletedSuspenseBoundary);
        }
        function writeStartPendingSuspenseBoundary(destination, responseState, id) {
          writeChunk(destination, startPendingSuspenseBoundary1);
          if (id === null) {
            throw new Error("An ID must have been assigned before we can complete the boundary.");
          }
          writeChunk(destination, id);
          return writeChunkAndReturn(destination, startPendingSuspenseBoundary2);
        }
        function writeStartClientRenderedSuspenseBoundary(destination, responseState, errorDigest, errorMesssage, errorComponentStack) {
          var result;
          result = writeChunkAndReturn(destination, startClientRenderedSuspenseBoundary);
          writeChunk(destination, clientRenderedSuspenseBoundaryError1);
          if (errorDigest) {
            writeChunk(destination, clientRenderedSuspenseBoundaryError1A);
            writeChunk(destination, stringToChunk(escapeTextForBrowser(errorDigest)));
            writeChunk(destination, clientRenderedSuspenseBoundaryErrorAttrInterstitial);
          }
          {
            if (errorMesssage) {
              writeChunk(destination, clientRenderedSuspenseBoundaryError1B);
              writeChunk(destination, stringToChunk(escapeTextForBrowser(errorMesssage)));
              writeChunk(destination, clientRenderedSuspenseBoundaryErrorAttrInterstitial);
            }
            if (errorComponentStack) {
              writeChunk(destination, clientRenderedSuspenseBoundaryError1C);
              writeChunk(destination, stringToChunk(escapeTextForBrowser(errorComponentStack)));
              writeChunk(destination, clientRenderedSuspenseBoundaryErrorAttrInterstitial);
            }
          }
          result = writeChunkAndReturn(destination, clientRenderedSuspenseBoundaryError2);
          return result;
        }
        function writeEndCompletedSuspenseBoundary(destination, responseState) {
          return writeChunkAndReturn(destination, endSuspenseBoundary);
        }
        function writeEndPendingSuspenseBoundary(destination, responseState) {
          return writeChunkAndReturn(destination, endSuspenseBoundary);
        }
        function writeEndClientRenderedSuspenseBoundary(destination, responseState) {
          return writeChunkAndReturn(destination, endSuspenseBoundary);
        }
        var startSegmentHTML = stringToPrecomputedChunk('<div hidden id="');
        var startSegmentHTML2 = stringToPrecomputedChunk('">');
        var endSegmentHTML = stringToPrecomputedChunk("</div>");
        var startSegmentSVG = stringToPrecomputedChunk('<svg aria-hidden="true" style="display:none" id="');
        var startSegmentSVG2 = stringToPrecomputedChunk('">');
        var endSegmentSVG = stringToPrecomputedChunk("</svg>");
        var startSegmentMathML = stringToPrecomputedChunk('<math aria-hidden="true" style="display:none" id="');
        var startSegmentMathML2 = stringToPrecomputedChunk('">');
        var endSegmentMathML = stringToPrecomputedChunk("</math>");
        var startSegmentTable = stringToPrecomputedChunk('<table hidden id="');
        var startSegmentTable2 = stringToPrecomputedChunk('">');
        var endSegmentTable = stringToPrecomputedChunk("</table>");
        var startSegmentTableBody = stringToPrecomputedChunk('<table hidden><tbody id="');
        var startSegmentTableBody2 = stringToPrecomputedChunk('">');
        var endSegmentTableBody = stringToPrecomputedChunk("</tbody></table>");
        var startSegmentTableRow = stringToPrecomputedChunk('<table hidden><tr id="');
        var startSegmentTableRow2 = stringToPrecomputedChunk('">');
        var endSegmentTableRow = stringToPrecomputedChunk("</tr></table>");
        var startSegmentColGroup = stringToPrecomputedChunk('<table hidden><colgroup id="');
        var startSegmentColGroup2 = stringToPrecomputedChunk('">');
        var endSegmentColGroup = stringToPrecomputedChunk("</colgroup></table>");
        function writeStartSegment(destination, responseState, formatContext, id) {
          switch (formatContext.insertionMode) {
            case ROOT_HTML_MODE:
            case HTML_MODE: {
              writeChunk(destination, startSegmentHTML);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentHTML2);
            }
            case SVG_MODE: {
              writeChunk(destination, startSegmentSVG);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentSVG2);
            }
            case MATHML_MODE: {
              writeChunk(destination, startSegmentMathML);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentMathML2);
            }
            case HTML_TABLE_MODE: {
              writeChunk(destination, startSegmentTable);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentTable2);
            }
            // TODO: For the rest of these, there will be extra wrapper nodes that never
            // get deleted from the document. We need to delete the table too as part
            // of the injected scripts. They are invisible though so it's not too terrible
            // and it's kind of an edge case to suspend in a table. Totally supported though.
            case HTML_TABLE_BODY_MODE: {
              writeChunk(destination, startSegmentTableBody);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentTableBody2);
            }
            case HTML_TABLE_ROW_MODE: {
              writeChunk(destination, startSegmentTableRow);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentTableRow2);
            }
            case HTML_COLGROUP_MODE: {
              writeChunk(destination, startSegmentColGroup);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentColGroup2);
            }
            default: {
              throw new Error("Unknown insertion mode. This is a bug in React.");
            }
          }
        }
        function writeEndSegment(destination, formatContext) {
          switch (formatContext.insertionMode) {
            case ROOT_HTML_MODE:
            case HTML_MODE: {
              return writeChunkAndReturn(destination, endSegmentHTML);
            }
            case SVG_MODE: {
              return writeChunkAndReturn(destination, endSegmentSVG);
            }
            case MATHML_MODE: {
              return writeChunkAndReturn(destination, endSegmentMathML);
            }
            case HTML_TABLE_MODE: {
              return writeChunkAndReturn(destination, endSegmentTable);
            }
            case HTML_TABLE_BODY_MODE: {
              return writeChunkAndReturn(destination, endSegmentTableBody);
            }
            case HTML_TABLE_ROW_MODE: {
              return writeChunkAndReturn(destination, endSegmentTableRow);
            }
            case HTML_COLGROUP_MODE: {
              return writeChunkAndReturn(destination, endSegmentColGroup);
            }
            default: {
              throw new Error("Unknown insertion mode. This is a bug in React.");
            }
          }
        }
        var completeSegmentFunction = "function $RS(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)}";
        var completeBoundaryFunction = 'function $RC(a,b){a=document.getElementById(a);b=document.getElementById(b);b.parentNode.removeChild(b);if(a){a=a.previousSibling;var f=a.parentNode,c=a.nextSibling,e=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d)if(0===e)break;else e--;else"$"!==d&&"$?"!==d&&"$!"!==d||e++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;b.firstChild;)f.insertBefore(b.firstChild,c);a.data="$";a._reactRetry&&a._reactRetry()}}';
        var clientRenderFunction = 'function $RX(b,c,d,e){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),b._reactRetry&&b._reactRetry())}';
        var completeSegmentScript1Full = stringToPrecomputedChunk(completeSegmentFunction + ';$RS("');
        var completeSegmentScript1Partial = stringToPrecomputedChunk('$RS("');
        var completeSegmentScript2 = stringToPrecomputedChunk('","');
        var completeSegmentScript3 = stringToPrecomputedChunk('")</script>');
        function writeCompletedSegmentInstruction(destination, responseState, contentSegmentID) {
          writeChunk(destination, responseState.startInlineScript);
          if (!responseState.sentCompleteSegmentFunction) {
            responseState.sentCompleteSegmentFunction = true;
            writeChunk(destination, completeSegmentScript1Full);
          } else {
            writeChunk(destination, completeSegmentScript1Partial);
          }
          writeChunk(destination, responseState.segmentPrefix);
          var formattedID = stringToChunk(contentSegmentID.toString(16));
          writeChunk(destination, formattedID);
          writeChunk(destination, completeSegmentScript2);
          writeChunk(destination, responseState.placeholderPrefix);
          writeChunk(destination, formattedID);
          return writeChunkAndReturn(destination, completeSegmentScript3);
        }
        var completeBoundaryScript1Full = stringToPrecomputedChunk(completeBoundaryFunction + ';$RC("');
        var completeBoundaryScript1Partial = stringToPrecomputedChunk('$RC("');
        var completeBoundaryScript2 = stringToPrecomputedChunk('","');
        var completeBoundaryScript3 = stringToPrecomputedChunk('")</script>');
        function writeCompletedBoundaryInstruction(destination, responseState, boundaryID, contentSegmentID) {
          writeChunk(destination, responseState.startInlineScript);
          if (!responseState.sentCompleteBoundaryFunction) {
            responseState.sentCompleteBoundaryFunction = true;
            writeChunk(destination, completeBoundaryScript1Full);
          } else {
            writeChunk(destination, completeBoundaryScript1Partial);
          }
          if (boundaryID === null) {
            throw new Error("An ID must have been assigned before we can complete the boundary.");
          }
          var formattedContentID = stringToChunk(contentSegmentID.toString(16));
          writeChunk(destination, boundaryID);
          writeChunk(destination, completeBoundaryScript2);
          writeChunk(destination, responseState.segmentPrefix);
          writeChunk(destination, formattedContentID);
          return writeChunkAndReturn(destination, completeBoundaryScript3);
        }
        var clientRenderScript1Full = stringToPrecomputedChunk(clientRenderFunction + ';$RX("');
        var clientRenderScript1Partial = stringToPrecomputedChunk('$RX("');
        var clientRenderScript1A = stringToPrecomputedChunk('"');
        var clientRenderScript2 = stringToPrecomputedChunk(")</script>");
        var clientRenderErrorScriptArgInterstitial = stringToPrecomputedChunk(",");
        function writeClientRenderBoundaryInstruction(destination, responseState, boundaryID, errorDigest, errorMessage, errorComponentStack) {
          writeChunk(destination, responseState.startInlineScript);
          if (!responseState.sentClientRenderFunction) {
            responseState.sentClientRenderFunction = true;
            writeChunk(destination, clientRenderScript1Full);
          } else {
            writeChunk(destination, clientRenderScript1Partial);
          }
          if (boundaryID === null) {
            throw new Error("An ID must have been assigned before we can complete the boundary.");
          }
          writeChunk(destination, boundaryID);
          writeChunk(destination, clientRenderScript1A);
          if (errorDigest || errorMessage || errorComponentStack) {
            writeChunk(destination, clientRenderErrorScriptArgInterstitial);
            writeChunk(destination, stringToChunk(escapeJSStringsForInstructionScripts(errorDigest || "")));
          }
          if (errorMessage || errorComponentStack) {
            writeChunk(destination, clientRenderErrorScriptArgInterstitial);
            writeChunk(destination, stringToChunk(escapeJSStringsForInstructionScripts(errorMessage || "")));
          }
          if (errorComponentStack) {
            writeChunk(destination, clientRenderErrorScriptArgInterstitial);
            writeChunk(destination, stringToChunk(escapeJSStringsForInstructionScripts(errorComponentStack)));
          }
          return writeChunkAndReturn(destination, clientRenderScript2);
        }
        var regexForJSStringsInScripts = /[<\u2028\u2029]/g;
        function escapeJSStringsForInstructionScripts(input) {
          var escaped = JSON.stringify(input);
          return escaped.replace(regexForJSStringsInScripts, function(match) {
            switch (match) {
              // santizing breaking out of strings and script tags
              case "<":
                return "\\u003c";
              case "\u2028":
                return "\\u2028";
              case "\u2029":
                return "\\u2029";
              default: {
                throw new Error("escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
              }
            }
          });
        }
        function createResponseState$1(generateStaticMarkup, identifierPrefix) {
          var responseState = createResponseState(identifierPrefix, void 0);
          return {
            // Keep this in sync with ReactDOMServerFormatConfig
            bootstrapChunks: responseState.bootstrapChunks,
            startInlineScript: responseState.startInlineScript,
            placeholderPrefix: responseState.placeholderPrefix,
            segmentPrefix: responseState.segmentPrefix,
            boundaryPrefix: responseState.boundaryPrefix,
            idPrefix: responseState.idPrefix,
            nextSuspenseID: responseState.nextSuspenseID,
            sentCompleteSegmentFunction: responseState.sentCompleteSegmentFunction,
            sentCompleteBoundaryFunction: responseState.sentCompleteBoundaryFunction,
            sentClientRenderFunction: responseState.sentClientRenderFunction,
            // This is an extra field for the legacy renderer
            generateStaticMarkup
          };
        }
        function createRootFormatContext() {
          return {
            insertionMode: HTML_MODE,
            // We skip the root mode because we don't want to emit the DOCTYPE in legacy mode.
            selectedValue: null
          };
        }
        function pushTextInstance$1(target, text, responseState, textEmbedded) {
          if (responseState.generateStaticMarkup) {
            target.push(stringToChunk(escapeTextForBrowser(text)));
            return false;
          } else {
            return pushTextInstance(target, text, responseState, textEmbedded);
          }
        }
        function pushSegmentFinale$1(target, responseState, lastPushedText, textEmbedded) {
          if (responseState.generateStaticMarkup) {
            return;
          } else {
            return pushSegmentFinale(target, responseState, lastPushedText, textEmbedded);
          }
        }
        function writeStartCompletedSuspenseBoundary$1(destination, responseState) {
          if (responseState.generateStaticMarkup) {
            return true;
          }
          return writeStartCompletedSuspenseBoundary(destination);
        }
        function writeStartClientRenderedSuspenseBoundary$1(destination, responseState, errorDigest, errorMessage, errorComponentStack) {
          if (responseState.generateStaticMarkup) {
            return true;
          }
          return writeStartClientRenderedSuspenseBoundary(destination, responseState, errorDigest, errorMessage, errorComponentStack);
        }
        function writeEndCompletedSuspenseBoundary$1(destination, responseState) {
          if (responseState.generateStaticMarkup) {
            return true;
          }
          return writeEndCompletedSuspenseBoundary(destination);
        }
        function writeEndClientRenderedSuspenseBoundary$1(destination, responseState) {
          if (responseState.generateStaticMarkup) {
            return true;
          }
          return writeEndClientRenderedSuspenseBoundary(destination);
        }
        var assign = Object.assign;
        var REACT_ELEMENT_TYPE = Symbol.for("react.element");
        var REACT_PORTAL_TYPE = Symbol.for("react.portal");
        var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
        var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
        var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
        var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
        var REACT_CONTEXT_TYPE = Symbol.for("react.context");
        var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
        var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
        var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
        var REACT_MEMO_TYPE = Symbol.for("react.memo");
        var REACT_LAZY_TYPE = Symbol.for("react.lazy");
        var REACT_SCOPE_TYPE = Symbol.for("react.scope");
        var REACT_DEBUG_TRACING_MODE_TYPE = Symbol.for("react.debug_trace_mode");
        var REACT_LEGACY_HIDDEN_TYPE = Symbol.for("react.legacy_hidden");
        var REACT_SERVER_CONTEXT_DEFAULT_VALUE_NOT_LOADED = Symbol.for("react.default_value");
        var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        var FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          if (maybeIterable === null || typeof maybeIterable !== "object") {
            return null;
          }
          var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
          if (typeof maybeIterator === "function") {
            return maybeIterator;
          }
          return null;
        }
        function getWrappedName(outerType, innerType, wrapperName) {
          var displayName = outerType.displayName;
          if (displayName) {
            return displayName;
          }
          var functionName = innerType.displayName || innerType.name || "";
          return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
        }
        function getContextName(type) {
          return type.displayName || "Context";
        }
        function getComponentNameFromType(type) {
          if (type == null) {
            return null;
          }
          {
            if (typeof type.tag === "number") {
              error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
            }
          }
          if (typeof type === "function") {
            return type.displayName || type.name || null;
          }
          if (typeof type === "string") {
            return type;
          }
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                var context = type;
                return getContextName(context) + ".Consumer";
              case REACT_PROVIDER_TYPE:
                var provider = type;
                return getContextName(provider._context) + ".Provider";
              case REACT_FORWARD_REF_TYPE:
                return getWrappedName(type, type.render, "ForwardRef");
              case REACT_MEMO_TYPE:
                var outerName = type.displayName || null;
                if (outerName !== null) {
                  return outerName;
                }
                return getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return getComponentNameFromType(init(payload));
                } catch (x) {
                  return null;
                }
              }
            }
          }
          return null;
        }
        var disabledDepth = 0;
        var prevLog;
        var prevInfo;
        var prevWarn;
        var prevError;
        var prevGroup;
        var prevGroupCollapsed;
        var prevGroupEnd;
        function disabledLog() {
        }
        disabledLog.__reactDisabledLog = true;
        function disableLogs() {
          {
            if (disabledDepth === 0) {
              prevLog = console.log;
              prevInfo = console.info;
              prevWarn = console.warn;
              prevError = console.error;
              prevGroup = console.group;
              prevGroupCollapsed = console.groupCollapsed;
              prevGroupEnd = console.groupEnd;
              var props = {
                configurable: true,
                enumerable: true,
                value: disabledLog,
                writable: true
              };
              Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
              });
            }
            disabledDepth++;
          }
        }
        function reenableLogs() {
          {
            disabledDepth--;
            if (disabledDepth === 0) {
              var props = {
                configurable: true,
                enumerable: true,
                writable: true
              };
              Object.defineProperties(console, {
                log: assign({}, props, {
                  value: prevLog
                }),
                info: assign({}, props, {
                  value: prevInfo
                }),
                warn: assign({}, props, {
                  value: prevWarn
                }),
                error: assign({}, props, {
                  value: prevError
                }),
                group: assign({}, props, {
                  value: prevGroup
                }),
                groupCollapsed: assign({}, props, {
                  value: prevGroupCollapsed
                }),
                groupEnd: assign({}, props, {
                  value: prevGroupEnd
                })
              });
            }
            if (disabledDepth < 0) {
              error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
            }
          }
        }
        var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
        var prefix;
        function describeBuiltInComponentFrame(name, source, ownerFn) {
          {
            if (prefix === void 0) {
              try {
                throw Error();
              } catch (x) {
                var match = x.stack.trim().match(/\n( *(at )?)/);
                prefix = match && match[1] || "";
              }
            }
            return "\n" + prefix + name;
          }
        }
        var reentry = false;
        var componentFrameCache;
        {
          var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
          componentFrameCache = new PossiblyWeakMap();
        }
        function describeNativeComponentFrame(fn, construct) {
          if (!fn || reentry) {
            return "";
          }
          {
            var frame = componentFrameCache.get(fn);
            if (frame !== void 0) {
              return frame;
            }
          }
          var control;
          reentry = true;
          var previousPrepareStackTrace = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          var previousDispatcher;
          {
            previousDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = null;
            disableLogs();
          }
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if (typeof Reflect === "object" && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x) {
                  control = x;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x) {
                control = x;
              }
              fn();
            }
          } catch (sample) {
            if (sample && control && typeof sample.stack === "string") {
              var sampleLines = sample.stack.split("\n");
              var controlLines = control.stack.split("\n");
              var s = sampleLines.length - 1;
              var c = controlLines.length - 1;
              while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                c--;
              }
              for (; s >= 1 && c >= 0; s--, c--) {
                if (sampleLines[s] !== controlLines[c]) {
                  if (s !== 1 || c !== 1) {
                    do {
                      s--;
                      c--;
                      if (c < 0 || sampleLines[s] !== controlLines[c]) {
                        var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                        if (fn.displayName && _frame.includes("<anonymous>")) {
                          _frame = _frame.replace("<anonymous>", fn.displayName);
                        }
                        {
                          if (typeof fn === "function") {
                            componentFrameCache.set(fn, _frame);
                          }
                        }
                        return _frame;
                      }
                    } while (s >= 1 && c >= 0);
                  }
                  break;
                }
              }
            }
          } finally {
            reentry = false;
            {
              ReactCurrentDispatcher.current = previousDispatcher;
              reenableLogs();
            }
            Error.prepareStackTrace = previousPrepareStackTrace;
          }
          var name = fn ? fn.displayName || fn.name : "";
          var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
          {
            if (typeof fn === "function") {
              componentFrameCache.set(fn, syntheticFrame);
            }
          }
          return syntheticFrame;
        }
        function describeClassComponentFrame(ctor, source, ownerFn) {
          {
            return describeNativeComponentFrame(ctor, true);
          }
        }
        function describeFunctionComponentFrame(fn, source, ownerFn) {
          {
            return describeNativeComponentFrame(fn, false);
          }
        }
        function shouldConstruct(Component) {
          var prototype = Component.prototype;
          return !!(prototype && prototype.isReactComponent);
        }
        function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
          if (type == null) {
            return "";
          }
          if (typeof type === "function") {
            {
              return describeNativeComponentFrame(type, shouldConstruct(type));
            }
          }
          if (typeof type === "string") {
            return describeBuiltInComponentFrame(type);
          }
          switch (type) {
            case REACT_SUSPENSE_TYPE:
              return describeBuiltInComponentFrame("Suspense");
            case REACT_SUSPENSE_LIST_TYPE:
              return describeBuiltInComponentFrame("SuspenseList");
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE:
                return describeFunctionComponentFrame(type.render);
              case REACT_MEMO_TYPE:
                return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x) {
                }
              }
            }
          }
          return "";
        }
        var loggedTypeFailures = {};
        var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame.setExtraStackFrame(null);
            }
          }
        }
        function checkPropTypes(typeSpecs, values, location, componentName, element) {
          {
            var has = Function.call.bind(hasOwnProperty);
            for (var typeSpecName in typeSpecs) {
              if (has(typeSpecs, typeSpecName)) {
                var error$1 = void 0;
                try {
                  if (typeof typeSpecs[typeSpecName] !== "function") {
                    var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                    err.name = "Invariant Violation";
                    throw err;
                  }
                  error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
                } catch (ex) {
                  error$1 = ex;
                }
                if (error$1 && !(error$1 instanceof Error)) {
                  setCurrentlyValidatingElement(element);
                  error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                  setCurrentlyValidatingElement(null);
                }
                if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                  loggedTypeFailures[error$1.message] = true;
                  setCurrentlyValidatingElement(element);
                  error("Failed %s type: %s", location, error$1.message);
                  setCurrentlyValidatingElement(null);
                }
              }
            }
          }
        }
        var warnedAboutMissingGetChildContext;
        {
          warnedAboutMissingGetChildContext = {};
        }
        var emptyContextObject = {};
        {
          Object.freeze(emptyContextObject);
        }
        function getMaskedContext(type, unmaskedContext) {
          {
            var contextTypes = type.contextTypes;
            if (!contextTypes) {
              return emptyContextObject;
            }
            var context = {};
            for (var key in contextTypes) {
              context[key] = unmaskedContext[key];
            }
            {
              var name = getComponentNameFromType(type) || "Unknown";
              checkPropTypes(contextTypes, context, "context", name);
            }
            return context;
          }
        }
        function processChildContext(instance, type, parentContext, childContextTypes) {
          {
            if (typeof instance.getChildContext !== "function") {
              {
                var componentName = getComponentNameFromType(type) || "Unknown";
                if (!warnedAboutMissingGetChildContext[componentName]) {
                  warnedAboutMissingGetChildContext[componentName] = true;
                  error("%s.childContextTypes is specified but there is no getChildContext() method on the instance. You can either define getChildContext() on %s or remove childContextTypes from it.", componentName, componentName);
                }
              }
              return parentContext;
            }
            var childContext = instance.getChildContext();
            for (var contextKey in childContext) {
              if (!(contextKey in childContextTypes)) {
                throw new Error((getComponentNameFromType(type) || "Unknown") + '.getChildContext(): key "' + contextKey + '" is not defined in childContextTypes.');
              }
            }
            {
              var name = getComponentNameFromType(type) || "Unknown";
              checkPropTypes(childContextTypes, childContext, "child context", name);
            }
            return assign({}, parentContext, childContext);
          }
        }
        var rendererSigil;
        {
          rendererSigil = {};
        }
        var rootContextSnapshot = null;
        var currentActiveSnapshot = null;
        function popNode(prev) {
          {
            prev.context._currentValue2 = prev.parentValue;
          }
        }
        function pushNode(next) {
          {
            next.context._currentValue2 = next.value;
          }
        }
        function popToNearestCommonAncestor(prev, next) {
          if (prev === next) ;
          else {
            popNode(prev);
            var parentPrev = prev.parent;
            var parentNext = next.parent;
            if (parentPrev === null) {
              if (parentNext !== null) {
                throw new Error("The stacks must reach the root at the same time. This is a bug in React.");
              }
            } else {
              if (parentNext === null) {
                throw new Error("The stacks must reach the root at the same time. This is a bug in React.");
              }
              popToNearestCommonAncestor(parentPrev, parentNext);
            }
            pushNode(next);
          }
        }
        function popAllPrevious(prev) {
          popNode(prev);
          var parentPrev = prev.parent;
          if (parentPrev !== null) {
            popAllPrevious(parentPrev);
          }
        }
        function pushAllNext(next) {
          var parentNext = next.parent;
          if (parentNext !== null) {
            pushAllNext(parentNext);
          }
          pushNode(next);
        }
        function popPreviousToCommonLevel(prev, next) {
          popNode(prev);
          var parentPrev = prev.parent;
          if (parentPrev === null) {
            throw new Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
          }
          if (parentPrev.depth === next.depth) {
            popToNearestCommonAncestor(parentPrev, next);
          } else {
            popPreviousToCommonLevel(parentPrev, next);
          }
        }
        function popNextToCommonLevel(prev, next) {
          var parentNext = next.parent;
          if (parentNext === null) {
            throw new Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
          }
          if (prev.depth === parentNext.depth) {
            popToNearestCommonAncestor(prev, parentNext);
          } else {
            popNextToCommonLevel(prev, parentNext);
          }
          pushNode(next);
        }
        function switchContext(newSnapshot) {
          var prev = currentActiveSnapshot;
          var next = newSnapshot;
          if (prev !== next) {
            if (prev === null) {
              pushAllNext(next);
            } else if (next === null) {
              popAllPrevious(prev);
            } else if (prev.depth === next.depth) {
              popToNearestCommonAncestor(prev, next);
            } else if (prev.depth > next.depth) {
              popPreviousToCommonLevel(prev, next);
            } else {
              popNextToCommonLevel(prev, next);
            }
            currentActiveSnapshot = next;
          }
        }
        function pushProvider(context, nextValue) {
          var prevValue;
          {
            prevValue = context._currentValue2;
            context._currentValue2 = nextValue;
            {
              if (context._currentRenderer2 !== void 0 && context._currentRenderer2 !== null && context._currentRenderer2 !== rendererSigil) {
                error("Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported.");
              }
              context._currentRenderer2 = rendererSigil;
            }
          }
          var prevNode = currentActiveSnapshot;
          var newNode = {
            parent: prevNode,
            depth: prevNode === null ? 0 : prevNode.depth + 1,
            context,
            parentValue: prevValue,
            value: nextValue
          };
          currentActiveSnapshot = newNode;
          return newNode;
        }
        function popProvider(context) {
          var prevSnapshot = currentActiveSnapshot;
          if (prevSnapshot === null) {
            throw new Error("Tried to pop a Context at the root of the app. This is a bug in React.");
          }
          {
            if (prevSnapshot.context !== context) {
              error("The parent context is not the expected context. This is probably a bug in React.");
            }
          }
          {
            var _value = prevSnapshot.parentValue;
            if (_value === REACT_SERVER_CONTEXT_DEFAULT_VALUE_NOT_LOADED) {
              prevSnapshot.context._currentValue2 = prevSnapshot.context._defaultValue;
            } else {
              prevSnapshot.context._currentValue2 = _value;
            }
            {
              if (context._currentRenderer2 !== void 0 && context._currentRenderer2 !== null && context._currentRenderer2 !== rendererSigil) {
                error("Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported.");
              }
              context._currentRenderer2 = rendererSigil;
            }
          }
          return currentActiveSnapshot = prevSnapshot.parent;
        }
        function getActiveContext() {
          return currentActiveSnapshot;
        }
        function readContext(context) {
          var value = context._currentValue2;
          return value;
        }
        function get(key) {
          return key._reactInternals;
        }
        function set(key, value) {
          key._reactInternals = value;
        }
        var didWarnAboutNoopUpdateForComponent = {};
        var didWarnAboutDeprecatedWillMount = {};
        var didWarnAboutUninitializedState;
        var didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate;
        var didWarnAboutLegacyLifecyclesAndDerivedState;
        var didWarnAboutUndefinedDerivedState;
        var warnOnUndefinedDerivedState;
        var warnOnInvalidCallback;
        var didWarnAboutDirectlyAssigningPropsToState;
        var didWarnAboutContextTypeAndContextTypes;
        var didWarnAboutInvalidateContextType;
        {
          didWarnAboutUninitializedState = /* @__PURE__ */ new Set();
          didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate = /* @__PURE__ */ new Set();
          didWarnAboutLegacyLifecyclesAndDerivedState = /* @__PURE__ */ new Set();
          didWarnAboutDirectlyAssigningPropsToState = /* @__PURE__ */ new Set();
          didWarnAboutUndefinedDerivedState = /* @__PURE__ */ new Set();
          didWarnAboutContextTypeAndContextTypes = /* @__PURE__ */ new Set();
          didWarnAboutInvalidateContextType = /* @__PURE__ */ new Set();
          var didWarnOnInvalidCallback = /* @__PURE__ */ new Set();
          warnOnInvalidCallback = function(callback, callerName) {
            if (callback === null || typeof callback === "function") {
              return;
            }
            var key = callerName + "_" + callback;
            if (!didWarnOnInvalidCallback.has(key)) {
              didWarnOnInvalidCallback.add(key);
              error("%s(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", callerName, callback);
            }
          };
          warnOnUndefinedDerivedState = function(type, partialState) {
            if (partialState === void 0) {
              var componentName = getComponentNameFromType(type) || "Component";
              if (!didWarnAboutUndefinedDerivedState.has(componentName)) {
                didWarnAboutUndefinedDerivedState.add(componentName);
                error("%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. You have returned undefined.", componentName);
              }
            }
          };
        }
        function warnNoop(publicInstance, callerName) {
          {
            var _constructor = publicInstance.constructor;
            var componentName = _constructor && getComponentNameFromType(_constructor) || "ReactClass";
            var warningKey = componentName + "." + callerName;
            if (didWarnAboutNoopUpdateForComponent[warningKey]) {
              return;
            }
            error("%s(...): Can only update a mounting component. This usually means you called %s() outside componentWillMount() on the server. This is a no-op.\n\nPlease check the code for the %s component.", callerName, callerName, componentName);
            didWarnAboutNoopUpdateForComponent[warningKey] = true;
          }
        }
        var classComponentUpdater = {
          isMounted: function(inst) {
            return false;
          },
          enqueueSetState: function(inst, payload, callback) {
            var internals = get(inst);
            if (internals.queue === null) {
              warnNoop(inst, "setState");
            } else {
              internals.queue.push(payload);
              {
                if (callback !== void 0 && callback !== null) {
                  warnOnInvalidCallback(callback, "setState");
                }
              }
            }
          },
          enqueueReplaceState: function(inst, payload, callback) {
            var internals = get(inst);
            internals.replace = true;
            internals.queue = [payload];
            {
              if (callback !== void 0 && callback !== null) {
                warnOnInvalidCallback(callback, "setState");
              }
            }
          },
          enqueueForceUpdate: function(inst, callback) {
            var internals = get(inst);
            if (internals.queue === null) {
              warnNoop(inst, "forceUpdate");
            } else {
              {
                if (callback !== void 0 && callback !== null) {
                  warnOnInvalidCallback(callback, "setState");
                }
              }
            }
          }
        };
        function applyDerivedStateFromProps(instance, ctor, getDerivedStateFromProps, prevState, nextProps) {
          var partialState = getDerivedStateFromProps(nextProps, prevState);
          {
            warnOnUndefinedDerivedState(ctor, partialState);
          }
          var newState = partialState === null || partialState === void 0 ? prevState : assign({}, prevState, partialState);
          return newState;
        }
        function constructClassInstance(ctor, props, maskedLegacyContext) {
          var context = emptyContextObject;
          var contextType = ctor.contextType;
          {
            if ("contextType" in ctor) {
              var isValid = (
                // Allow null for conditional declaration
                contextType === null || contextType !== void 0 && contextType.$$typeof === REACT_CONTEXT_TYPE && contextType._context === void 0
              );
              if (!isValid && !didWarnAboutInvalidateContextType.has(ctor)) {
                didWarnAboutInvalidateContextType.add(ctor);
                var addendum = "";
                if (contextType === void 0) {
                  addendum = " However, it is set to undefined. This can be caused by a typo or by mixing up named and default imports. This can also happen due to a circular dependency, so try moving the createContext() call to a separate file.";
                } else if (typeof contextType !== "object") {
                  addendum = " However, it is set to a " + typeof contextType + ".";
                } else if (contextType.$$typeof === REACT_PROVIDER_TYPE) {
                  addendum = " Did you accidentally pass the Context.Provider instead?";
                } else if (contextType._context !== void 0) {
                  addendum = " Did you accidentally pass the Context.Consumer instead?";
                } else {
                  addendum = " However, it is set to an object with keys {" + Object.keys(contextType).join(", ") + "}.";
                }
                error("%s defines an invalid contextType. contextType should point to the Context object returned by React.createContext().%s", getComponentNameFromType(ctor) || "Component", addendum);
              }
            }
          }
          if (typeof contextType === "object" && contextType !== null) {
            context = readContext(contextType);
          } else {
            context = maskedLegacyContext;
          }
          var instance = new ctor(props, context);
          {
            if (typeof ctor.getDerivedStateFromProps === "function" && (instance.state === null || instance.state === void 0)) {
              var componentName = getComponentNameFromType(ctor) || "Component";
              if (!didWarnAboutUninitializedState.has(componentName)) {
                didWarnAboutUninitializedState.add(componentName);
                error("`%s` uses `getDerivedStateFromProps` but its initial state is %s. This is not recommended. Instead, define the initial state by assigning an object to `this.state` in the constructor of `%s`. This ensures that `getDerivedStateFromProps` arguments have a consistent shape.", componentName, instance.state === null ? "null" : "undefined", componentName);
              }
            }
            if (typeof ctor.getDerivedStateFromProps === "function" || typeof instance.getSnapshotBeforeUpdate === "function") {
              var foundWillMountName = null;
              var foundWillReceivePropsName = null;
              var foundWillUpdateName = null;
              if (typeof instance.componentWillMount === "function" && instance.componentWillMount.__suppressDeprecationWarning !== true) {
                foundWillMountName = "componentWillMount";
              } else if (typeof instance.UNSAFE_componentWillMount === "function") {
                foundWillMountName = "UNSAFE_componentWillMount";
              }
              if (typeof instance.componentWillReceiveProps === "function" && instance.componentWillReceiveProps.__suppressDeprecationWarning !== true) {
                foundWillReceivePropsName = "componentWillReceiveProps";
              } else if (typeof instance.UNSAFE_componentWillReceiveProps === "function") {
                foundWillReceivePropsName = "UNSAFE_componentWillReceiveProps";
              }
              if (typeof instance.componentWillUpdate === "function" && instance.componentWillUpdate.__suppressDeprecationWarning !== true) {
                foundWillUpdateName = "componentWillUpdate";
              } else if (typeof instance.UNSAFE_componentWillUpdate === "function") {
                foundWillUpdateName = "UNSAFE_componentWillUpdate";
              }
              if (foundWillMountName !== null || foundWillReceivePropsName !== null || foundWillUpdateName !== null) {
                var _componentName = getComponentNameFromType(ctor) || "Component";
                var newApiName = typeof ctor.getDerivedStateFromProps === "function" ? "getDerivedStateFromProps()" : "getSnapshotBeforeUpdate()";
                if (!didWarnAboutLegacyLifecyclesAndDerivedState.has(_componentName)) {
                  didWarnAboutLegacyLifecyclesAndDerivedState.add(_componentName);
                  error("Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n%s uses %s but also contains the following legacy lifecycles:%s%s%s\n\nThe above lifecycles should be removed. Learn more about this warning here:\nhttps://reactjs.org/link/unsafe-component-lifecycles", _componentName, newApiName, foundWillMountName !== null ? "\n  " + foundWillMountName : "", foundWillReceivePropsName !== null ? "\n  " + foundWillReceivePropsName : "", foundWillUpdateName !== null ? "\n  " + foundWillUpdateName : "");
                }
              }
            }
          }
          return instance;
        }
        function checkClassInstance(instance, ctor, newProps) {
          {
            var name = getComponentNameFromType(ctor) || "Component";
            var renderPresent = instance.render;
            if (!renderPresent) {
              if (ctor.prototype && typeof ctor.prototype.render === "function") {
                error("%s(...): No `render` method found on the returned component instance: did you accidentally return an object from the constructor?", name);
              } else {
                error("%s(...): No `render` method found on the returned component instance: you may have forgotten to define `render`.", name);
              }
            }
            if (instance.getInitialState && !instance.getInitialState.isReactClassApproved && !instance.state) {
              error("getInitialState was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Did you mean to define a state property instead?", name);
            }
            if (instance.getDefaultProps && !instance.getDefaultProps.isReactClassApproved) {
              error("getDefaultProps was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Use a static property to define defaultProps instead.", name);
            }
            if (instance.propTypes) {
              error("propTypes was defined as an instance property on %s. Use a static property to define propTypes instead.", name);
            }
            if (instance.contextType) {
              error("contextType was defined as an instance property on %s. Use a static property to define contextType instead.", name);
            }
            {
              if (instance.contextTypes) {
                error("contextTypes was defined as an instance property on %s. Use a static property to define contextTypes instead.", name);
              }
              if (ctor.contextType && ctor.contextTypes && !didWarnAboutContextTypeAndContextTypes.has(ctor)) {
                didWarnAboutContextTypeAndContextTypes.add(ctor);
                error("%s declares both contextTypes and contextType static properties. The legacy contextTypes property will be ignored.", name);
              }
            }
            if (typeof instance.componentShouldUpdate === "function") {
              error("%s has a method called componentShouldUpdate(). Did you mean shouldComponentUpdate()? The name is phrased as a question because the function is expected to return a value.", name);
            }
            if (ctor.prototype && ctor.prototype.isPureReactComponent && typeof instance.shouldComponentUpdate !== "undefined") {
              error("%s has a method called shouldComponentUpdate(). shouldComponentUpdate should not be used when extending React.PureComponent. Please extend React.Component if shouldComponentUpdate is used.", getComponentNameFromType(ctor) || "A pure component");
            }
            if (typeof instance.componentDidUnmount === "function") {
              error("%s has a method called componentDidUnmount(). But there is no such lifecycle method. Did you mean componentWillUnmount()?", name);
            }
            if (typeof instance.componentDidReceiveProps === "function") {
              error("%s has a method called componentDidReceiveProps(). But there is no such lifecycle method. If you meant to update the state in response to changing props, use componentWillReceiveProps(). If you meant to fetch data or run side-effects or mutations after React has updated the UI, use componentDidUpdate().", name);
            }
            if (typeof instance.componentWillRecieveProps === "function") {
              error("%s has a method called componentWillRecieveProps(). Did you mean componentWillReceiveProps()?", name);
            }
            if (typeof instance.UNSAFE_componentWillRecieveProps === "function") {
              error("%s has a method called UNSAFE_componentWillRecieveProps(). Did you mean UNSAFE_componentWillReceiveProps()?", name);
            }
            var hasMutatedProps = instance.props !== newProps;
            if (instance.props !== void 0 && hasMutatedProps) {
              error("%s(...): When calling super() in `%s`, make sure to pass up the same props that your component's constructor was passed.", name, name);
            }
            if (instance.defaultProps) {
              error("Setting defaultProps as an instance property on %s is not supported and will be ignored. Instead, define defaultProps as a static property on %s.", name, name);
            }
            if (typeof instance.getSnapshotBeforeUpdate === "function" && typeof instance.componentDidUpdate !== "function" && !didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.has(ctor)) {
              didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.add(ctor);
              error("%s: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). This component defines getSnapshotBeforeUpdate() only.", getComponentNameFromType(ctor));
            }
            if (typeof instance.getDerivedStateFromProps === "function") {
              error("%s: getDerivedStateFromProps() is defined as an instance method and will be ignored. Instead, declare it as a static method.", name);
            }
            if (typeof instance.getDerivedStateFromError === "function") {
              error("%s: getDerivedStateFromError() is defined as an instance method and will be ignored. Instead, declare it as a static method.", name);
            }
            if (typeof ctor.getSnapshotBeforeUpdate === "function") {
              error("%s: getSnapshotBeforeUpdate() is defined as a static method and will be ignored. Instead, declare it as an instance method.", name);
            }
            var _state = instance.state;
            if (_state && (typeof _state !== "object" || isArray(_state))) {
              error("%s.state: must be set to an object or null", name);
            }
            if (typeof instance.getChildContext === "function" && typeof ctor.childContextTypes !== "object") {
              error("%s.getChildContext(): childContextTypes must be defined in order to use getChildContext().", name);
            }
          }
        }
        function callComponentWillMount(type, instance) {
          var oldState = instance.state;
          if (typeof instance.componentWillMount === "function") {
            {
              if (instance.componentWillMount.__suppressDeprecationWarning !== true) {
                var componentName = getComponentNameFromType(type) || "Unknown";
                if (!didWarnAboutDeprecatedWillMount[componentName]) {
                  warn(
                    // keep this warning in sync with ReactStrictModeWarning.js
                    "componentWillMount has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.\n\n* Move code from componentWillMount to componentDidMount (preferred in most cases) or the constructor.\n\nPlease update the following components: %s",
                    componentName
                  );
                  didWarnAboutDeprecatedWillMount[componentName] = true;
                }
              }
            }
            instance.componentWillMount();
          }
          if (typeof instance.UNSAFE_componentWillMount === "function") {
            instance.UNSAFE_componentWillMount();
          }
          if (oldState !== instance.state) {
            {
              error("%s.componentWillMount(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.", getComponentNameFromType(type) || "Component");
            }
            classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
          }
        }
        function processUpdateQueue(internalInstance, inst, props, maskedLegacyContext) {
          if (internalInstance.queue !== null && internalInstance.queue.length > 0) {
            var oldQueue = internalInstance.queue;
            var oldReplace = internalInstance.replace;
            internalInstance.queue = null;
            internalInstance.replace = false;
            if (oldReplace && oldQueue.length === 1) {
              inst.state = oldQueue[0];
            } else {
              var nextState = oldReplace ? oldQueue[0] : inst.state;
              var dontMutate = true;
              for (var i = oldReplace ? 1 : 0; i < oldQueue.length; i++) {
                var partial = oldQueue[i];
                var partialState = typeof partial === "function" ? partial.call(inst, nextState, props, maskedLegacyContext) : partial;
                if (partialState != null) {
                  if (dontMutate) {
                    dontMutate = false;
                    nextState = assign({}, nextState, partialState);
                  } else {
                    assign(nextState, partialState);
                  }
                }
              }
              inst.state = nextState;
            }
          } else {
            internalInstance.queue = null;
          }
        }
        function mountClassInstance(instance, ctor, newProps, maskedLegacyContext) {
          {
            checkClassInstance(instance, ctor, newProps);
          }
          var initialState = instance.state !== void 0 ? instance.state : null;
          instance.updater = classComponentUpdater;
          instance.props = newProps;
          instance.state = initialState;
          var internalInstance = {
            queue: [],
            replace: false
          };
          set(instance, internalInstance);
          var contextType = ctor.contextType;
          if (typeof contextType === "object" && contextType !== null) {
            instance.context = readContext(contextType);
          } else {
            instance.context = maskedLegacyContext;
          }
          {
            if (instance.state === newProps) {
              var componentName = getComponentNameFromType(ctor) || "Component";
              if (!didWarnAboutDirectlyAssigningPropsToState.has(componentName)) {
                didWarnAboutDirectlyAssigningPropsToState.add(componentName);
                error("%s: It is not recommended to assign props directly to state because updates to props won't be reflected in state. In most cases, it is better to use props directly.", componentName);
              }
            }
          }
          var getDerivedStateFromProps = ctor.getDerivedStateFromProps;
          if (typeof getDerivedStateFromProps === "function") {
            instance.state = applyDerivedStateFromProps(instance, ctor, getDerivedStateFromProps, initialState, newProps);
          }
          if (typeof ctor.getDerivedStateFromProps !== "function" && typeof instance.getSnapshotBeforeUpdate !== "function" && (typeof instance.UNSAFE_componentWillMount === "function" || typeof instance.componentWillMount === "function")) {
            callComponentWillMount(ctor, instance);
            processUpdateQueue(internalInstance, instance, newProps, maskedLegacyContext);
          }
        }
        var emptyTreeContext = {
          id: 1,
          overflow: ""
        };
        function getTreeId(context) {
          var overflow = context.overflow;
          var idWithLeadingBit = context.id;
          var id = idWithLeadingBit & ~getLeadingBit(idWithLeadingBit);
          return id.toString(32) + overflow;
        }
        function pushTreeContext(baseContext, totalChildren, index) {
          var baseIdWithLeadingBit = baseContext.id;
          var baseOverflow = baseContext.overflow;
          var baseLength = getBitLength(baseIdWithLeadingBit) - 1;
          var baseId = baseIdWithLeadingBit & ~(1 << baseLength);
          var slot = index + 1;
          var length = getBitLength(totalChildren) + baseLength;
          if (length > 30) {
            var numberOfOverflowBits = baseLength - baseLength % 5;
            var newOverflowBits = (1 << numberOfOverflowBits) - 1;
            var newOverflow = (baseId & newOverflowBits).toString(32);
            var restOfBaseId = baseId >> numberOfOverflowBits;
            var restOfBaseLength = baseLength - numberOfOverflowBits;
            var restOfLength = getBitLength(totalChildren) + restOfBaseLength;
            var restOfNewBits = slot << restOfBaseLength;
            var id = restOfNewBits | restOfBaseId;
            var overflow = newOverflow + baseOverflow;
            return {
              id: 1 << restOfLength | id,
              overflow
            };
          } else {
            var newBits = slot << baseLength;
            var _id = newBits | baseId;
            var _overflow = baseOverflow;
            return {
              id: 1 << length | _id,
              overflow: _overflow
            };
          }
        }
        function getBitLength(number) {
          return 32 - clz32(number);
        }
        function getLeadingBit(id) {
          return 1 << getBitLength(id) - 1;
        }
        var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback;
        var log = Math.log;
        var LN2 = Math.LN2;
        function clz32Fallback(x) {
          var asUint = x >>> 0;
          if (asUint === 0) {
            return 32;
          }
          return 31 - (log(asUint) / LN2 | 0) | 0;
        }
        function is(x, y) {
          return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y;
        }
        var objectIs = typeof Object.is === "function" ? Object.is : is;
        var currentlyRenderingComponent = null;
        var currentlyRenderingTask = null;
        var firstWorkInProgressHook = null;
        var workInProgressHook = null;
        var isReRender = false;
        var didScheduleRenderPhaseUpdate = false;
        var localIdCounter = 0;
        var renderPhaseUpdates = null;
        var numberOfReRenders = 0;
        var RE_RENDER_LIMIT = 25;
        var isInHookUserCodeInDev = false;
        var currentHookNameInDev;
        function resolveCurrentlyRenderingComponent() {
          if (currentlyRenderingComponent === null) {
            throw new Error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
          }
          {
            if (isInHookUserCodeInDev) {
              error("Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. You can only call Hooks at the top level of your React function. For more information, see https://reactjs.org/link/rules-of-hooks");
            }
          }
          return currentlyRenderingComponent;
        }
        function areHookInputsEqual(nextDeps, prevDeps) {
          if (prevDeps === null) {
            {
              error("%s received a final argument during this render, but not during the previous render. Even though the final argument is optional, its type cannot change between renders.", currentHookNameInDev);
            }
            return false;
          }
          {
            if (nextDeps.length !== prevDeps.length) {
              error("The final argument passed to %s changed size between renders. The order and size of this array must remain constant.\n\nPrevious: %s\nIncoming: %s", currentHookNameInDev, "[" + nextDeps.join(", ") + "]", "[" + prevDeps.join(", ") + "]");
            }
          }
          for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
            if (objectIs(nextDeps[i], prevDeps[i])) {
              continue;
            }
            return false;
          }
          return true;
        }
        function createHook() {
          if (numberOfReRenders > 0) {
            throw new Error("Rendered more hooks than during the previous render");
          }
          return {
            memoizedState: null,
            queue: null,
            next: null
          };
        }
        function createWorkInProgressHook() {
          if (workInProgressHook === null) {
            if (firstWorkInProgressHook === null) {
              isReRender = false;
              firstWorkInProgressHook = workInProgressHook = createHook();
            } else {
              isReRender = true;
              workInProgressHook = firstWorkInProgressHook;
            }
          } else {
            if (workInProgressHook.next === null) {
              isReRender = false;
              workInProgressHook = workInProgressHook.next = createHook();
            } else {
              isReRender = true;
              workInProgressHook = workInProgressHook.next;
            }
          }
          return workInProgressHook;
        }
        function prepareToUseHooks(task, componentIdentity) {
          currentlyRenderingComponent = componentIdentity;
          currentlyRenderingTask = task;
          {
            isInHookUserCodeInDev = false;
          }
          localIdCounter = 0;
        }
        function finishHooks(Component, props, children, refOrContext) {
          while (didScheduleRenderPhaseUpdate) {
            didScheduleRenderPhaseUpdate = false;
            localIdCounter = 0;
            numberOfReRenders += 1;
            workInProgressHook = null;
            children = Component(props, refOrContext);
          }
          resetHooksState();
          return children;
        }
        function checkDidRenderIdHook() {
          var didRenderIdHook = localIdCounter !== 0;
          return didRenderIdHook;
        }
        function resetHooksState() {
          {
            isInHookUserCodeInDev = false;
          }
          currentlyRenderingComponent = null;
          currentlyRenderingTask = null;
          didScheduleRenderPhaseUpdate = false;
          firstWorkInProgressHook = null;
          numberOfReRenders = 0;
          renderPhaseUpdates = null;
          workInProgressHook = null;
        }
        function readContext$1(context) {
          {
            if (isInHookUserCodeInDev) {
              error("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
            }
          }
          return readContext(context);
        }
        function useContext(context) {
          {
            currentHookNameInDev = "useContext";
          }
          resolveCurrentlyRenderingComponent();
          return readContext(context);
        }
        function basicStateReducer(state, action) {
          return typeof action === "function" ? action(state) : action;
        }
        function useState(initialState) {
          {
            currentHookNameInDev = "useState";
          }
          return useReducer(
            basicStateReducer,
            // useReducer has a special case to support lazy useState initializers
            initialState
          );
        }
        function useReducer(reducer, initialArg, init) {
          {
            if (reducer !== basicStateReducer) {
              currentHookNameInDev = "useReducer";
            }
          }
          currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
          workInProgressHook = createWorkInProgressHook();
          if (isReRender) {
            var queue = workInProgressHook.queue;
            var dispatch = queue.dispatch;
            if (renderPhaseUpdates !== null) {
              var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
              if (firstRenderPhaseUpdate !== void 0) {
                renderPhaseUpdates.delete(queue);
                var newState = workInProgressHook.memoizedState;
                var update = firstRenderPhaseUpdate;
                do {
                  var action = update.action;
                  {
                    isInHookUserCodeInDev = true;
                  }
                  newState = reducer(newState, action);
                  {
                    isInHookUserCodeInDev = false;
                  }
                  update = update.next;
                } while (update !== null);
                workInProgressHook.memoizedState = newState;
                return [newState, dispatch];
              }
            }
            return [workInProgressHook.memoizedState, dispatch];
          } else {
            {
              isInHookUserCodeInDev = true;
            }
            var initialState;
            if (reducer === basicStateReducer) {
              initialState = typeof initialArg === "function" ? initialArg() : initialArg;
            } else {
              initialState = init !== void 0 ? init(initialArg) : initialArg;
            }
            {
              isInHookUserCodeInDev = false;
            }
            workInProgressHook.memoizedState = initialState;
            var _queue = workInProgressHook.queue = {
              last: null,
              dispatch: null
            };
            var _dispatch = _queue.dispatch = dispatchAction.bind(null, currentlyRenderingComponent, _queue);
            return [workInProgressHook.memoizedState, _dispatch];
          }
        }
        function useMemo(nextCreate, deps) {
          currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
          workInProgressHook = createWorkInProgressHook();
          var nextDeps = deps === void 0 ? null : deps;
          if (workInProgressHook !== null) {
            var prevState = workInProgressHook.memoizedState;
            if (prevState !== null) {
              if (nextDeps !== null) {
                var prevDeps = prevState[1];
                if (areHookInputsEqual(nextDeps, prevDeps)) {
                  return prevState[0];
                }
              }
            }
          }
          {
            isInHookUserCodeInDev = true;
          }
          var nextValue = nextCreate();
          {
            isInHookUserCodeInDev = false;
          }
          workInProgressHook.memoizedState = [nextValue, nextDeps];
          return nextValue;
        }
        function useRef(initialValue) {
          currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
          workInProgressHook = createWorkInProgressHook();
          var previousRef = workInProgressHook.memoizedState;
          if (previousRef === null) {
            var ref = {
              current: initialValue
            };
            {
              Object.seal(ref);
            }
            workInProgressHook.memoizedState = ref;
            return ref;
          } else {
            return previousRef;
          }
        }
        function useLayoutEffect(create, inputs) {
          {
            currentHookNameInDev = "useLayoutEffect";
            error("useLayoutEffect does nothing on the server, because its effect cannot be encoded into the server renderer's output format. This will lead to a mismatch between the initial, non-hydrated UI and the intended UI. To avoid this, useLayoutEffect should only be used in components that render exclusively on the client. See https://reactjs.org/link/uselayouteffect-ssr for common fixes.");
          }
        }
        function dispatchAction(componentIdentity, queue, action) {
          if (numberOfReRenders >= RE_RENDER_LIMIT) {
            throw new Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
          }
          if (componentIdentity === currentlyRenderingComponent) {
            didScheduleRenderPhaseUpdate = true;
            var update = {
              action,
              next: null
            };
            if (renderPhaseUpdates === null) {
              renderPhaseUpdates = /* @__PURE__ */ new Map();
            }
            var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
            if (firstRenderPhaseUpdate === void 0) {
              renderPhaseUpdates.set(queue, update);
            } else {
              var lastRenderPhaseUpdate = firstRenderPhaseUpdate;
              while (lastRenderPhaseUpdate.next !== null) {
                lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
              }
              lastRenderPhaseUpdate.next = update;
            }
          }
        }
        function useCallback(callback, deps) {
          return useMemo(function() {
            return callback;
          }, deps);
        }
        function useMutableSource(source, getSnapshot, subscribe) {
          resolveCurrentlyRenderingComponent();
          return getSnapshot(source._source);
        }
        function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
          if (getServerSnapshot === void 0) {
            throw new Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
          }
          return getServerSnapshot();
        }
        function useDeferredValue(value) {
          resolveCurrentlyRenderingComponent();
          return value;
        }
        function unsupportedStartTransition() {
          throw new Error("startTransition cannot be called during server rendering.");
        }
        function useTransition() {
          resolveCurrentlyRenderingComponent();
          return [false, unsupportedStartTransition];
        }
        function useId() {
          var task = currentlyRenderingTask;
          var treeId = getTreeId(task.treeContext);
          var responseState = currentResponseState;
          if (responseState === null) {
            throw new Error("Invalid hook call. Hooks can only be called inside of the body of a function component.");
          }
          var localId = localIdCounter++;
          return makeId(responseState, treeId, localId);
        }
        function noop() {
        }
        var Dispatcher = {
          readContext: readContext$1,
          useContext,
          useMemo,
          useReducer,
          useRef,
          useState,
          useInsertionEffect: noop,
          useLayoutEffect,
          useCallback,
          // useImperativeHandle is not run in the server environment
          useImperativeHandle: noop,
          // Effects are not run in the server environment.
          useEffect: noop,
          // Debugging effect
          useDebugValue: noop,
          useDeferredValue,
          useTransition,
          useId,
          // Subscriptions are not setup in a server environment.
          useMutableSource,
          useSyncExternalStore
        };
        var currentResponseState = null;
        function setCurrentResponseState(responseState) {
          currentResponseState = responseState;
        }
        function getStackByComponentStackNode(componentStack) {
          try {
            var info = "";
            var node = componentStack;
            do {
              switch (node.tag) {
                case 0:
                  info += describeBuiltInComponentFrame(node.type, null, null);
                  break;
                case 1:
                  info += describeFunctionComponentFrame(node.type, null, null);
                  break;
                case 2:
                  info += describeClassComponentFrame(node.type, null, null);
                  break;
              }
              node = node.parent;
            } while (node);
            return info;
          } catch (x) {
            return "\nError generating stack: " + x.message + "\n" + x.stack;
          }
        }
        var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
        var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
        var PENDING = 0;
        var COMPLETED = 1;
        var FLUSHED = 2;
        var ABORTED = 3;
        var ERRORED = 4;
        var OPEN = 0;
        var CLOSING = 1;
        var CLOSED = 2;
        var DEFAULT_PROGRESSIVE_CHUNK_SIZE = 12800;
        function defaultErrorHandler(error2) {
          console["error"](error2);
          return null;
        }
        function noop$1() {
        }
        function createRequest(children, responseState, rootFormatContext, progressiveChunkSize, onError2, onAllReady, onShellReady, onShellError, onFatalError) {
          var pingedTasks = [];
          var abortSet = /* @__PURE__ */ new Set();
          var request = {
            destination: null,
            responseState,
            progressiveChunkSize: progressiveChunkSize === void 0 ? DEFAULT_PROGRESSIVE_CHUNK_SIZE : progressiveChunkSize,
            status: OPEN,
            fatalError: null,
            nextSegmentId: 0,
            allPendingTasks: 0,
            pendingRootTasks: 0,
            completedRootSegment: null,
            abortableTasks: abortSet,
            pingedTasks,
            clientRenderedBoundaries: [],
            completedBoundaries: [],
            partialBoundaries: [],
            onError: onError2 === void 0 ? defaultErrorHandler : onError2,
            onAllReady: onAllReady === void 0 ? noop$1 : onAllReady,
            onShellReady: onShellReady === void 0 ? noop$1 : onShellReady,
            onShellError: onShellError === void 0 ? noop$1 : onShellError,
            onFatalError: onFatalError === void 0 ? noop$1 : onFatalError
          };
          var rootSegment = createPendingSegment(
            request,
            0,
            null,
            rootFormatContext,
            // Root segments are never embedded in Text on either edge
            false,
            false
          );
          rootSegment.parentFlushed = true;
          var rootTask = createTask(request, children, null, rootSegment, abortSet, emptyContextObject, rootContextSnapshot, emptyTreeContext);
          pingedTasks.push(rootTask);
          return request;
        }
        function pingTask(request, task) {
          var pingedTasks = request.pingedTasks;
          pingedTasks.push(task);
          if (pingedTasks.length === 1) {
            scheduleWork(function() {
              return performWork(request);
            });
          }
        }
        function createSuspenseBoundary(request, fallbackAbortableTasks) {
          return {
            id: UNINITIALIZED_SUSPENSE_BOUNDARY_ID,
            rootSegmentID: -1,
            parentFlushed: false,
            pendingTasks: 0,
            forceClientRender: false,
            completedSegments: [],
            byteSize: 0,
            fallbackAbortableTasks,
            errorDigest: null
          };
        }
        function createTask(request, node, blockedBoundary, blockedSegment, abortSet, legacyContext, context, treeContext) {
          request.allPendingTasks++;
          if (blockedBoundary === null) {
            request.pendingRootTasks++;
          } else {
            blockedBoundary.pendingTasks++;
          }
          var task = {
            node,
            ping: function() {
              return pingTask(request, task);
            },
            blockedBoundary,
            blockedSegment,
            abortSet,
            legacyContext,
            context,
            treeContext
          };
          {
            task.componentStack = null;
          }
          abortSet.add(task);
          return task;
        }
        function createPendingSegment(request, index, boundary, formatContext, lastPushedText, textEmbedded) {
          return {
            status: PENDING,
            id: -1,
            // lazily assigned later
            index,
            parentFlushed: false,
            chunks: [],
            children: [],
            formatContext,
            boundary,
            lastPushedText,
            textEmbedded
          };
        }
        var currentTaskInDEV = null;
        function getCurrentStackInDEV() {
          {
            if (currentTaskInDEV === null || currentTaskInDEV.componentStack === null) {
              return "";
            }
            return getStackByComponentStackNode(currentTaskInDEV.componentStack);
          }
        }
        function pushBuiltInComponentStackInDEV(task, type) {
          {
            task.componentStack = {
              tag: 0,
              parent: task.componentStack,
              type
            };
          }
        }
        function pushFunctionComponentStackInDEV(task, type) {
          {
            task.componentStack = {
              tag: 1,
              parent: task.componentStack,
              type
            };
          }
        }
        function pushClassComponentStackInDEV(task, type) {
          {
            task.componentStack = {
              tag: 2,
              parent: task.componentStack,
              type
            };
          }
        }
        function popComponentStackInDEV(task) {
          {
            if (task.componentStack === null) {
              error("Unexpectedly popped too many stack frames. This is a bug in React.");
            } else {
              task.componentStack = task.componentStack.parent;
            }
          }
        }
        var lastBoundaryErrorComponentStackDev = null;
        function captureBoundaryErrorDetailsDev(boundary, error2) {
          {
            var errorMessage;
            if (typeof error2 === "string") {
              errorMessage = error2;
            } else if (error2 && typeof error2.message === "string") {
              errorMessage = error2.message;
            } else {
              errorMessage = String(error2);
            }
            var errorComponentStack = lastBoundaryErrorComponentStackDev || getCurrentStackInDEV();
            lastBoundaryErrorComponentStackDev = null;
            boundary.errorMessage = errorMessage;
            boundary.errorComponentStack = errorComponentStack;
          }
        }
        function logRecoverableError(request, error2) {
          var errorDigest = request.onError(error2);
          if (errorDigest != null && typeof errorDigest !== "string") {
            throw new Error('onError returned something with a type other than "string". onError should return a string and may return null or undefined but must not return anything else. It received something of type "' + typeof errorDigest + '" instead');
          }
          return errorDigest;
        }
        function fatalError(request, error2) {
          var onShellError = request.onShellError;
          onShellError(error2);
          var onFatalError = request.onFatalError;
          onFatalError(error2);
          if (request.destination !== null) {
            request.status = CLOSED;
            closeWithError(request.destination, error2);
          } else {
            request.status = CLOSING;
            request.fatalError = error2;
          }
        }
        function renderSuspenseBoundary(request, task, props) {
          pushBuiltInComponentStackInDEV(task, "Suspense");
          var parentBoundary = task.blockedBoundary;
          var parentSegment = task.blockedSegment;
          var fallback = props.fallback;
          var content = props.children;
          var fallbackAbortSet = /* @__PURE__ */ new Set();
          var newBoundary = createSuspenseBoundary(request, fallbackAbortSet);
          var insertionIndex = parentSegment.chunks.length;
          var boundarySegment = createPendingSegment(
            request,
            insertionIndex,
            newBoundary,
            parentSegment.formatContext,
            // boundaries never require text embedding at their edges because comment nodes bound them
            false,
            false
          );
          parentSegment.children.push(boundarySegment);
          parentSegment.lastPushedText = false;
          var contentRootSegment = createPendingSegment(
            request,
            0,
            null,
            parentSegment.formatContext,
            // boundaries never require text embedding at their edges because comment nodes bound them
            false,
            false
          );
          contentRootSegment.parentFlushed = true;
          task.blockedBoundary = newBoundary;
          task.blockedSegment = contentRootSegment;
          try {
            renderNode(request, task, content);
            pushSegmentFinale$1(contentRootSegment.chunks, request.responseState, contentRootSegment.lastPushedText, contentRootSegment.textEmbedded);
            contentRootSegment.status = COMPLETED;
            queueCompletedSegment(newBoundary, contentRootSegment);
            if (newBoundary.pendingTasks === 0) {
              popComponentStackInDEV(task);
              return;
            }
          } catch (error2) {
            contentRootSegment.status = ERRORED;
            newBoundary.forceClientRender = true;
            newBoundary.errorDigest = logRecoverableError(request, error2);
            {
              captureBoundaryErrorDetailsDev(newBoundary, error2);
            }
          } finally {
            task.blockedBoundary = parentBoundary;
            task.blockedSegment = parentSegment;
          }
          var suspendedFallbackTask = createTask(request, fallback, parentBoundary, boundarySegment, fallbackAbortSet, task.legacyContext, task.context, task.treeContext);
          {
            suspendedFallbackTask.componentStack = task.componentStack;
          }
          request.pingedTasks.push(suspendedFallbackTask);
          popComponentStackInDEV(task);
        }
        function renderHostElement(request, task, type, props) {
          pushBuiltInComponentStackInDEV(task, type);
          var segment = task.blockedSegment;
          var children = pushStartInstance(segment.chunks, type, props, request.responseState, segment.formatContext);
          segment.lastPushedText = false;
          var prevContext = segment.formatContext;
          segment.formatContext = getChildFormatContext(prevContext, type, props);
          renderNode(request, task, children);
          segment.formatContext = prevContext;
          pushEndInstance(segment.chunks, type);
          segment.lastPushedText = false;
          popComponentStackInDEV(task);
        }
        function shouldConstruct$1(Component) {
          return Component.prototype && Component.prototype.isReactComponent;
        }
        function renderWithHooks(request, task, Component, props, secondArg) {
          var componentIdentity = {};
          prepareToUseHooks(task, componentIdentity);
          var result = Component(props, secondArg);
          return finishHooks(Component, props, result, secondArg);
        }
        function finishClassComponent(request, task, instance, Component, props) {
          var nextChildren = instance.render();
          {
            if (instance.props !== props) {
              if (!didWarnAboutReassigningProps) {
                error("It looks like %s is reassigning its own `this.props` while rendering. This is not supported and can lead to confusing bugs.", getComponentNameFromType(Component) || "a component");
              }
              didWarnAboutReassigningProps = true;
            }
          }
          {
            var childContextTypes = Component.childContextTypes;
            if (childContextTypes !== null && childContextTypes !== void 0) {
              var previousContext = task.legacyContext;
              var mergedContext = processChildContext(instance, Component, previousContext, childContextTypes);
              task.legacyContext = mergedContext;
              renderNodeDestructive(request, task, nextChildren);
              task.legacyContext = previousContext;
              return;
            }
          }
          renderNodeDestructive(request, task, nextChildren);
        }
        function renderClassComponent(request, task, Component, props) {
          pushClassComponentStackInDEV(task, Component);
          var maskedContext = getMaskedContext(Component, task.legacyContext);
          var instance = constructClassInstance(Component, props, maskedContext);
          mountClassInstance(instance, Component, props, maskedContext);
          finishClassComponent(request, task, instance, Component, props);
          popComponentStackInDEV(task);
        }
        var didWarnAboutBadClass = {};
        var didWarnAboutModulePatternComponent = {};
        var didWarnAboutContextTypeOnFunctionComponent = {};
        var didWarnAboutGetDerivedStateOnFunctionComponent = {};
        var didWarnAboutReassigningProps = false;
        var didWarnAboutDefaultPropsOnFunctionComponent = {};
        var didWarnAboutGenerators = false;
        var didWarnAboutMaps = false;
        var hasWarnedAboutUsingContextAsConsumer = false;
        function renderIndeterminateComponent(request, task, Component, props) {
          var legacyContext;
          {
            legacyContext = getMaskedContext(Component, task.legacyContext);
          }
          pushFunctionComponentStackInDEV(task, Component);
          {
            if (Component.prototype && typeof Component.prototype.render === "function") {
              var componentName = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutBadClass[componentName]) {
                error("The <%s /> component appears to have a render method, but doesn't extend React.Component. This is likely to cause errors. Change %s to extend React.Component instead.", componentName, componentName);
                didWarnAboutBadClass[componentName] = true;
              }
            }
          }
          var value = renderWithHooks(request, task, Component, props, legacyContext);
          var hasId = checkDidRenderIdHook();
          {
            if (typeof value === "object" && value !== null && typeof value.render === "function" && value.$$typeof === void 0) {
              var _componentName = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutModulePatternComponent[_componentName]) {
                error("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", _componentName, _componentName, _componentName);
                didWarnAboutModulePatternComponent[_componentName] = true;
              }
            }
          }
          if (
            // Run these checks in production only if the flag is off.
            // Eventually we'll delete this branch altogether.
            typeof value === "object" && value !== null && typeof value.render === "function" && value.$$typeof === void 0
          ) {
            {
              var _componentName2 = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutModulePatternComponent[_componentName2]) {
                error("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", _componentName2, _componentName2, _componentName2);
                didWarnAboutModulePatternComponent[_componentName2] = true;
              }
            }
            mountClassInstance(value, Component, props, legacyContext);
            finishClassComponent(request, task, value, Component, props);
          } else {
            {
              validateFunctionComponentInDev(Component);
            }
            if (hasId) {
              var prevTreeContext = task.treeContext;
              var totalChildren = 1;
              var index = 0;
              task.treeContext = pushTreeContext(prevTreeContext, totalChildren, index);
              try {
                renderNodeDestructive(request, task, value);
              } finally {
                task.treeContext = prevTreeContext;
              }
            } else {
              renderNodeDestructive(request, task, value);
            }
          }
          popComponentStackInDEV(task);
        }
        function validateFunctionComponentInDev(Component) {
          {
            if (Component) {
              if (Component.childContextTypes) {
                error("%s(...): childContextTypes cannot be defined on a function component.", Component.displayName || Component.name || "Component");
              }
            }
            if (Component.defaultProps !== void 0) {
              var componentName = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutDefaultPropsOnFunctionComponent[componentName]) {
                error("%s: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.", componentName);
                didWarnAboutDefaultPropsOnFunctionComponent[componentName] = true;
              }
            }
            if (typeof Component.getDerivedStateFromProps === "function") {
              var _componentName3 = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutGetDerivedStateOnFunctionComponent[_componentName3]) {
                error("%s: Function components do not support getDerivedStateFromProps.", _componentName3);
                didWarnAboutGetDerivedStateOnFunctionComponent[_componentName3] = true;
              }
            }
            if (typeof Component.contextType === "object" && Component.contextType !== null) {
              var _componentName4 = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutContextTypeOnFunctionComponent[_componentName4]) {
                error("%s: Function components do not support contextType.", _componentName4);
                didWarnAboutContextTypeOnFunctionComponent[_componentName4] = true;
              }
            }
          }
        }
        function resolveDefaultProps(Component, baseProps) {
          if (Component && Component.defaultProps) {
            var props = assign({}, baseProps);
            var defaultProps = Component.defaultProps;
            for (var propName in defaultProps) {
              if (props[propName] === void 0) {
                props[propName] = defaultProps[propName];
              }
            }
            return props;
          }
          return baseProps;
        }
        function renderForwardRef(request, task, type, props, ref) {
          pushFunctionComponentStackInDEV(task, type.render);
          var children = renderWithHooks(request, task, type.render, props, ref);
          var hasId = checkDidRenderIdHook();
          if (hasId) {
            var prevTreeContext = task.treeContext;
            var totalChildren = 1;
            var index = 0;
            task.treeContext = pushTreeContext(prevTreeContext, totalChildren, index);
            try {
              renderNodeDestructive(request, task, children);
            } finally {
              task.treeContext = prevTreeContext;
            }
          } else {
            renderNodeDestructive(request, task, children);
          }
          popComponentStackInDEV(task);
        }
        function renderMemo(request, task, type, props, ref) {
          var innerType = type.type;
          var resolvedProps = resolveDefaultProps(innerType, props);
          renderElement(request, task, innerType, resolvedProps, ref);
        }
        function renderContextConsumer(request, task, context, props) {
          {
            if (context._context === void 0) {
              if (context !== context.Consumer) {
                if (!hasWarnedAboutUsingContextAsConsumer) {
                  hasWarnedAboutUsingContextAsConsumer = true;
                  error("Rendering <Context> directly is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?");
                }
              }
            } else {
              context = context._context;
            }
          }
          var render = props.children;
          {
            if (typeof render !== "function") {
              error("A context consumer was rendered with multiple children, or a child that isn't a function. A context consumer expects a single child that is a function. If you did pass a function, make sure there is no trailing or leading whitespace around it.");
            }
          }
          var newValue = readContext(context);
          var newChildren = render(newValue);
          renderNodeDestructive(request, task, newChildren);
        }
        function renderContextProvider(request, task, type, props) {
          var context = type._context;
          var value = props.value;
          var children = props.children;
          var prevSnapshot;
          {
            prevSnapshot = task.context;
          }
          task.context = pushProvider(context, value);
          renderNodeDestructive(request, task, children);
          task.context = popProvider(context);
          {
            if (prevSnapshot !== task.context) {
              error("Popping the context provider did not return back to the original snapshot. This is a bug in React.");
            }
          }
        }
        function renderLazyComponent(request, task, lazyComponent, props, ref) {
          pushBuiltInComponentStackInDEV(task, "Lazy");
          var payload = lazyComponent._payload;
          var init = lazyComponent._init;
          var Component = init(payload);
          var resolvedProps = resolveDefaultProps(Component, props);
          renderElement(request, task, Component, resolvedProps, ref);
          popComponentStackInDEV(task);
        }
        function renderElement(request, task, type, props, ref) {
          if (typeof type === "function") {
            if (shouldConstruct$1(type)) {
              renderClassComponent(request, task, type, props);
              return;
            } else {
              renderIndeterminateComponent(request, task, type, props);
              return;
            }
          }
          if (typeof type === "string") {
            renderHostElement(request, task, type, props);
            return;
          }
          switch (type) {
            // TODO: LegacyHidden acts the same as a fragment. This only works
            // because we currently assume that every instance of LegacyHidden is
            // accompanied by a host component wrapper. In the hidden mode, the host
            // component is given a `hidden` attribute, which ensures that the
            // initial HTML is not visible. To support the use of LegacyHidden as a
            // true fragment, without an extra DOM node, we would have to hide the
            // initial HTML in some other way.
            // TODO: Add REACT_OFFSCREEN_TYPE here too with the same capability.
            case REACT_LEGACY_HIDDEN_TYPE:
            case REACT_DEBUG_TRACING_MODE_TYPE:
            case REACT_STRICT_MODE_TYPE:
            case REACT_PROFILER_TYPE:
            case REACT_FRAGMENT_TYPE: {
              renderNodeDestructive(request, task, props.children);
              return;
            }
            case REACT_SUSPENSE_LIST_TYPE: {
              pushBuiltInComponentStackInDEV(task, "SuspenseList");
              renderNodeDestructive(request, task, props.children);
              popComponentStackInDEV(task);
              return;
            }
            case REACT_SCOPE_TYPE: {
              throw new Error("ReactDOMServer does not yet support scope components.");
            }
            // eslint-disable-next-line-no-fallthrough
            case REACT_SUSPENSE_TYPE: {
              {
                renderSuspenseBoundary(request, task, props);
              }
              return;
            }
          }
          if (typeof type === "object" && type !== null) {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE: {
                renderForwardRef(request, task, type, props, ref);
                return;
              }
              case REACT_MEMO_TYPE: {
                renderMemo(request, task, type, props, ref);
                return;
              }
              case REACT_PROVIDER_TYPE: {
                renderContextProvider(request, task, type, props);
                return;
              }
              case REACT_CONTEXT_TYPE: {
                renderContextConsumer(request, task, type, props);
                return;
              }
              case REACT_LAZY_TYPE: {
                renderLazyComponent(request, task, type, props);
                return;
              }
            }
          }
          var info = "";
          {
            if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
              info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
            }
          }
          throw new Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) " + ("but got: " + (type == null ? type : typeof type) + "." + info));
        }
        function validateIterable(iterable, iteratorFn) {
          {
            if (typeof Symbol === "function" && // $FlowFixMe Flow doesn't know about toStringTag
            iterable[Symbol.toStringTag] === "Generator") {
              if (!didWarnAboutGenerators) {
                error("Using Generators as children is unsupported and will likely yield unexpected results because enumerating a generator mutates it. You may convert it to an array with `Array.from()` or the `[...spread]` operator before rendering. Keep in mind you might need to polyfill these features for older browsers.");
              }
              didWarnAboutGenerators = true;
            }
            if (iterable.entries === iteratorFn) {
              if (!didWarnAboutMaps) {
                error("Using Maps as children is not supported. Use an array of keyed ReactElements instead.");
              }
              didWarnAboutMaps = true;
            }
          }
        }
        function renderNodeDestructive(request, task, node) {
          {
            try {
              return renderNodeDestructiveImpl(request, task, node);
            } catch (x) {
              if (typeof x === "object" && x !== null && typeof x.then === "function") ;
              else {
                lastBoundaryErrorComponentStackDev = lastBoundaryErrorComponentStackDev !== null ? lastBoundaryErrorComponentStackDev : getCurrentStackInDEV();
              }
              throw x;
            }
          }
        }
        function renderNodeDestructiveImpl(request, task, node) {
          task.node = node;
          if (typeof node === "object" && node !== null) {
            switch (node.$$typeof) {
              case REACT_ELEMENT_TYPE: {
                var element = node;
                var type = element.type;
                var props = element.props;
                var ref = element.ref;
                renderElement(request, task, type, props, ref);
                return;
              }
              case REACT_PORTAL_TYPE:
                throw new Error("Portals are not currently supported by the server renderer. Render them conditionally so that they only appear on the client render.");
              // eslint-disable-next-line-no-fallthrough
              case REACT_LAZY_TYPE: {
                var lazyNode = node;
                var payload = lazyNode._payload;
                var init = lazyNode._init;
                var resolvedNode;
                {
                  try {
                    resolvedNode = init(payload);
                  } catch (x) {
                    if (typeof x === "object" && x !== null && typeof x.then === "function") {
                      pushBuiltInComponentStackInDEV(task, "Lazy");
                    }
                    throw x;
                  }
                }
                renderNodeDestructive(request, task, resolvedNode);
                return;
              }
            }
            if (isArray(node)) {
              renderChildrenArray(request, task, node);
              return;
            }
            var iteratorFn = getIteratorFn(node);
            if (iteratorFn) {
              {
                validateIterable(node, iteratorFn);
              }
              var iterator = iteratorFn.call(node);
              if (iterator) {
                var step = iterator.next();
                if (!step.done) {
                  var children = [];
                  do {
                    children.push(step.value);
                    step = iterator.next();
                  } while (!step.done);
                  renderChildrenArray(request, task, children);
                  return;
                }
                return;
              }
            }
            var childString = Object.prototype.toString.call(node);
            throw new Error("Objects are not valid as a React child (found: " + (childString === "[object Object]" ? "object with keys {" + Object.keys(node).join(", ") + "}" : childString) + "). If you meant to render a collection of children, use an array instead.");
          }
          if (typeof node === "string") {
            var segment = task.blockedSegment;
            segment.lastPushedText = pushTextInstance$1(task.blockedSegment.chunks, node, request.responseState, segment.lastPushedText);
            return;
          }
          if (typeof node === "number") {
            var _segment = task.blockedSegment;
            _segment.lastPushedText = pushTextInstance$1(task.blockedSegment.chunks, "" + node, request.responseState, _segment.lastPushedText);
            return;
          }
          {
            if (typeof node === "function") {
              error("Functions are not valid as a React child. This may happen if you return a Component instead of <Component /> from render. Or maybe you meant to call this function rather than return it.");
            }
          }
        }
        function renderChildrenArray(request, task, children) {
          var totalChildren = children.length;
          for (var i = 0; i < totalChildren; i++) {
            var prevTreeContext = task.treeContext;
            task.treeContext = pushTreeContext(prevTreeContext, totalChildren, i);
            try {
              renderNode(request, task, children[i]);
            } finally {
              task.treeContext = prevTreeContext;
            }
          }
        }
        function spawnNewSuspendedTask(request, task, x) {
          var segment = task.blockedSegment;
          var insertionIndex = segment.chunks.length;
          var newSegment = createPendingSegment(
            request,
            insertionIndex,
            null,
            segment.formatContext,
            // Adopt the parent segment's leading text embed
            segment.lastPushedText,
            // Assume we are text embedded at the trailing edge
            true
          );
          segment.children.push(newSegment);
          segment.lastPushedText = false;
          var newTask = createTask(request, task.node, task.blockedBoundary, newSegment, task.abortSet, task.legacyContext, task.context, task.treeContext);
          {
            if (task.componentStack !== null) {
              newTask.componentStack = task.componentStack.parent;
            }
          }
          var ping = newTask.ping;
          x.then(ping, ping);
        }
        function renderNode(request, task, node) {
          var previousFormatContext = task.blockedSegment.formatContext;
          var previousLegacyContext = task.legacyContext;
          var previousContext = task.context;
          var previousComponentStack = null;
          {
            previousComponentStack = task.componentStack;
          }
          try {
            return renderNodeDestructive(request, task, node);
          } catch (x) {
            resetHooksState();
            if (typeof x === "object" && x !== null && typeof x.then === "function") {
              spawnNewSuspendedTask(request, task, x);
              task.blockedSegment.formatContext = previousFormatContext;
              task.legacyContext = previousLegacyContext;
              task.context = previousContext;
              switchContext(previousContext);
              {
                task.componentStack = previousComponentStack;
              }
              return;
            } else {
              task.blockedSegment.formatContext = previousFormatContext;
              task.legacyContext = previousLegacyContext;
              task.context = previousContext;
              switchContext(previousContext);
              {
                task.componentStack = previousComponentStack;
              }
              throw x;
            }
          }
        }
        function erroredTask(request, boundary, segment, error2) {
          var errorDigest = logRecoverableError(request, error2);
          if (boundary === null) {
            fatalError(request, error2);
          } else {
            boundary.pendingTasks--;
            if (!boundary.forceClientRender) {
              boundary.forceClientRender = true;
              boundary.errorDigest = errorDigest;
              {
                captureBoundaryErrorDetailsDev(boundary, error2);
              }
              if (boundary.parentFlushed) {
                request.clientRenderedBoundaries.push(boundary);
              }
            }
          }
          request.allPendingTasks--;
          if (request.allPendingTasks === 0) {
            var onAllReady = request.onAllReady;
            onAllReady();
          }
        }
        function abortTaskSoft(task) {
          var request = this;
          var boundary = task.blockedBoundary;
          var segment = task.blockedSegment;
          segment.status = ABORTED;
          finishedTask(request, boundary, segment);
        }
        function abortTask(task, request, reason) {
          var boundary = task.blockedBoundary;
          var segment = task.blockedSegment;
          segment.status = ABORTED;
          if (boundary === null) {
            request.allPendingTasks--;
            if (request.status !== CLOSED) {
              request.status = CLOSED;
              if (request.destination !== null) {
                close(request.destination);
              }
            }
          } else {
            boundary.pendingTasks--;
            if (!boundary.forceClientRender) {
              boundary.forceClientRender = true;
              var _error = reason === void 0 ? new Error("The render was aborted by the server without a reason.") : reason;
              boundary.errorDigest = request.onError(_error);
              {
                var errorPrefix = "The server did not finish this Suspense boundary: ";
                if (_error && typeof _error.message === "string") {
                  _error = errorPrefix + _error.message;
                } else {
                  _error = errorPrefix + String(_error);
                }
                var previousTaskInDev = currentTaskInDEV;
                currentTaskInDEV = task;
                try {
                  captureBoundaryErrorDetailsDev(boundary, _error);
                } finally {
                  currentTaskInDEV = previousTaskInDev;
                }
              }
              if (boundary.parentFlushed) {
                request.clientRenderedBoundaries.push(boundary);
              }
            }
            boundary.fallbackAbortableTasks.forEach(function(fallbackTask) {
              return abortTask(fallbackTask, request, reason);
            });
            boundary.fallbackAbortableTasks.clear();
            request.allPendingTasks--;
            if (request.allPendingTasks === 0) {
              var onAllReady = request.onAllReady;
              onAllReady();
            }
          }
        }
        function queueCompletedSegment(boundary, segment) {
          if (segment.chunks.length === 0 && segment.children.length === 1 && segment.children[0].boundary === null) {
            var childSegment = segment.children[0];
            childSegment.id = segment.id;
            childSegment.parentFlushed = true;
            if (childSegment.status === COMPLETED) {
              queueCompletedSegment(boundary, childSegment);
            }
          } else {
            var completedSegments = boundary.completedSegments;
            completedSegments.push(segment);
          }
        }
        function finishedTask(request, boundary, segment) {
          if (boundary === null) {
            if (segment.parentFlushed) {
              if (request.completedRootSegment !== null) {
                throw new Error("There can only be one root segment. This is a bug in React.");
              }
              request.completedRootSegment = segment;
            }
            request.pendingRootTasks--;
            if (request.pendingRootTasks === 0) {
              request.onShellError = noop$1;
              var onShellReady = request.onShellReady;
              onShellReady();
            }
          } else {
            boundary.pendingTasks--;
            if (boundary.forceClientRender) ;
            else if (boundary.pendingTasks === 0) {
              if (segment.parentFlushed) {
                if (segment.status === COMPLETED) {
                  queueCompletedSegment(boundary, segment);
                }
              }
              if (boundary.parentFlushed) {
                request.completedBoundaries.push(boundary);
              }
              boundary.fallbackAbortableTasks.forEach(abortTaskSoft, request);
              boundary.fallbackAbortableTasks.clear();
            } else {
              if (segment.parentFlushed) {
                if (segment.status === COMPLETED) {
                  queueCompletedSegment(boundary, segment);
                  var completedSegments = boundary.completedSegments;
                  if (completedSegments.length === 1) {
                    if (boundary.parentFlushed) {
                      request.partialBoundaries.push(boundary);
                    }
                  }
                }
              }
            }
          }
          request.allPendingTasks--;
          if (request.allPendingTasks === 0) {
            var onAllReady = request.onAllReady;
            onAllReady();
          }
        }
        function retryTask(request, task) {
          var segment = task.blockedSegment;
          if (segment.status !== PENDING) {
            return;
          }
          switchContext(task.context);
          var prevTaskInDEV = null;
          {
            prevTaskInDEV = currentTaskInDEV;
            currentTaskInDEV = task;
          }
          try {
            renderNodeDestructive(request, task, task.node);
            pushSegmentFinale$1(segment.chunks, request.responseState, segment.lastPushedText, segment.textEmbedded);
            task.abortSet.delete(task);
            segment.status = COMPLETED;
            finishedTask(request, task.blockedBoundary, segment);
          } catch (x) {
            resetHooksState();
            if (typeof x === "object" && x !== null && typeof x.then === "function") {
              var ping = task.ping;
              x.then(ping, ping);
            } else {
              task.abortSet.delete(task);
              segment.status = ERRORED;
              erroredTask(request, task.blockedBoundary, segment, x);
            }
          } finally {
            {
              currentTaskInDEV = prevTaskInDEV;
            }
          }
        }
        function performWork(request) {
          if (request.status === CLOSED) {
            return;
          }
          var prevContext = getActiveContext();
          var prevDispatcher = ReactCurrentDispatcher$1.current;
          ReactCurrentDispatcher$1.current = Dispatcher;
          var prevGetCurrentStackImpl;
          {
            prevGetCurrentStackImpl = ReactDebugCurrentFrame$1.getCurrentStack;
            ReactDebugCurrentFrame$1.getCurrentStack = getCurrentStackInDEV;
          }
          var prevResponseState = currentResponseState;
          setCurrentResponseState(request.responseState);
          try {
            var pingedTasks = request.pingedTasks;
            var i;
            for (i = 0; i < pingedTasks.length; i++) {
              var task = pingedTasks[i];
              retryTask(request, task);
            }
            pingedTasks.splice(0, i);
            if (request.destination !== null) {
              flushCompletedQueues(request, request.destination);
            }
          } catch (error2) {
            logRecoverableError(request, error2);
            fatalError(request, error2);
          } finally {
            setCurrentResponseState(prevResponseState);
            ReactCurrentDispatcher$1.current = prevDispatcher;
            {
              ReactDebugCurrentFrame$1.getCurrentStack = prevGetCurrentStackImpl;
            }
            if (prevDispatcher === Dispatcher) {
              switchContext(prevContext);
            }
          }
        }
        function flushSubtree(request, destination, segment) {
          segment.parentFlushed = true;
          switch (segment.status) {
            case PENDING: {
              var segmentID = segment.id = request.nextSegmentId++;
              segment.lastPushedText = false;
              segment.textEmbedded = false;
              return writePlaceholder(destination, request.responseState, segmentID);
            }
            case COMPLETED: {
              segment.status = FLUSHED;
              var r = true;
              var chunks = segment.chunks;
              var chunkIdx = 0;
              var children = segment.children;
              for (var childIdx = 0; childIdx < children.length; childIdx++) {
                var nextChild = children[childIdx];
                for (; chunkIdx < nextChild.index; chunkIdx++) {
                  writeChunk(destination, chunks[chunkIdx]);
                }
                r = flushSegment(request, destination, nextChild);
              }
              for (; chunkIdx < chunks.length - 1; chunkIdx++) {
                writeChunk(destination, chunks[chunkIdx]);
              }
              if (chunkIdx < chunks.length) {
                r = writeChunkAndReturn(destination, chunks[chunkIdx]);
              }
              return r;
            }
            default: {
              throw new Error("Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.");
            }
          }
        }
        function flushSegment(request, destination, segment) {
          var boundary = segment.boundary;
          if (boundary === null) {
            return flushSubtree(request, destination, segment);
          }
          boundary.parentFlushed = true;
          if (boundary.forceClientRender) {
            writeStartClientRenderedSuspenseBoundary$1(destination, request.responseState, boundary.errorDigest, boundary.errorMessage, boundary.errorComponentStack);
            flushSubtree(request, destination, segment);
            return writeEndClientRenderedSuspenseBoundary$1(destination, request.responseState);
          } else if (boundary.pendingTasks > 0) {
            boundary.rootSegmentID = request.nextSegmentId++;
            if (boundary.completedSegments.length > 0) {
              request.partialBoundaries.push(boundary);
            }
            var id = boundary.id = assignSuspenseBoundaryID(request.responseState);
            writeStartPendingSuspenseBoundary(destination, request.responseState, id);
            flushSubtree(request, destination, segment);
            return writeEndPendingSuspenseBoundary(destination, request.responseState);
          } else if (boundary.byteSize > request.progressiveChunkSize) {
            boundary.rootSegmentID = request.nextSegmentId++;
            request.completedBoundaries.push(boundary);
            writeStartPendingSuspenseBoundary(destination, request.responseState, boundary.id);
            flushSubtree(request, destination, segment);
            return writeEndPendingSuspenseBoundary(destination, request.responseState);
          } else {
            writeStartCompletedSuspenseBoundary$1(destination, request.responseState);
            var completedSegments = boundary.completedSegments;
            if (completedSegments.length !== 1) {
              throw new Error("A previously unvisited boundary must have exactly one root segment. This is a bug in React.");
            }
            var contentSegment = completedSegments[0];
            flushSegment(request, destination, contentSegment);
            return writeEndCompletedSuspenseBoundary$1(destination, request.responseState);
          }
        }
        function flushClientRenderedBoundary(request, destination, boundary) {
          return writeClientRenderBoundaryInstruction(destination, request.responseState, boundary.id, boundary.errorDigest, boundary.errorMessage, boundary.errorComponentStack);
        }
        function flushSegmentContainer(request, destination, segment) {
          writeStartSegment(destination, request.responseState, segment.formatContext, segment.id);
          flushSegment(request, destination, segment);
          return writeEndSegment(destination, segment.formatContext);
        }
        function flushCompletedBoundary(request, destination, boundary) {
          var completedSegments = boundary.completedSegments;
          var i = 0;
          for (; i < completedSegments.length; i++) {
            var segment = completedSegments[i];
            flushPartiallyCompletedSegment(request, destination, boundary, segment);
          }
          completedSegments.length = 0;
          return writeCompletedBoundaryInstruction(destination, request.responseState, boundary.id, boundary.rootSegmentID);
        }
        function flushPartialBoundary(request, destination, boundary) {
          var completedSegments = boundary.completedSegments;
          var i = 0;
          for (; i < completedSegments.length; i++) {
            var segment = completedSegments[i];
            if (!flushPartiallyCompletedSegment(request, destination, boundary, segment)) {
              i++;
              completedSegments.splice(0, i);
              return false;
            }
          }
          completedSegments.splice(0, i);
          return true;
        }
        function flushPartiallyCompletedSegment(request, destination, boundary, segment) {
          if (segment.status === FLUSHED) {
            return true;
          }
          var segmentID = segment.id;
          if (segmentID === -1) {
            var rootSegmentID = segment.id = boundary.rootSegmentID;
            if (rootSegmentID === -1) {
              throw new Error("A root segment ID must have been assigned by now. This is a bug in React.");
            }
            return flushSegmentContainer(request, destination, segment);
          } else {
            flushSegmentContainer(request, destination, segment);
            return writeCompletedSegmentInstruction(destination, request.responseState, segmentID);
          }
        }
        function flushCompletedQueues(request, destination) {
          try {
            var completedRootSegment = request.completedRootSegment;
            if (completedRootSegment !== null && request.pendingRootTasks === 0) {
              flushSegment(request, destination, completedRootSegment);
              request.completedRootSegment = null;
              writeCompletedRoot(destination, request.responseState);
            }
            var clientRenderedBoundaries = request.clientRenderedBoundaries;
            var i;
            for (i = 0; i < clientRenderedBoundaries.length; i++) {
              var boundary = clientRenderedBoundaries[i];
              if (!flushClientRenderedBoundary(request, destination, boundary)) {
                request.destination = null;
                i++;
                clientRenderedBoundaries.splice(0, i);
                return;
              }
            }
            clientRenderedBoundaries.splice(0, i);
            var completedBoundaries = request.completedBoundaries;
            for (i = 0; i < completedBoundaries.length; i++) {
              var _boundary = completedBoundaries[i];
              if (!flushCompletedBoundary(request, destination, _boundary)) {
                request.destination = null;
                i++;
                completedBoundaries.splice(0, i);
                return;
              }
            }
            completedBoundaries.splice(0, i);
            completeWriting(destination);
            beginWriting(destination);
            var partialBoundaries = request.partialBoundaries;
            for (i = 0; i < partialBoundaries.length; i++) {
              var _boundary2 = partialBoundaries[i];
              if (!flushPartialBoundary(request, destination, _boundary2)) {
                request.destination = null;
                i++;
                partialBoundaries.splice(0, i);
                return;
              }
            }
            partialBoundaries.splice(0, i);
            var largeBoundaries = request.completedBoundaries;
            for (i = 0; i < largeBoundaries.length; i++) {
              var _boundary3 = largeBoundaries[i];
              if (!flushCompletedBoundary(request, destination, _boundary3)) {
                request.destination = null;
                i++;
                largeBoundaries.splice(0, i);
                return;
              }
            }
            largeBoundaries.splice(0, i);
          } finally {
            if (request.allPendingTasks === 0 && request.pingedTasks.length === 0 && request.clientRenderedBoundaries.length === 0 && request.completedBoundaries.length === 0) {
              {
                if (request.abortableTasks.size !== 0) {
                  error("There was still abortable task at the root when we closed. This is a bug in React.");
                }
              }
              close(destination);
            }
          }
        }
        function startWork(request) {
          scheduleWork(function() {
            return performWork(request);
          });
        }
        function startFlowing(request, destination) {
          if (request.status === CLOSING) {
            request.status = CLOSED;
            closeWithError(destination, request.fatalError);
            return;
          }
          if (request.status === CLOSED) {
            return;
          }
          if (request.destination !== null) {
            return;
          }
          request.destination = destination;
          try {
            flushCompletedQueues(request, destination);
          } catch (error2) {
            logRecoverableError(request, error2);
            fatalError(request, error2);
          }
        }
        function abort(request, reason) {
          try {
            var abortableTasks = request.abortableTasks;
            abortableTasks.forEach(function(task) {
              return abortTask(task, request, reason);
            });
            abortableTasks.clear();
            if (request.destination !== null) {
              flushCompletedQueues(request, request.destination);
            }
          } catch (error2) {
            logRecoverableError(request, error2);
            fatalError(request, error2);
          }
        }
        function onError() {
        }
        function renderToStringImpl(children, options, generateStaticMarkup, abortReason) {
          var didFatal = false;
          var fatalError2 = null;
          var result = "";
          var destination = {
            push: function(chunk) {
              if (chunk !== null) {
                result += chunk;
              }
              return true;
            },
            destroy: function(error2) {
              didFatal = true;
              fatalError2 = error2;
            }
          };
          var readyToStream = false;
          function onShellReady() {
            readyToStream = true;
          }
          var request = createRequest(children, createResponseState$1(generateStaticMarkup, options ? options.identifierPrefix : void 0), createRootFormatContext(), Infinity, onError, void 0, onShellReady, void 0, void 0);
          startWork(request);
          abort(request, abortReason);
          startFlowing(request, destination);
          if (didFatal) {
            throw fatalError2;
          }
          if (!readyToStream) {
            throw new Error("A component suspended while responding to synchronous input. This will cause the UI to be replaced with a loading indicator. To fix, updates that suspend should be wrapped with startTransition.");
          }
          return result;
        }
        function _inheritsLoose(subClass, superClass) {
          subClass.prototype = Object.create(superClass.prototype);
          subClass.prototype.constructor = subClass;
          subClass.__proto__ = superClass;
        }
        var ReactMarkupReadableStream = /* @__PURE__ */ (function(_Readable) {
          _inheritsLoose(ReactMarkupReadableStream2, _Readable);
          function ReactMarkupReadableStream2() {
            var _this;
            _this = _Readable.call(this, {}) || this;
            _this.request = null;
            _this.startedFlowing = false;
            return _this;
          }
          var _proto = ReactMarkupReadableStream2.prototype;
          _proto._destroy = function _destroy(err, callback) {
            abort(this.request);
            callback(err);
          };
          _proto._read = function _read(size) {
            if (this.startedFlowing) {
              startFlowing(this.request, this);
            }
          };
          return ReactMarkupReadableStream2;
        })(stream.Readable);
        function onError$1() {
        }
        function renderToNodeStreamImpl(children, options, generateStaticMarkup) {
          function onAllReady() {
            destination.startedFlowing = true;
            startFlowing(request, destination);
          }
          var destination = new ReactMarkupReadableStream();
          var request = createRequest(children, createResponseState$1(false, options ? options.identifierPrefix : void 0), createRootFormatContext(), Infinity, onError$1, onAllReady, void 0, void 0);
          destination.request = request;
          startWork(request);
          return destination;
        }
        function renderToNodeStream(children, options) {
          {
            error("renderToNodeStream is deprecated. Use renderToPipeableStream instead.");
          }
          return renderToNodeStreamImpl(children, options);
        }
        function renderToStaticNodeStream(children, options) {
          {
            error("ReactDOMServer.renderToStaticNodeStream() is deprecated. Use ReactDOMServer.renderToPipeableStream() and wait to `pipe` until the `onAllReady` callback has been called instead.");
          }
          return renderToNodeStreamImpl(children, options);
        }
        function renderToString(children, options) {
          return renderToStringImpl(children, options, false, 'The server used "renderToString" which does not support Suspense. If you intended for this Suspense boundary to render the fallback content on the server consider throwing an Error somewhere within the Suspense boundary. If you intended to have the server wait for the suspended component please switch to "renderToPipeableStream" which supports Suspense on the server');
        }
        function renderToStaticMarkup2(children, options) {
          return renderToStringImpl(children, options, true, 'The server used "renderToStaticMarkup" which does not support Suspense. If you intended to have the server wait for the suspended component please switch to "renderToPipeableStream" which supports Suspense on the server');
        }
        exports2.renderToNodeStream = renderToNodeStream;
        exports2.renderToStaticMarkup = renderToStaticMarkup2;
        exports2.renderToStaticNodeStream = renderToStaticNodeStream;
        exports2.renderToString = renderToString;
        exports2.version = ReactVersion;
      })();
    }
  }
});

// node_modules/react-dom/cjs/react-dom-server.node.development.js
var require_react_dom_server_node_development = __commonJS({
  "node_modules/react-dom/cjs/react-dom-server.node.development.js"(exports2) {
    "use strict";
    if (process.env.NODE_ENV !== "production") {
      (function() {
        "use strict";
        var React3 = require_react();
        var util = require("util");
        var ReactVersion = "18.3.1";
        var ReactSharedInternals = React3.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        function warn(format) {
          {
            {
              for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }
              printWarning("warn", format, args);
            }
          }
        }
        function error(format) {
          {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame2.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            var argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        function scheduleWork(callback) {
          setImmediate(callback);
        }
        function flushBuffered(destination) {
          if (typeof destination.flush === "function") {
            destination.flush();
          }
        }
        var VIEW_SIZE = 2048;
        var currentView = null;
        var writtenBytes = 0;
        var destinationHasCapacity = true;
        function beginWriting(destination) {
          currentView = new Uint8Array(VIEW_SIZE);
          writtenBytes = 0;
          destinationHasCapacity = true;
        }
        function writeStringChunk(destination, stringChunk) {
          if (stringChunk.length === 0) {
            return;
          }
          if (stringChunk.length * 3 > VIEW_SIZE) {
            if (writtenBytes > 0) {
              writeToDestination(destination, currentView.subarray(0, writtenBytes));
              currentView = new Uint8Array(VIEW_SIZE);
              writtenBytes = 0;
            }
            writeToDestination(destination, textEncoder.encode(stringChunk));
            return;
          }
          var target = currentView;
          if (writtenBytes > 0) {
            target = currentView.subarray(writtenBytes);
          }
          var _textEncoder$encodeIn = textEncoder.encodeInto(stringChunk, target), read = _textEncoder$encodeIn.read, written = _textEncoder$encodeIn.written;
          writtenBytes += written;
          if (read < stringChunk.length) {
            writeToDestination(destination, currentView);
            currentView = new Uint8Array(VIEW_SIZE);
            writtenBytes = textEncoder.encodeInto(stringChunk.slice(read), currentView).written;
          }
          if (writtenBytes === VIEW_SIZE) {
            writeToDestination(destination, currentView);
            currentView = new Uint8Array(VIEW_SIZE);
            writtenBytes = 0;
          }
        }
        function writeViewChunk(destination, chunk) {
          if (chunk.byteLength === 0) {
            return;
          }
          if (chunk.byteLength > VIEW_SIZE) {
            if (writtenBytes > 0) {
              writeToDestination(destination, currentView.subarray(0, writtenBytes));
              currentView = new Uint8Array(VIEW_SIZE);
              writtenBytes = 0;
            }
            writeToDestination(destination, chunk);
            return;
          }
          var bytesToWrite = chunk;
          var allowableBytes = currentView.length - writtenBytes;
          if (allowableBytes < bytesToWrite.byteLength) {
            if (allowableBytes === 0) {
              writeToDestination(destination, currentView);
            } else {
              currentView.set(bytesToWrite.subarray(0, allowableBytes), writtenBytes);
              writtenBytes += allowableBytes;
              writeToDestination(destination, currentView);
              bytesToWrite = bytesToWrite.subarray(allowableBytes);
            }
            currentView = new Uint8Array(VIEW_SIZE);
            writtenBytes = 0;
          }
          currentView.set(bytesToWrite, writtenBytes);
          writtenBytes += bytesToWrite.byteLength;
          if (writtenBytes === VIEW_SIZE) {
            writeToDestination(destination, currentView);
            currentView = new Uint8Array(VIEW_SIZE);
            writtenBytes = 0;
          }
        }
        function writeChunk(destination, chunk) {
          if (typeof chunk === "string") {
            writeStringChunk(destination, chunk);
          } else {
            writeViewChunk(destination, chunk);
          }
        }
        function writeToDestination(destination, view) {
          var currentHasCapacity = destination.write(view);
          destinationHasCapacity = destinationHasCapacity && currentHasCapacity;
        }
        function writeChunkAndReturn(destination, chunk) {
          writeChunk(destination, chunk);
          return destinationHasCapacity;
        }
        function completeWriting(destination) {
          if (currentView && writtenBytes > 0) {
            destination.write(currentView.subarray(0, writtenBytes));
          }
          currentView = null;
          writtenBytes = 0;
          destinationHasCapacity = true;
        }
        function close(destination) {
          destination.end();
        }
        var textEncoder = new util.TextEncoder();
        function stringToChunk(content) {
          return content;
        }
        function stringToPrecomputedChunk(content) {
          return textEncoder.encode(content);
        }
        function closeWithError(destination, error2) {
          destination.destroy(error2);
        }
        function typeName(value) {
          {
            var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
            var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            return type;
          }
        }
        function willCoercionThrow(value) {
          {
            try {
              testStringCoercion(value);
              return false;
            } catch (e) {
              return true;
            }
          }
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkAttributeStringCoercion(value, attributeName) {
          {
            if (willCoercionThrow(value)) {
              error("The provided `%s` attribute is an unsupported type %s. This value must be coerced to a string before before using it here.", attributeName, typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function checkCSSPropertyStringCoercion(value, propName) {
          {
            if (willCoercionThrow(value)) {
              error("The provided `%s` CSS property is an unsupported type %s. This value must be coerced to a string before before using it here.", propName, typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function checkHtmlStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("The provided HTML markup uses a value of unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var RESERVED = 0;
        var STRING = 1;
        var BOOLEANISH_STRING = 2;
        var BOOLEAN = 3;
        var OVERLOADED_BOOLEAN = 4;
        var NUMERIC = 5;
        var POSITIVE_NUMERIC = 6;
        var ATTRIBUTE_NAME_START_CHAR = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
        var ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
        var VALID_ATTRIBUTE_NAME_REGEX = new RegExp("^[" + ATTRIBUTE_NAME_START_CHAR + "][" + ATTRIBUTE_NAME_CHAR + "]*$");
        var illegalAttributeNameCache = {};
        var validatedAttributeNameCache = {};
        function isAttributeNameSafe(attributeName) {
          if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) {
            return true;
          }
          if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) {
            return false;
          }
          if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
            validatedAttributeNameCache[attributeName] = true;
            return true;
          }
          illegalAttributeNameCache[attributeName] = true;
          {
            error("Invalid attribute name: `%s`", attributeName);
          }
          return false;
        }
        function shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag) {
          if (propertyInfo !== null && propertyInfo.type === RESERVED) {
            return false;
          }
          switch (typeof value) {
            case "function":
            // $FlowIssue symbol is perfectly valid here
            case "symbol":
              return true;
            case "boolean": {
              if (isCustomComponentTag) {
                return false;
              }
              if (propertyInfo !== null) {
                return !propertyInfo.acceptsBooleans;
              } else {
                var prefix2 = name.toLowerCase().slice(0, 5);
                return prefix2 !== "data-" && prefix2 !== "aria-";
              }
            }
            default:
              return false;
          }
        }
        function getPropertyInfo(name) {
          return properties.hasOwnProperty(name) ? properties[name] : null;
        }
        function PropertyInfoRecord(name, type, mustUseProperty, attributeName, attributeNamespace, sanitizeURL2, removeEmptyString) {
          this.acceptsBooleans = type === BOOLEANISH_STRING || type === BOOLEAN || type === OVERLOADED_BOOLEAN;
          this.attributeName = attributeName;
          this.attributeNamespace = attributeNamespace;
          this.mustUseProperty = mustUseProperty;
          this.propertyName = name;
          this.type = type;
          this.sanitizeURL = sanitizeURL2;
          this.removeEmptyString = removeEmptyString;
        }
        var properties = {};
        var reservedProps = [
          "children",
          "dangerouslySetInnerHTML",
          // TODO: This prevents the assignment of defaultValue to regular
          // elements (not just inputs). Now that ReactDOMInput assigns to the
          // defaultValue property -- do we need this?
          "defaultValue",
          "defaultChecked",
          "innerHTML",
          "suppressContentEditableWarning",
          "suppressHydrationWarning",
          "style"
        ];
        reservedProps.forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            RESERVED,
            false,
            // mustUseProperty
            name,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(_ref) {
          var name = _ref[0], attributeName = _ref[1];
          properties[name] = new PropertyInfoRecord(
            name,
            STRING,
            false,
            // mustUseProperty
            attributeName,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            BOOLEANISH_STRING,
            false,
            // mustUseProperty
            name.toLowerCase(),
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            BOOLEANISH_STRING,
            false,
            // mustUseProperty
            name,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [
          "allowFullScreen",
          "async",
          // Note: there is a special case that prevents it from being written to the DOM
          // on the client side because the browsers are inconsistent. Instead we call focus().
          "autoFocus",
          "autoPlay",
          "controls",
          "default",
          "defer",
          "disabled",
          "disablePictureInPicture",
          "disableRemotePlayback",
          "formNoValidate",
          "hidden",
          "loop",
          "noModule",
          "noValidate",
          "open",
          "playsInline",
          "readOnly",
          "required",
          "reversed",
          "scoped",
          "seamless",
          // Microdata
          "itemScope"
        ].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            BOOLEAN,
            false,
            // mustUseProperty
            name.toLowerCase(),
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [
          "checked",
          // Note: `option.selected` is not updated if `select.multiple` is
          // disabled with `removeAttribute`. We have special logic for handling this.
          "multiple",
          "muted",
          "selected"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            BOOLEAN,
            true,
            // mustUseProperty
            name,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [
          "capture",
          "download"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            OVERLOADED_BOOLEAN,
            false,
            // mustUseProperty
            name,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [
          "cols",
          "rows",
          "size",
          "span"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            POSITIVE_NUMERIC,
            false,
            // mustUseProperty
            name,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        ["rowSpan", "start"].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            NUMERIC,
            false,
            // mustUseProperty
            name.toLowerCase(),
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        var CAMELIZE = /[\-\:]([a-z])/g;
        var capitalize = function(token) {
          return token[1].toUpperCase();
        };
        [
          "accent-height",
          "alignment-baseline",
          "arabic-form",
          "baseline-shift",
          "cap-height",
          "clip-path",
          "clip-rule",
          "color-interpolation",
          "color-interpolation-filters",
          "color-profile",
          "color-rendering",
          "dominant-baseline",
          "enable-background",
          "fill-opacity",
          "fill-rule",
          "flood-color",
          "flood-opacity",
          "font-family",
          "font-size",
          "font-size-adjust",
          "font-stretch",
          "font-style",
          "font-variant",
          "font-weight",
          "glyph-name",
          "glyph-orientation-horizontal",
          "glyph-orientation-vertical",
          "horiz-adv-x",
          "horiz-origin-x",
          "image-rendering",
          "letter-spacing",
          "lighting-color",
          "marker-end",
          "marker-mid",
          "marker-start",
          "overline-position",
          "overline-thickness",
          "paint-order",
          "panose-1",
          "pointer-events",
          "rendering-intent",
          "shape-rendering",
          "stop-color",
          "stop-opacity",
          "strikethrough-position",
          "strikethrough-thickness",
          "stroke-dasharray",
          "stroke-dashoffset",
          "stroke-linecap",
          "stroke-linejoin",
          "stroke-miterlimit",
          "stroke-opacity",
          "stroke-width",
          "text-anchor",
          "text-decoration",
          "text-rendering",
          "underline-position",
          "underline-thickness",
          "unicode-bidi",
          "unicode-range",
          "units-per-em",
          "v-alphabetic",
          "v-hanging",
          "v-ideographic",
          "v-mathematical",
          "vector-effect",
          "vert-adv-y",
          "vert-origin-x",
          "vert-origin-y",
          "word-spacing",
          "writing-mode",
          "xmlns:xlink",
          "x-height"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(attributeName) {
          var name = attributeName.replace(CAMELIZE, capitalize);
          properties[name] = new PropertyInfoRecord(
            name,
            STRING,
            false,
            // mustUseProperty
            attributeName,
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [
          "xlink:actuate",
          "xlink:arcrole",
          "xlink:role",
          "xlink:show",
          "xlink:title",
          "xlink:type"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(attributeName) {
          var name = attributeName.replace(CAMELIZE, capitalize);
          properties[name] = new PropertyInfoRecord(
            name,
            STRING,
            false,
            // mustUseProperty
            attributeName,
            "http://www.w3.org/1999/xlink",
            false,
            // sanitizeURL
            false
          );
        });
        [
          "xml:base",
          "xml:lang",
          "xml:space"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(attributeName) {
          var name = attributeName.replace(CAMELIZE, capitalize);
          properties[name] = new PropertyInfoRecord(
            name,
            STRING,
            false,
            // mustUseProperty
            attributeName,
            "http://www.w3.org/XML/1998/namespace",
            false,
            // sanitizeURL
            false
          );
        });
        ["tabIndex", "crossOrigin"].forEach(function(attributeName) {
          properties[attributeName] = new PropertyInfoRecord(
            attributeName,
            STRING,
            false,
            // mustUseProperty
            attributeName.toLowerCase(),
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        var xlinkHref = "xlinkHref";
        properties[xlinkHref] = new PropertyInfoRecord(
          "xlinkHref",
          STRING,
          false,
          // mustUseProperty
          "xlink:href",
          "http://www.w3.org/1999/xlink",
          true,
          // sanitizeURL
          false
        );
        ["src", "href", "action", "formAction"].forEach(function(attributeName) {
          properties[attributeName] = new PropertyInfoRecord(
            attributeName,
            STRING,
            false,
            // mustUseProperty
            attributeName.toLowerCase(),
            // attributeName
            null,
            // attributeNamespace
            true,
            // sanitizeURL
            true
          );
        });
        var isUnitlessNumber = {
          animationIterationCount: true,
          aspectRatio: true,
          borderImageOutset: true,
          borderImageSlice: true,
          borderImageWidth: true,
          boxFlex: true,
          boxFlexGroup: true,
          boxOrdinalGroup: true,
          columnCount: true,
          columns: true,
          flex: true,
          flexGrow: true,
          flexPositive: true,
          flexShrink: true,
          flexNegative: true,
          flexOrder: true,
          gridArea: true,
          gridRow: true,
          gridRowEnd: true,
          gridRowSpan: true,
          gridRowStart: true,
          gridColumn: true,
          gridColumnEnd: true,
          gridColumnSpan: true,
          gridColumnStart: true,
          fontWeight: true,
          lineClamp: true,
          lineHeight: true,
          opacity: true,
          order: true,
          orphans: true,
          tabSize: true,
          widows: true,
          zIndex: true,
          zoom: true,
          // SVG-related properties
          fillOpacity: true,
          floodOpacity: true,
          stopOpacity: true,
          strokeDasharray: true,
          strokeDashoffset: true,
          strokeMiterlimit: true,
          strokeOpacity: true,
          strokeWidth: true
        };
        function prefixKey(prefix2, key) {
          return prefix2 + key.charAt(0).toUpperCase() + key.substring(1);
        }
        var prefixes = ["Webkit", "ms", "Moz", "O"];
        Object.keys(isUnitlessNumber).forEach(function(prop) {
          prefixes.forEach(function(prefix2) {
            isUnitlessNumber[prefixKey(prefix2, prop)] = isUnitlessNumber[prop];
          });
        });
        var hasReadOnlyValue = {
          button: true,
          checkbox: true,
          image: true,
          hidden: true,
          radio: true,
          reset: true,
          submit: true
        };
        function checkControlledValueProps(tagName, props) {
          {
            if (!(hasReadOnlyValue[props.type] || props.onChange || props.onInput || props.readOnly || props.disabled || props.value == null)) {
              error("You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.");
            }
            if (!(props.onChange || props.readOnly || props.disabled || props.checked == null)) {
              error("You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.");
            }
          }
        }
        function isCustomComponent(tagName, props) {
          if (tagName.indexOf("-") === -1) {
            return typeof props.is === "string";
          }
          switch (tagName) {
            // These are reserved SVG and MathML elements.
            // We don't mind this list too much because we expect it to never grow.
            // The alternative is to track the namespace in a few places which is convoluted.
            // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
            case "annotation-xml":
            case "color-profile":
            case "font-face":
            case "font-face-src":
            case "font-face-uri":
            case "font-face-format":
            case "font-face-name":
            case "missing-glyph":
              return false;
            default:
              return true;
          }
        }
        var ariaProperties = {
          "aria-current": 0,
          // state
          "aria-description": 0,
          "aria-details": 0,
          "aria-disabled": 0,
          // state
          "aria-hidden": 0,
          // state
          "aria-invalid": 0,
          // state
          "aria-keyshortcuts": 0,
          "aria-label": 0,
          "aria-roledescription": 0,
          // Widget Attributes
          "aria-autocomplete": 0,
          "aria-checked": 0,
          "aria-expanded": 0,
          "aria-haspopup": 0,
          "aria-level": 0,
          "aria-modal": 0,
          "aria-multiline": 0,
          "aria-multiselectable": 0,
          "aria-orientation": 0,
          "aria-placeholder": 0,
          "aria-pressed": 0,
          "aria-readonly": 0,
          "aria-required": 0,
          "aria-selected": 0,
          "aria-sort": 0,
          "aria-valuemax": 0,
          "aria-valuemin": 0,
          "aria-valuenow": 0,
          "aria-valuetext": 0,
          // Live Region Attributes
          "aria-atomic": 0,
          "aria-busy": 0,
          "aria-live": 0,
          "aria-relevant": 0,
          // Drag-and-Drop Attributes
          "aria-dropeffect": 0,
          "aria-grabbed": 0,
          // Relationship Attributes
          "aria-activedescendant": 0,
          "aria-colcount": 0,
          "aria-colindex": 0,
          "aria-colspan": 0,
          "aria-controls": 0,
          "aria-describedby": 0,
          "aria-errormessage": 0,
          "aria-flowto": 0,
          "aria-labelledby": 0,
          "aria-owns": 0,
          "aria-posinset": 0,
          "aria-rowcount": 0,
          "aria-rowindex": 0,
          "aria-rowspan": 0,
          "aria-setsize": 0
        };
        var warnedProperties = {};
        var rARIA = new RegExp("^(aria)-[" + ATTRIBUTE_NAME_CHAR + "]*$");
        var rARIACamel = new RegExp("^(aria)[A-Z][" + ATTRIBUTE_NAME_CHAR + "]*$");
        function validateProperty(tagName, name) {
          {
            if (hasOwnProperty.call(warnedProperties, name) && warnedProperties[name]) {
              return true;
            }
            if (rARIACamel.test(name)) {
              var ariaName = "aria-" + name.slice(4).toLowerCase();
              var correctName = ariaProperties.hasOwnProperty(ariaName) ? ariaName : null;
              if (correctName == null) {
                error("Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.", name);
                warnedProperties[name] = true;
                return true;
              }
              if (name !== correctName) {
                error("Invalid ARIA attribute `%s`. Did you mean `%s`?", name, correctName);
                warnedProperties[name] = true;
                return true;
              }
            }
            if (rARIA.test(name)) {
              var lowerCasedName = name.toLowerCase();
              var standardName = ariaProperties.hasOwnProperty(lowerCasedName) ? lowerCasedName : null;
              if (standardName == null) {
                warnedProperties[name] = true;
                return false;
              }
              if (name !== standardName) {
                error("Unknown ARIA attribute `%s`. Did you mean `%s`?", name, standardName);
                warnedProperties[name] = true;
                return true;
              }
            }
          }
          return true;
        }
        function warnInvalidARIAProps(type, props) {
          {
            var invalidProps = [];
            for (var key in props) {
              var isValid = validateProperty(type, key);
              if (!isValid) {
                invalidProps.push(key);
              }
            }
            var unknownPropString = invalidProps.map(function(prop) {
              return "`" + prop + "`";
            }).join(", ");
            if (invalidProps.length === 1) {
              error("Invalid aria prop %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", unknownPropString, type);
            } else if (invalidProps.length > 1) {
              error("Invalid aria props %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", unknownPropString, type);
            }
          }
        }
        function validateProperties(type, props) {
          if (isCustomComponent(type, props)) {
            return;
          }
          warnInvalidARIAProps(type, props);
        }
        var didWarnValueNull = false;
        function validateProperties$1(type, props) {
          {
            if (type !== "input" && type !== "textarea" && type !== "select") {
              return;
            }
            if (props != null && props.value === null && !didWarnValueNull) {
              didWarnValueNull = true;
              if (type === "select" && props.multiple) {
                error("`value` prop on `%s` should not be null. Consider using an empty array when `multiple` is set to `true` to clear the component or `undefined` for uncontrolled components.", type);
              } else {
                error("`value` prop on `%s` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.", type);
              }
            }
          }
        }
        var possibleStandardNames = {
          // HTML
          accept: "accept",
          acceptcharset: "acceptCharset",
          "accept-charset": "acceptCharset",
          accesskey: "accessKey",
          action: "action",
          allowfullscreen: "allowFullScreen",
          alt: "alt",
          as: "as",
          async: "async",
          autocapitalize: "autoCapitalize",
          autocomplete: "autoComplete",
          autocorrect: "autoCorrect",
          autofocus: "autoFocus",
          autoplay: "autoPlay",
          autosave: "autoSave",
          capture: "capture",
          cellpadding: "cellPadding",
          cellspacing: "cellSpacing",
          challenge: "challenge",
          charset: "charSet",
          checked: "checked",
          children: "children",
          cite: "cite",
          class: "className",
          classid: "classID",
          classname: "className",
          cols: "cols",
          colspan: "colSpan",
          content: "content",
          contenteditable: "contentEditable",
          contextmenu: "contextMenu",
          controls: "controls",
          controlslist: "controlsList",
          coords: "coords",
          crossorigin: "crossOrigin",
          dangerouslysetinnerhtml: "dangerouslySetInnerHTML",
          data: "data",
          datetime: "dateTime",
          default: "default",
          defaultchecked: "defaultChecked",
          defaultvalue: "defaultValue",
          defer: "defer",
          dir: "dir",
          disabled: "disabled",
          disablepictureinpicture: "disablePictureInPicture",
          disableremoteplayback: "disableRemotePlayback",
          download: "download",
          draggable: "draggable",
          enctype: "encType",
          enterkeyhint: "enterKeyHint",
          for: "htmlFor",
          form: "form",
          formmethod: "formMethod",
          formaction: "formAction",
          formenctype: "formEncType",
          formnovalidate: "formNoValidate",
          formtarget: "formTarget",
          frameborder: "frameBorder",
          headers: "headers",
          height: "height",
          hidden: "hidden",
          high: "high",
          href: "href",
          hreflang: "hrefLang",
          htmlfor: "htmlFor",
          httpequiv: "httpEquiv",
          "http-equiv": "httpEquiv",
          icon: "icon",
          id: "id",
          imagesizes: "imageSizes",
          imagesrcset: "imageSrcSet",
          innerhtml: "innerHTML",
          inputmode: "inputMode",
          integrity: "integrity",
          is: "is",
          itemid: "itemID",
          itemprop: "itemProp",
          itemref: "itemRef",
          itemscope: "itemScope",
          itemtype: "itemType",
          keyparams: "keyParams",
          keytype: "keyType",
          kind: "kind",
          label: "label",
          lang: "lang",
          list: "list",
          loop: "loop",
          low: "low",
          manifest: "manifest",
          marginwidth: "marginWidth",
          marginheight: "marginHeight",
          max: "max",
          maxlength: "maxLength",
          media: "media",
          mediagroup: "mediaGroup",
          method: "method",
          min: "min",
          minlength: "minLength",
          multiple: "multiple",
          muted: "muted",
          name: "name",
          nomodule: "noModule",
          nonce: "nonce",
          novalidate: "noValidate",
          open: "open",
          optimum: "optimum",
          pattern: "pattern",
          placeholder: "placeholder",
          playsinline: "playsInline",
          poster: "poster",
          preload: "preload",
          profile: "profile",
          radiogroup: "radioGroup",
          readonly: "readOnly",
          referrerpolicy: "referrerPolicy",
          rel: "rel",
          required: "required",
          reversed: "reversed",
          role: "role",
          rows: "rows",
          rowspan: "rowSpan",
          sandbox: "sandbox",
          scope: "scope",
          scoped: "scoped",
          scrolling: "scrolling",
          seamless: "seamless",
          selected: "selected",
          shape: "shape",
          size: "size",
          sizes: "sizes",
          span: "span",
          spellcheck: "spellCheck",
          src: "src",
          srcdoc: "srcDoc",
          srclang: "srcLang",
          srcset: "srcSet",
          start: "start",
          step: "step",
          style: "style",
          summary: "summary",
          tabindex: "tabIndex",
          target: "target",
          title: "title",
          type: "type",
          usemap: "useMap",
          value: "value",
          width: "width",
          wmode: "wmode",
          wrap: "wrap",
          // SVG
          about: "about",
          accentheight: "accentHeight",
          "accent-height": "accentHeight",
          accumulate: "accumulate",
          additive: "additive",
          alignmentbaseline: "alignmentBaseline",
          "alignment-baseline": "alignmentBaseline",
          allowreorder: "allowReorder",
          alphabetic: "alphabetic",
          amplitude: "amplitude",
          arabicform: "arabicForm",
          "arabic-form": "arabicForm",
          ascent: "ascent",
          attributename: "attributeName",
          attributetype: "attributeType",
          autoreverse: "autoReverse",
          azimuth: "azimuth",
          basefrequency: "baseFrequency",
          baselineshift: "baselineShift",
          "baseline-shift": "baselineShift",
          baseprofile: "baseProfile",
          bbox: "bbox",
          begin: "begin",
          bias: "bias",
          by: "by",
          calcmode: "calcMode",
          capheight: "capHeight",
          "cap-height": "capHeight",
          clip: "clip",
          clippath: "clipPath",
          "clip-path": "clipPath",
          clippathunits: "clipPathUnits",
          cliprule: "clipRule",
          "clip-rule": "clipRule",
          color: "color",
          colorinterpolation: "colorInterpolation",
          "color-interpolation": "colorInterpolation",
          colorinterpolationfilters: "colorInterpolationFilters",
          "color-interpolation-filters": "colorInterpolationFilters",
          colorprofile: "colorProfile",
          "color-profile": "colorProfile",
          colorrendering: "colorRendering",
          "color-rendering": "colorRendering",
          contentscripttype: "contentScriptType",
          contentstyletype: "contentStyleType",
          cursor: "cursor",
          cx: "cx",
          cy: "cy",
          d: "d",
          datatype: "datatype",
          decelerate: "decelerate",
          descent: "descent",
          diffuseconstant: "diffuseConstant",
          direction: "direction",
          display: "display",
          divisor: "divisor",
          dominantbaseline: "dominantBaseline",
          "dominant-baseline": "dominantBaseline",
          dur: "dur",
          dx: "dx",
          dy: "dy",
          edgemode: "edgeMode",
          elevation: "elevation",
          enablebackground: "enableBackground",
          "enable-background": "enableBackground",
          end: "end",
          exponent: "exponent",
          externalresourcesrequired: "externalResourcesRequired",
          fill: "fill",
          fillopacity: "fillOpacity",
          "fill-opacity": "fillOpacity",
          fillrule: "fillRule",
          "fill-rule": "fillRule",
          filter: "filter",
          filterres: "filterRes",
          filterunits: "filterUnits",
          floodopacity: "floodOpacity",
          "flood-opacity": "floodOpacity",
          floodcolor: "floodColor",
          "flood-color": "floodColor",
          focusable: "focusable",
          fontfamily: "fontFamily",
          "font-family": "fontFamily",
          fontsize: "fontSize",
          "font-size": "fontSize",
          fontsizeadjust: "fontSizeAdjust",
          "font-size-adjust": "fontSizeAdjust",
          fontstretch: "fontStretch",
          "font-stretch": "fontStretch",
          fontstyle: "fontStyle",
          "font-style": "fontStyle",
          fontvariant: "fontVariant",
          "font-variant": "fontVariant",
          fontweight: "fontWeight",
          "font-weight": "fontWeight",
          format: "format",
          from: "from",
          fx: "fx",
          fy: "fy",
          g1: "g1",
          g2: "g2",
          glyphname: "glyphName",
          "glyph-name": "glyphName",
          glyphorientationhorizontal: "glyphOrientationHorizontal",
          "glyph-orientation-horizontal": "glyphOrientationHorizontal",
          glyphorientationvertical: "glyphOrientationVertical",
          "glyph-orientation-vertical": "glyphOrientationVertical",
          glyphref: "glyphRef",
          gradienttransform: "gradientTransform",
          gradientunits: "gradientUnits",
          hanging: "hanging",
          horizadvx: "horizAdvX",
          "horiz-adv-x": "horizAdvX",
          horizoriginx: "horizOriginX",
          "horiz-origin-x": "horizOriginX",
          ideographic: "ideographic",
          imagerendering: "imageRendering",
          "image-rendering": "imageRendering",
          in2: "in2",
          in: "in",
          inlist: "inlist",
          intercept: "intercept",
          k1: "k1",
          k2: "k2",
          k3: "k3",
          k4: "k4",
          k: "k",
          kernelmatrix: "kernelMatrix",
          kernelunitlength: "kernelUnitLength",
          kerning: "kerning",
          keypoints: "keyPoints",
          keysplines: "keySplines",
          keytimes: "keyTimes",
          lengthadjust: "lengthAdjust",
          letterspacing: "letterSpacing",
          "letter-spacing": "letterSpacing",
          lightingcolor: "lightingColor",
          "lighting-color": "lightingColor",
          limitingconeangle: "limitingConeAngle",
          local: "local",
          markerend: "markerEnd",
          "marker-end": "markerEnd",
          markerheight: "markerHeight",
          markermid: "markerMid",
          "marker-mid": "markerMid",
          markerstart: "markerStart",
          "marker-start": "markerStart",
          markerunits: "markerUnits",
          markerwidth: "markerWidth",
          mask: "mask",
          maskcontentunits: "maskContentUnits",
          maskunits: "maskUnits",
          mathematical: "mathematical",
          mode: "mode",
          numoctaves: "numOctaves",
          offset: "offset",
          opacity: "opacity",
          operator: "operator",
          order: "order",
          orient: "orient",
          orientation: "orientation",
          origin: "origin",
          overflow: "overflow",
          overlineposition: "overlinePosition",
          "overline-position": "overlinePosition",
          overlinethickness: "overlineThickness",
          "overline-thickness": "overlineThickness",
          paintorder: "paintOrder",
          "paint-order": "paintOrder",
          panose1: "panose1",
          "panose-1": "panose1",
          pathlength: "pathLength",
          patterncontentunits: "patternContentUnits",
          patterntransform: "patternTransform",
          patternunits: "patternUnits",
          pointerevents: "pointerEvents",
          "pointer-events": "pointerEvents",
          points: "points",
          pointsatx: "pointsAtX",
          pointsaty: "pointsAtY",
          pointsatz: "pointsAtZ",
          prefix: "prefix",
          preservealpha: "preserveAlpha",
          preserveaspectratio: "preserveAspectRatio",
          primitiveunits: "primitiveUnits",
          property: "property",
          r: "r",
          radius: "radius",
          refx: "refX",
          refy: "refY",
          renderingintent: "renderingIntent",
          "rendering-intent": "renderingIntent",
          repeatcount: "repeatCount",
          repeatdur: "repeatDur",
          requiredextensions: "requiredExtensions",
          requiredfeatures: "requiredFeatures",
          resource: "resource",
          restart: "restart",
          result: "result",
          results: "results",
          rotate: "rotate",
          rx: "rx",
          ry: "ry",
          scale: "scale",
          security: "security",
          seed: "seed",
          shaperendering: "shapeRendering",
          "shape-rendering": "shapeRendering",
          slope: "slope",
          spacing: "spacing",
          specularconstant: "specularConstant",
          specularexponent: "specularExponent",
          speed: "speed",
          spreadmethod: "spreadMethod",
          startoffset: "startOffset",
          stddeviation: "stdDeviation",
          stemh: "stemh",
          stemv: "stemv",
          stitchtiles: "stitchTiles",
          stopcolor: "stopColor",
          "stop-color": "stopColor",
          stopopacity: "stopOpacity",
          "stop-opacity": "stopOpacity",
          strikethroughposition: "strikethroughPosition",
          "strikethrough-position": "strikethroughPosition",
          strikethroughthickness: "strikethroughThickness",
          "strikethrough-thickness": "strikethroughThickness",
          string: "string",
          stroke: "stroke",
          strokedasharray: "strokeDasharray",
          "stroke-dasharray": "strokeDasharray",
          strokedashoffset: "strokeDashoffset",
          "stroke-dashoffset": "strokeDashoffset",
          strokelinecap: "strokeLinecap",
          "stroke-linecap": "strokeLinecap",
          strokelinejoin: "strokeLinejoin",
          "stroke-linejoin": "strokeLinejoin",
          strokemiterlimit: "strokeMiterlimit",
          "stroke-miterlimit": "strokeMiterlimit",
          strokewidth: "strokeWidth",
          "stroke-width": "strokeWidth",
          strokeopacity: "strokeOpacity",
          "stroke-opacity": "strokeOpacity",
          suppresscontenteditablewarning: "suppressContentEditableWarning",
          suppresshydrationwarning: "suppressHydrationWarning",
          surfacescale: "surfaceScale",
          systemlanguage: "systemLanguage",
          tablevalues: "tableValues",
          targetx: "targetX",
          targety: "targetY",
          textanchor: "textAnchor",
          "text-anchor": "textAnchor",
          textdecoration: "textDecoration",
          "text-decoration": "textDecoration",
          textlength: "textLength",
          textrendering: "textRendering",
          "text-rendering": "textRendering",
          to: "to",
          transform: "transform",
          typeof: "typeof",
          u1: "u1",
          u2: "u2",
          underlineposition: "underlinePosition",
          "underline-position": "underlinePosition",
          underlinethickness: "underlineThickness",
          "underline-thickness": "underlineThickness",
          unicode: "unicode",
          unicodebidi: "unicodeBidi",
          "unicode-bidi": "unicodeBidi",
          unicoderange: "unicodeRange",
          "unicode-range": "unicodeRange",
          unitsperem: "unitsPerEm",
          "units-per-em": "unitsPerEm",
          unselectable: "unselectable",
          valphabetic: "vAlphabetic",
          "v-alphabetic": "vAlphabetic",
          values: "values",
          vectoreffect: "vectorEffect",
          "vector-effect": "vectorEffect",
          version: "version",
          vertadvy: "vertAdvY",
          "vert-adv-y": "vertAdvY",
          vertoriginx: "vertOriginX",
          "vert-origin-x": "vertOriginX",
          vertoriginy: "vertOriginY",
          "vert-origin-y": "vertOriginY",
          vhanging: "vHanging",
          "v-hanging": "vHanging",
          videographic: "vIdeographic",
          "v-ideographic": "vIdeographic",
          viewbox: "viewBox",
          viewtarget: "viewTarget",
          visibility: "visibility",
          vmathematical: "vMathematical",
          "v-mathematical": "vMathematical",
          vocab: "vocab",
          widths: "widths",
          wordspacing: "wordSpacing",
          "word-spacing": "wordSpacing",
          writingmode: "writingMode",
          "writing-mode": "writingMode",
          x1: "x1",
          x2: "x2",
          x: "x",
          xchannelselector: "xChannelSelector",
          xheight: "xHeight",
          "x-height": "xHeight",
          xlinkactuate: "xlinkActuate",
          "xlink:actuate": "xlinkActuate",
          xlinkarcrole: "xlinkArcrole",
          "xlink:arcrole": "xlinkArcrole",
          xlinkhref: "xlinkHref",
          "xlink:href": "xlinkHref",
          xlinkrole: "xlinkRole",
          "xlink:role": "xlinkRole",
          xlinkshow: "xlinkShow",
          "xlink:show": "xlinkShow",
          xlinktitle: "xlinkTitle",
          "xlink:title": "xlinkTitle",
          xlinktype: "xlinkType",
          "xlink:type": "xlinkType",
          xmlbase: "xmlBase",
          "xml:base": "xmlBase",
          xmllang: "xmlLang",
          "xml:lang": "xmlLang",
          xmlns: "xmlns",
          "xml:space": "xmlSpace",
          xmlnsxlink: "xmlnsXlink",
          "xmlns:xlink": "xmlnsXlink",
          xmlspace: "xmlSpace",
          y1: "y1",
          y2: "y2",
          y: "y",
          ychannelselector: "yChannelSelector",
          z: "z",
          zoomandpan: "zoomAndPan"
        };
        var validateProperty$1 = function() {
        };
        {
          var warnedProperties$1 = {};
          var EVENT_NAME_REGEX = /^on./;
          var INVALID_EVENT_NAME_REGEX = /^on[^A-Z]/;
          var rARIA$1 = new RegExp("^(aria)-[" + ATTRIBUTE_NAME_CHAR + "]*$");
          var rARIACamel$1 = new RegExp("^(aria)[A-Z][" + ATTRIBUTE_NAME_CHAR + "]*$");
          validateProperty$1 = function(tagName, name, value, eventRegistry) {
            if (hasOwnProperty.call(warnedProperties$1, name) && warnedProperties$1[name]) {
              return true;
            }
            var lowerCasedName = name.toLowerCase();
            if (lowerCasedName === "onfocusin" || lowerCasedName === "onfocusout") {
              error("React uses onFocus and onBlur instead of onFocusIn and onFocusOut. All React events are normalized to bubble, so onFocusIn and onFocusOut are not needed/supported by React.");
              warnedProperties$1[name] = true;
              return true;
            }
            if (eventRegistry != null) {
              var registrationNameDependencies = eventRegistry.registrationNameDependencies, possibleRegistrationNames = eventRegistry.possibleRegistrationNames;
              if (registrationNameDependencies.hasOwnProperty(name)) {
                return true;
              }
              var registrationName = possibleRegistrationNames.hasOwnProperty(lowerCasedName) ? possibleRegistrationNames[lowerCasedName] : null;
              if (registrationName != null) {
                error("Invalid event handler property `%s`. Did you mean `%s`?", name, registrationName);
                warnedProperties$1[name] = true;
                return true;
              }
              if (EVENT_NAME_REGEX.test(name)) {
                error("Unknown event handler property `%s`. It will be ignored.", name);
                warnedProperties$1[name] = true;
                return true;
              }
            } else if (EVENT_NAME_REGEX.test(name)) {
              if (INVALID_EVENT_NAME_REGEX.test(name)) {
                error("Invalid event handler property `%s`. React events use the camelCase naming convention, for example `onClick`.", name);
              }
              warnedProperties$1[name] = true;
              return true;
            }
            if (rARIA$1.test(name) || rARIACamel$1.test(name)) {
              return true;
            }
            if (lowerCasedName === "innerhtml") {
              error("Directly setting property `innerHTML` is not permitted. For more information, lookup documentation on `dangerouslySetInnerHTML`.");
              warnedProperties$1[name] = true;
              return true;
            }
            if (lowerCasedName === "aria") {
              error("The `aria` attribute is reserved for future use in React. Pass individual `aria-` attributes instead.");
              warnedProperties$1[name] = true;
              return true;
            }
            if (lowerCasedName === "is" && value !== null && value !== void 0 && typeof value !== "string") {
              error("Received a `%s` for a string attribute `is`. If this is expected, cast the value to a string.", typeof value);
              warnedProperties$1[name] = true;
              return true;
            }
            if (typeof value === "number" && isNaN(value)) {
              error("Received NaN for the `%s` attribute. If this is expected, cast the value to a string.", name);
              warnedProperties$1[name] = true;
              return true;
            }
            var propertyInfo = getPropertyInfo(name);
            var isReserved = propertyInfo !== null && propertyInfo.type === RESERVED;
            if (possibleStandardNames.hasOwnProperty(lowerCasedName)) {
              var standardName = possibleStandardNames[lowerCasedName];
              if (standardName !== name) {
                error("Invalid DOM property `%s`. Did you mean `%s`?", name, standardName);
                warnedProperties$1[name] = true;
                return true;
              }
            } else if (!isReserved && name !== lowerCasedName) {
              error("React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element.", name, lowerCasedName);
              warnedProperties$1[name] = true;
              return true;
            }
            if (typeof value === "boolean" && shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
              if (value) {
                error('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.', value, name, name, value, name);
              } else {
                error('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.\n\nIf you used to conditionally omit it with %s={condition && value}, pass %s={condition ? value : undefined} instead.', value, name, name, value, name, name, name);
              }
              warnedProperties$1[name] = true;
              return true;
            }
            if (isReserved) {
              return true;
            }
            if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
              warnedProperties$1[name] = true;
              return false;
            }
            if ((value === "false" || value === "true") && propertyInfo !== null && propertyInfo.type === BOOLEAN) {
              error("Received the string `%s` for the boolean attribute `%s`. %s Did you mean %s={%s}?", value, name, value === "false" ? "The browser will interpret it as a truthy value." : 'Although this works, it will not work as expected if you pass the string "false".', name, value);
              warnedProperties$1[name] = true;
              return true;
            }
            return true;
          };
        }
        var warnUnknownProperties = function(type, props, eventRegistry) {
          {
            var unknownProps = [];
            for (var key in props) {
              var isValid = validateProperty$1(type, key, props[key], eventRegistry);
              if (!isValid) {
                unknownProps.push(key);
              }
            }
            var unknownPropString = unknownProps.map(function(prop) {
              return "`" + prop + "`";
            }).join(", ");
            if (unknownProps.length === 1) {
              error("Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", unknownPropString, type);
            } else if (unknownProps.length > 1) {
              error("Invalid values for props %s on <%s> tag. Either remove them from the element, or pass a string or number value to keep them in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", unknownPropString, type);
            }
          }
        };
        function validateProperties$2(type, props, eventRegistry) {
          if (isCustomComponent(type, props)) {
            return;
          }
          warnUnknownProperties(type, props, eventRegistry);
        }
        var warnValidStyle = function() {
        };
        {
          var badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;
          var msPattern = /^-ms-/;
          var hyphenPattern = /-(.)/g;
          var badStyleValueWithSemicolonPattern = /;\s*$/;
          var warnedStyleNames = {};
          var warnedStyleValues = {};
          var warnedForNaNValue = false;
          var warnedForInfinityValue = false;
          var camelize = function(string) {
            return string.replace(hyphenPattern, function(_, character) {
              return character.toUpperCase();
            });
          };
          var warnHyphenatedStyleName = function(name) {
            if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
              return;
            }
            warnedStyleNames[name] = true;
            error(
              "Unsupported style property %s. Did you mean %s?",
              name,
              // As Andi Smith suggests
              // (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
              // is converted to lowercase `ms`.
              camelize(name.replace(msPattern, "ms-"))
            );
          };
          var warnBadVendoredStyleName = function(name) {
            if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
              return;
            }
            warnedStyleNames[name] = true;
            error("Unsupported vendor-prefixed style property %s. Did you mean %s?", name, name.charAt(0).toUpperCase() + name.slice(1));
          };
          var warnStyleValueWithSemicolon = function(name, value) {
            if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
              return;
            }
            warnedStyleValues[value] = true;
            error(`Style property values shouldn't contain a semicolon. Try "%s: %s" instead.`, name, value.replace(badStyleValueWithSemicolonPattern, ""));
          };
          var warnStyleValueIsNaN = function(name, value) {
            if (warnedForNaNValue) {
              return;
            }
            warnedForNaNValue = true;
            error("`NaN` is an invalid value for the `%s` css style property.", name);
          };
          var warnStyleValueIsInfinity = function(name, value) {
            if (warnedForInfinityValue) {
              return;
            }
            warnedForInfinityValue = true;
            error("`Infinity` is an invalid value for the `%s` css style property.", name);
          };
          warnValidStyle = function(name, value) {
            if (name.indexOf("-") > -1) {
              warnHyphenatedStyleName(name);
            } else if (badVendoredStyleNamePattern.test(name)) {
              warnBadVendoredStyleName(name);
            } else if (badStyleValueWithSemicolonPattern.test(value)) {
              warnStyleValueWithSemicolon(name, value);
            }
            if (typeof value === "number") {
              if (isNaN(value)) {
                warnStyleValueIsNaN(name, value);
              } else if (!isFinite(value)) {
                warnStyleValueIsInfinity(name, value);
              }
            }
          };
        }
        var warnValidStyle$1 = warnValidStyle;
        var matchHtmlRegExp = /["'&<>]/;
        function escapeHtml(string) {
          {
            checkHtmlStringCoercion(string);
          }
          var str = "" + string;
          var match = matchHtmlRegExp.exec(str);
          if (!match) {
            return str;
          }
          var escape;
          var html = "";
          var index;
          var lastIndex = 0;
          for (index = match.index; index < str.length; index++) {
            switch (str.charCodeAt(index)) {
              case 34:
                escape = "&quot;";
                break;
              case 38:
                escape = "&amp;";
                break;
              case 39:
                escape = "&#x27;";
                break;
              case 60:
                escape = "&lt;";
                break;
              case 62:
                escape = "&gt;";
                break;
              default:
                continue;
            }
            if (lastIndex !== index) {
              html += str.substring(lastIndex, index);
            }
            lastIndex = index + 1;
            html += escape;
          }
          return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
        }
        function escapeTextForBrowser(text) {
          if (typeof text === "boolean" || typeof text === "number") {
            return "" + text;
          }
          return escapeHtml(text);
        }
        var uppercasePattern = /([A-Z])/g;
        var msPattern$1 = /^ms-/;
        function hyphenateStyleName(name) {
          return name.replace(uppercasePattern, "-$1").toLowerCase().replace(msPattern$1, "-ms-");
        }
        var isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;
        var didWarn = false;
        function sanitizeURL(url) {
          {
            if (!didWarn && isJavaScriptProtocol.test(url)) {
              didWarn = true;
              error("A future version of React will block javascript: URLs as a security precaution. Use event handlers instead if you can. If you need to generate unsafe HTML try using dangerouslySetInnerHTML instead. React was passed %s.", JSON.stringify(url));
            }
          }
        }
        var isArrayImpl = Array.isArray;
        function isArray(a) {
          return isArrayImpl(a);
        }
        var startInlineScript = stringToPrecomputedChunk("<script>");
        var endInlineScript = stringToPrecomputedChunk("</script>");
        var startScriptSrc = stringToPrecomputedChunk('<script src="');
        var startModuleSrc = stringToPrecomputedChunk('<script type="module" src="');
        var endAsyncScript = stringToPrecomputedChunk('" async=""></script>');
        function escapeBootstrapScriptContent(scriptText) {
          {
            checkHtmlStringCoercion(scriptText);
          }
          return ("" + scriptText).replace(scriptRegex, scriptReplacer);
        }
        var scriptRegex = /(<\/|<)(s)(cript)/gi;
        var scriptReplacer = function(match, prefix2, s, suffix) {
          return "" + prefix2 + (s === "s" ? "\\u0073" : "\\u0053") + suffix;
        };
        function createResponseState(identifierPrefix, nonce, bootstrapScriptContent, bootstrapScripts, bootstrapModules) {
          var idPrefix = identifierPrefix === void 0 ? "" : identifierPrefix;
          var inlineScriptWithNonce = nonce === void 0 ? startInlineScript : stringToPrecomputedChunk('<script nonce="' + escapeTextForBrowser(nonce) + '">');
          var bootstrapChunks = [];
          if (bootstrapScriptContent !== void 0) {
            bootstrapChunks.push(inlineScriptWithNonce, stringToChunk(escapeBootstrapScriptContent(bootstrapScriptContent)), endInlineScript);
          }
          if (bootstrapScripts !== void 0) {
            for (var i = 0; i < bootstrapScripts.length; i++) {
              bootstrapChunks.push(startScriptSrc, stringToChunk(escapeTextForBrowser(bootstrapScripts[i])), endAsyncScript);
            }
          }
          if (bootstrapModules !== void 0) {
            for (var _i = 0; _i < bootstrapModules.length; _i++) {
              bootstrapChunks.push(startModuleSrc, stringToChunk(escapeTextForBrowser(bootstrapModules[_i])), endAsyncScript);
            }
          }
          return {
            bootstrapChunks,
            startInlineScript: inlineScriptWithNonce,
            placeholderPrefix: stringToPrecomputedChunk(idPrefix + "P:"),
            segmentPrefix: stringToPrecomputedChunk(idPrefix + "S:"),
            boundaryPrefix: idPrefix + "B:",
            idPrefix,
            nextSuspenseID: 0,
            sentCompleteSegmentFunction: false,
            sentCompleteBoundaryFunction: false,
            sentClientRenderFunction: false
          };
        }
        var ROOT_HTML_MODE = 0;
        var HTML_MODE = 1;
        var SVG_MODE = 2;
        var MATHML_MODE = 3;
        var HTML_TABLE_MODE = 4;
        var HTML_TABLE_BODY_MODE = 5;
        var HTML_TABLE_ROW_MODE = 6;
        var HTML_COLGROUP_MODE = 7;
        function createFormatContext(insertionMode, selectedValue) {
          return {
            insertionMode,
            selectedValue
          };
        }
        function createRootFormatContext(namespaceURI) {
          var insertionMode = namespaceURI === "http://www.w3.org/2000/svg" ? SVG_MODE : namespaceURI === "http://www.w3.org/1998/Math/MathML" ? MATHML_MODE : ROOT_HTML_MODE;
          return createFormatContext(insertionMode, null);
        }
        function getChildFormatContext(parentContext, type, props) {
          switch (type) {
            case "select":
              return createFormatContext(HTML_MODE, props.value != null ? props.value : props.defaultValue);
            case "svg":
              return createFormatContext(SVG_MODE, null);
            case "math":
              return createFormatContext(MATHML_MODE, null);
            case "foreignObject":
              return createFormatContext(HTML_MODE, null);
            // Table parents are special in that their children can only be created at all if they're
            // wrapped in a table parent. So we need to encode that we're entering this mode.
            case "table":
              return createFormatContext(HTML_TABLE_MODE, null);
            case "thead":
            case "tbody":
            case "tfoot":
              return createFormatContext(HTML_TABLE_BODY_MODE, null);
            case "colgroup":
              return createFormatContext(HTML_COLGROUP_MODE, null);
            case "tr":
              return createFormatContext(HTML_TABLE_ROW_MODE, null);
          }
          if (parentContext.insertionMode >= HTML_TABLE_MODE) {
            return createFormatContext(HTML_MODE, null);
          }
          if (parentContext.insertionMode === ROOT_HTML_MODE) {
            return createFormatContext(HTML_MODE, null);
          }
          return parentContext;
        }
        var UNINITIALIZED_SUSPENSE_BOUNDARY_ID = null;
        function assignSuspenseBoundaryID(responseState) {
          var generatedID = responseState.nextSuspenseID++;
          return stringToPrecomputedChunk(responseState.boundaryPrefix + generatedID.toString(16));
        }
        function makeId(responseState, treeId, localId) {
          var idPrefix = responseState.idPrefix;
          var id = ":" + idPrefix + "R" + treeId;
          if (localId > 0) {
            id += "H" + localId.toString(32);
          }
          return id + ":";
        }
        function encodeHTMLTextNode(text) {
          return escapeTextForBrowser(text);
        }
        var textSeparator = stringToPrecomputedChunk("<!-- -->");
        function pushTextInstance(target, text, responseState, textEmbedded) {
          if (text === "") {
            return textEmbedded;
          }
          if (textEmbedded) {
            target.push(textSeparator);
          }
          target.push(stringToChunk(encodeHTMLTextNode(text)));
          return true;
        }
        function pushSegmentFinale(target, responseState, lastPushedText, textEmbedded) {
          if (lastPushedText && textEmbedded) {
            target.push(textSeparator);
          }
        }
        var styleNameCache = /* @__PURE__ */ new Map();
        function processStyleName(styleName) {
          var chunk = styleNameCache.get(styleName);
          if (chunk !== void 0) {
            return chunk;
          }
          var result = stringToPrecomputedChunk(escapeTextForBrowser(hyphenateStyleName(styleName)));
          styleNameCache.set(styleName, result);
          return result;
        }
        var styleAttributeStart = stringToPrecomputedChunk(' style="');
        var styleAssign = stringToPrecomputedChunk(":");
        var styleSeparator = stringToPrecomputedChunk(";");
        function pushStyle(target, responseState, style) {
          if (typeof style !== "object") {
            throw new Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
          }
          var isFirst = true;
          for (var styleName in style) {
            if (!hasOwnProperty.call(style, styleName)) {
              continue;
            }
            var styleValue = style[styleName];
            if (styleValue == null || typeof styleValue === "boolean" || styleValue === "") {
              continue;
            }
            var nameChunk = void 0;
            var valueChunk = void 0;
            var isCustomProperty = styleName.indexOf("--") === 0;
            if (isCustomProperty) {
              nameChunk = stringToChunk(escapeTextForBrowser(styleName));
              {
                checkCSSPropertyStringCoercion(styleValue, styleName);
              }
              valueChunk = stringToChunk(escapeTextForBrowser(("" + styleValue).trim()));
            } else {
              {
                warnValidStyle$1(styleName, styleValue);
              }
              nameChunk = processStyleName(styleName);
              if (typeof styleValue === "number") {
                if (styleValue !== 0 && !hasOwnProperty.call(isUnitlessNumber, styleName)) {
                  valueChunk = stringToChunk(styleValue + "px");
                } else {
                  valueChunk = stringToChunk("" + styleValue);
                }
              } else {
                {
                  checkCSSPropertyStringCoercion(styleValue, styleName);
                }
                valueChunk = stringToChunk(escapeTextForBrowser(("" + styleValue).trim()));
              }
            }
            if (isFirst) {
              isFirst = false;
              target.push(styleAttributeStart, nameChunk, styleAssign, valueChunk);
            } else {
              target.push(styleSeparator, nameChunk, styleAssign, valueChunk);
            }
          }
          if (!isFirst) {
            target.push(attributeEnd);
          }
        }
        var attributeSeparator = stringToPrecomputedChunk(" ");
        var attributeAssign = stringToPrecomputedChunk('="');
        var attributeEnd = stringToPrecomputedChunk('"');
        var attributeEmptyString = stringToPrecomputedChunk('=""');
        function pushAttribute(target, responseState, name, value) {
          switch (name) {
            case "style": {
              pushStyle(target, responseState, value);
              return;
            }
            case "defaultValue":
            case "defaultChecked":
            // These shouldn't be set as attributes on generic HTML elements.
            case "innerHTML":
            // Must use dangerouslySetInnerHTML instead.
            case "suppressContentEditableWarning":
            case "suppressHydrationWarning":
              return;
          }
          if (
            // shouldIgnoreAttribute
            // We have already filtered out null/undefined and reserved words.
            name.length > 2 && (name[0] === "o" || name[0] === "O") && (name[1] === "n" || name[1] === "N")
          ) {
            return;
          }
          var propertyInfo = getPropertyInfo(name);
          if (propertyInfo !== null) {
            switch (typeof value) {
              case "function":
              // $FlowIssue symbol is perfectly valid here
              case "symbol":
                return;
              case "boolean": {
                if (!propertyInfo.acceptsBooleans) {
                  return;
                }
              }
            }
            var attributeName = propertyInfo.attributeName;
            var attributeNameChunk = stringToChunk(attributeName);
            switch (propertyInfo.type) {
              case BOOLEAN:
                if (value) {
                  target.push(attributeSeparator, attributeNameChunk, attributeEmptyString);
                }
                return;
              case OVERLOADED_BOOLEAN:
                if (value === true) {
                  target.push(attributeSeparator, attributeNameChunk, attributeEmptyString);
                } else if (value === false) ;
                else {
                  target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
                }
                return;
              case NUMERIC:
                if (!isNaN(value)) {
                  target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
                }
                break;
              case POSITIVE_NUMERIC:
                if (!isNaN(value) && value >= 1) {
                  target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
                }
                break;
              default:
                if (propertyInfo.sanitizeURL) {
                  {
                    checkAttributeStringCoercion(value, attributeName);
                  }
                  value = "" + value;
                  sanitizeURL(value);
                }
                target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
            }
          } else if (isAttributeNameSafe(name)) {
            switch (typeof value) {
              case "function":
              // $FlowIssue symbol is perfectly valid here
              case "symbol":
                return;
              case "boolean": {
                var prefix2 = name.toLowerCase().slice(0, 5);
                if (prefix2 !== "data-" && prefix2 !== "aria-") {
                  return;
                }
              }
            }
            target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
          }
        }
        var endOfStartTag = stringToPrecomputedChunk(">");
        var endOfStartTagSelfClosing = stringToPrecomputedChunk("/>");
        function pushInnerHTML(target, innerHTML, children) {
          if (innerHTML != null) {
            if (children != null) {
              throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
            }
            if (typeof innerHTML !== "object" || !("__html" in innerHTML)) {
              throw new Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
            }
            var html = innerHTML.__html;
            if (html !== null && html !== void 0) {
              {
                checkHtmlStringCoercion(html);
              }
              target.push(stringToChunk("" + html));
            }
          }
        }
        var didWarnDefaultInputValue = false;
        var didWarnDefaultChecked = false;
        var didWarnDefaultSelectValue = false;
        var didWarnDefaultTextareaValue = false;
        var didWarnInvalidOptionChildren = false;
        var didWarnInvalidOptionInnerHTML = false;
        var didWarnSelectedSetOnOption = false;
        function checkSelectProp(props, propName) {
          {
            var value = props[propName];
            if (value != null) {
              var array = isArray(value);
              if (props.multiple && !array) {
                error("The `%s` prop supplied to <select> must be an array if `multiple` is true.", propName);
              } else if (!props.multiple && array) {
                error("The `%s` prop supplied to <select> must be a scalar value if `multiple` is false.", propName);
              }
            }
          }
        }
        function pushStartSelect(target, props, responseState) {
          {
            checkControlledValueProps("select", props);
            checkSelectProp(props, "value");
            checkSelectProp(props, "defaultValue");
            if (props.value !== void 0 && props.defaultValue !== void 0 && !didWarnDefaultSelectValue) {
              error("Select elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled select element and remove one of these props. More info: https://reactjs.org/link/controlled-components");
              didWarnDefaultSelectValue = true;
            }
          }
          target.push(startChunkForTag("select"));
          var children = null;
          var innerHTML = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                  children = propValue;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML = propValue;
                  break;
                case "defaultValue":
                case "value":
                  break;
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          target.push(endOfStartTag);
          pushInnerHTML(target, innerHTML, children);
          return children;
        }
        function flattenOptionChildren(children) {
          var content = "";
          React3.Children.forEach(children, function(child) {
            if (child == null) {
              return;
            }
            content += child;
            {
              if (!didWarnInvalidOptionChildren && typeof child !== "string" && typeof child !== "number") {
                didWarnInvalidOptionChildren = true;
                error("Cannot infer the option value of complex children. Pass a `value` prop or use a plain string as children to <option>.");
              }
            }
          });
          return content;
        }
        var selectedMarkerAttribute = stringToPrecomputedChunk(' selected=""');
        function pushStartOption(target, props, responseState, formatContext) {
          var selectedValue = formatContext.selectedValue;
          target.push(startChunkForTag("option"));
          var children = null;
          var value = null;
          var selected = null;
          var innerHTML = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                  children = propValue;
                  break;
                case "selected":
                  selected = propValue;
                  {
                    if (!didWarnSelectedSetOnOption) {
                      error("Use the `defaultValue` or `value` props on <select> instead of setting `selected` on <option>.");
                      didWarnSelectedSetOnOption = true;
                    }
                  }
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML = propValue;
                  break;
                // eslint-disable-next-line-no-fallthrough
                case "value":
                  value = propValue;
                // We intentionally fallthrough to also set the attribute on the node.
                // eslint-disable-next-line-no-fallthrough
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          if (selectedValue != null) {
            var stringValue;
            if (value !== null) {
              {
                checkAttributeStringCoercion(value, "value");
              }
              stringValue = "" + value;
            } else {
              {
                if (innerHTML !== null) {
                  if (!didWarnInvalidOptionInnerHTML) {
                    didWarnInvalidOptionInnerHTML = true;
                    error("Pass a `value` prop if you set dangerouslyInnerHTML so React knows which value should be selected.");
                  }
                }
              }
              stringValue = flattenOptionChildren(children);
            }
            if (isArray(selectedValue)) {
              for (var i = 0; i < selectedValue.length; i++) {
                {
                  checkAttributeStringCoercion(selectedValue[i], "value");
                }
                var v = "" + selectedValue[i];
                if (v === stringValue) {
                  target.push(selectedMarkerAttribute);
                  break;
                }
              }
            } else {
              {
                checkAttributeStringCoercion(selectedValue, "select.value");
              }
              if ("" + selectedValue === stringValue) {
                target.push(selectedMarkerAttribute);
              }
            }
          } else if (selected) {
            target.push(selectedMarkerAttribute);
          }
          target.push(endOfStartTag);
          pushInnerHTML(target, innerHTML, children);
          return children;
        }
        function pushInput(target, props, responseState) {
          {
            checkControlledValueProps("input", props);
            if (props.checked !== void 0 && props.defaultChecked !== void 0 && !didWarnDefaultChecked) {
              error("%s contains an input of type %s with both checked and defaultChecked props. Input elements must be either controlled or uncontrolled (specify either the checked prop, or the defaultChecked prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", "A component", props.type);
              didWarnDefaultChecked = true;
            }
            if (props.value !== void 0 && props.defaultValue !== void 0 && !didWarnDefaultInputValue) {
              error("%s contains an input of type %s with both value and defaultValue props. Input elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", "A component", props.type);
              didWarnDefaultInputValue = true;
            }
          }
          target.push(startChunkForTag("input"));
          var value = null;
          var defaultValue = null;
          var checked = null;
          var defaultChecked = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                case "dangerouslySetInnerHTML":
                  throw new Error("input is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
                // eslint-disable-next-line-no-fallthrough
                case "defaultChecked":
                  defaultChecked = propValue;
                  break;
                case "defaultValue":
                  defaultValue = propValue;
                  break;
                case "checked":
                  checked = propValue;
                  break;
                case "value":
                  value = propValue;
                  break;
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          if (checked !== null) {
            pushAttribute(target, responseState, "checked", checked);
          } else if (defaultChecked !== null) {
            pushAttribute(target, responseState, "checked", defaultChecked);
          }
          if (value !== null) {
            pushAttribute(target, responseState, "value", value);
          } else if (defaultValue !== null) {
            pushAttribute(target, responseState, "value", defaultValue);
          }
          target.push(endOfStartTagSelfClosing);
          return null;
        }
        function pushStartTextArea(target, props, responseState) {
          {
            checkControlledValueProps("textarea", props);
            if (props.value !== void 0 && props.defaultValue !== void 0 && !didWarnDefaultTextareaValue) {
              error("Textarea elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled textarea and remove one of these props. More info: https://reactjs.org/link/controlled-components");
              didWarnDefaultTextareaValue = true;
            }
          }
          target.push(startChunkForTag("textarea"));
          var value = null;
          var defaultValue = null;
          var children = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                  children = propValue;
                  break;
                case "value":
                  value = propValue;
                  break;
                case "defaultValue":
                  defaultValue = propValue;
                  break;
                case "dangerouslySetInnerHTML":
                  throw new Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
                // eslint-disable-next-line-no-fallthrough
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          if (value === null && defaultValue !== null) {
            value = defaultValue;
          }
          target.push(endOfStartTag);
          if (children != null) {
            {
              error("Use the `defaultValue` or `value` props instead of setting children on <textarea>.");
            }
            if (value != null) {
              throw new Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
            }
            if (isArray(children)) {
              if (children.length > 1) {
                throw new Error("<textarea> can only have at most one child.");
              }
              {
                checkHtmlStringCoercion(children[0]);
              }
              value = "" + children[0];
            }
            {
              checkHtmlStringCoercion(children);
            }
            value = "" + children;
          }
          if (typeof value === "string" && value[0] === "\n") {
            target.push(leadingNewline);
          }
          if (value !== null) {
            {
              checkAttributeStringCoercion(value, "value");
            }
            target.push(stringToChunk(encodeHTMLTextNode("" + value)));
          }
          return null;
        }
        function pushSelfClosing(target, props, tag, responseState) {
          target.push(startChunkForTag(tag));
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                case "dangerouslySetInnerHTML":
                  throw new Error(tag + " is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
                // eslint-disable-next-line-no-fallthrough
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          target.push(endOfStartTagSelfClosing);
          return null;
        }
        function pushStartMenuItem(target, props, responseState) {
          target.push(startChunkForTag("menuitem"));
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                case "dangerouslySetInnerHTML":
                  throw new Error("menuitems cannot have `children` nor `dangerouslySetInnerHTML`.");
                // eslint-disable-next-line-no-fallthrough
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          target.push(endOfStartTag);
          return null;
        }
        function pushStartTitle(target, props, responseState) {
          target.push(startChunkForTag("title"));
          var children = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                  children = propValue;
                  break;
                case "dangerouslySetInnerHTML":
                  throw new Error("`dangerouslySetInnerHTML` does not make sense on <title>.");
                // eslint-disable-next-line-no-fallthrough
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          target.push(endOfStartTag);
          {
            var child = Array.isArray(children) && children.length < 2 ? children[0] || null : children;
            if (Array.isArray(children) && children.length > 1) {
              error("A title element received an array with more than 1 element as children. In browsers title Elements can only have Text Nodes as children. If the children being rendered output more than a single text node in aggregate the browser will display markup and comments as text in the title and hydration will likely fail and fall back to client rendering");
            } else if (child != null && child.$$typeof != null) {
              error("A title element received a React element for children. In the browser title Elements can only have Text Nodes as children. If the children being rendered output more than a single text node in aggregate the browser will display markup and comments as text in the title and hydration will likely fail and fall back to client rendering");
            } else if (child != null && typeof child !== "string" && typeof child !== "number") {
              error("A title element received a value that was not a string or number for children. In the browser title Elements can only have Text Nodes as children. If the children being rendered output more than a single text node in aggregate the browser will display markup and comments as text in the title and hydration will likely fail and fall back to client rendering");
            }
          }
          return children;
        }
        function pushStartGenericElement(target, props, tag, responseState) {
          target.push(startChunkForTag(tag));
          var children = null;
          var innerHTML = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                  children = propValue;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML = propValue;
                  break;
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          target.push(endOfStartTag);
          pushInnerHTML(target, innerHTML, children);
          if (typeof children === "string") {
            target.push(stringToChunk(encodeHTMLTextNode(children)));
            return null;
          }
          return children;
        }
        function pushStartCustomElement(target, props, tag, responseState) {
          target.push(startChunkForTag(tag));
          var children = null;
          var innerHTML = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                  children = propValue;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML = propValue;
                  break;
                case "style":
                  pushStyle(target, responseState, propValue);
                  break;
                case "suppressContentEditableWarning":
                case "suppressHydrationWarning":
                  break;
                default:
                  if (isAttributeNameSafe(propKey) && typeof propValue !== "function" && typeof propValue !== "symbol") {
                    target.push(attributeSeparator, stringToChunk(propKey), attributeAssign, stringToChunk(escapeTextForBrowser(propValue)), attributeEnd);
                  }
                  break;
              }
            }
          }
          target.push(endOfStartTag);
          pushInnerHTML(target, innerHTML, children);
          return children;
        }
        var leadingNewline = stringToPrecomputedChunk("\n");
        function pushStartPreformattedElement(target, props, tag, responseState) {
          target.push(startChunkForTag(tag));
          var children = null;
          var innerHTML = null;
          for (var propKey in props) {
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (propValue == null) {
                continue;
              }
              switch (propKey) {
                case "children":
                  children = propValue;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML = propValue;
                  break;
                default:
                  pushAttribute(target, responseState, propKey, propValue);
                  break;
              }
            }
          }
          target.push(endOfStartTag);
          if (innerHTML != null) {
            if (children != null) {
              throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
            }
            if (typeof innerHTML !== "object" || !("__html" in innerHTML)) {
              throw new Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
            }
            var html = innerHTML.__html;
            if (html !== null && html !== void 0) {
              if (typeof html === "string" && html.length > 0 && html[0] === "\n") {
                target.push(leadingNewline, stringToChunk(html));
              } else {
                {
                  checkHtmlStringCoercion(html);
                }
                target.push(stringToChunk("" + html));
              }
            }
          }
          if (typeof children === "string" && children[0] === "\n") {
            target.push(leadingNewline);
          }
          return children;
        }
        var VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/;
        var validatedTagCache = /* @__PURE__ */ new Map();
        function startChunkForTag(tag) {
          var tagStartChunk = validatedTagCache.get(tag);
          if (tagStartChunk === void 0) {
            if (!VALID_TAG_REGEX.test(tag)) {
              throw new Error("Invalid tag: " + tag);
            }
            tagStartChunk = stringToPrecomputedChunk("<" + tag);
            validatedTagCache.set(tag, tagStartChunk);
          }
          return tagStartChunk;
        }
        var DOCTYPE = stringToPrecomputedChunk("<!DOCTYPE html>");
        function pushStartInstance(target, type, props, responseState, formatContext) {
          {
            validateProperties(type, props);
            validateProperties$1(type, props);
            validateProperties$2(type, props, null);
            if (!props.suppressContentEditableWarning && props.contentEditable && props.children != null) {
              error("A component is `contentEditable` and contains `children` managed by React. It is now your responsibility to guarantee that none of those nodes are unexpectedly modified or duplicated. This is probably not intentional.");
            }
            if (formatContext.insertionMode !== SVG_MODE && formatContext.insertionMode !== MATHML_MODE) {
              if (type.indexOf("-") === -1 && typeof props.is !== "string" && type.toLowerCase() !== type) {
                error("<%s /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.", type);
              }
            }
          }
          switch (type) {
            // Special tags
            case "select":
              return pushStartSelect(target, props, responseState);
            case "option":
              return pushStartOption(target, props, responseState, formatContext);
            case "textarea":
              return pushStartTextArea(target, props, responseState);
            case "input":
              return pushInput(target, props, responseState);
            case "menuitem":
              return pushStartMenuItem(target, props, responseState);
            case "title":
              return pushStartTitle(target, props, responseState);
            // Newline eating tags
            case "listing":
            case "pre": {
              return pushStartPreformattedElement(target, props, type, responseState);
            }
            // Omitted close tags
            case "area":
            case "base":
            case "br":
            case "col":
            case "embed":
            case "hr":
            case "img":
            case "keygen":
            case "link":
            case "meta":
            case "param":
            case "source":
            case "track":
            case "wbr": {
              return pushSelfClosing(target, props, type, responseState);
            }
            // These are reserved SVG and MathML elements, that are never custom elements.
            // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
            case "annotation-xml":
            case "color-profile":
            case "font-face":
            case "font-face-src":
            case "font-face-uri":
            case "font-face-format":
            case "font-face-name":
            case "missing-glyph": {
              return pushStartGenericElement(target, props, type, responseState);
            }
            case "html": {
              if (formatContext.insertionMode === ROOT_HTML_MODE) {
                target.push(DOCTYPE);
              }
              return pushStartGenericElement(target, props, type, responseState);
            }
            default: {
              if (type.indexOf("-") === -1 && typeof props.is !== "string") {
                return pushStartGenericElement(target, props, type, responseState);
              } else {
                return pushStartCustomElement(target, props, type, responseState);
              }
            }
          }
        }
        var endTag1 = stringToPrecomputedChunk("</");
        var endTag2 = stringToPrecomputedChunk(">");
        function pushEndInstance(target, type, props) {
          switch (type) {
            // Omitted close tags
            // TODO: Instead of repeating this switch we could try to pass a flag from above.
            // That would require returning a tuple. Which might be ok if it gets inlined.
            case "area":
            case "base":
            case "br":
            case "col":
            case "embed":
            case "hr":
            case "img":
            case "input":
            case "keygen":
            case "link":
            case "meta":
            case "param":
            case "source":
            case "track":
            case "wbr": {
              break;
            }
            default: {
              target.push(endTag1, stringToChunk(type), endTag2);
            }
          }
        }
        function writeCompletedRoot(destination, responseState) {
          var bootstrapChunks = responseState.bootstrapChunks;
          var i = 0;
          for (; i < bootstrapChunks.length - 1; i++) {
            writeChunk(destination, bootstrapChunks[i]);
          }
          if (i < bootstrapChunks.length) {
            return writeChunkAndReturn(destination, bootstrapChunks[i]);
          }
          return true;
        }
        var placeholder1 = stringToPrecomputedChunk('<template id="');
        var placeholder2 = stringToPrecomputedChunk('"></template>');
        function writePlaceholder(destination, responseState, id) {
          writeChunk(destination, placeholder1);
          writeChunk(destination, responseState.placeholderPrefix);
          var formattedID = stringToChunk(id.toString(16));
          writeChunk(destination, formattedID);
          return writeChunkAndReturn(destination, placeholder2);
        }
        var startCompletedSuspenseBoundary = stringToPrecomputedChunk("<!--$-->");
        var startPendingSuspenseBoundary1 = stringToPrecomputedChunk('<!--$?--><template id="');
        var startPendingSuspenseBoundary2 = stringToPrecomputedChunk('"></template>');
        var startClientRenderedSuspenseBoundary = stringToPrecomputedChunk("<!--$!-->");
        var endSuspenseBoundary = stringToPrecomputedChunk("<!--/$-->");
        var clientRenderedSuspenseBoundaryError1 = stringToPrecomputedChunk("<template");
        var clientRenderedSuspenseBoundaryErrorAttrInterstitial = stringToPrecomputedChunk('"');
        var clientRenderedSuspenseBoundaryError1A = stringToPrecomputedChunk(' data-dgst="');
        var clientRenderedSuspenseBoundaryError1B = stringToPrecomputedChunk(' data-msg="');
        var clientRenderedSuspenseBoundaryError1C = stringToPrecomputedChunk(' data-stck="');
        var clientRenderedSuspenseBoundaryError2 = stringToPrecomputedChunk("></template>");
        function writeStartCompletedSuspenseBoundary(destination, responseState) {
          return writeChunkAndReturn(destination, startCompletedSuspenseBoundary);
        }
        function writeStartPendingSuspenseBoundary(destination, responseState, id) {
          writeChunk(destination, startPendingSuspenseBoundary1);
          if (id === null) {
            throw new Error("An ID must have been assigned before we can complete the boundary.");
          }
          writeChunk(destination, id);
          return writeChunkAndReturn(destination, startPendingSuspenseBoundary2);
        }
        function writeStartClientRenderedSuspenseBoundary(destination, responseState, errorDigest, errorMesssage, errorComponentStack) {
          var result;
          result = writeChunkAndReturn(destination, startClientRenderedSuspenseBoundary);
          writeChunk(destination, clientRenderedSuspenseBoundaryError1);
          if (errorDigest) {
            writeChunk(destination, clientRenderedSuspenseBoundaryError1A);
            writeChunk(destination, stringToChunk(escapeTextForBrowser(errorDigest)));
            writeChunk(destination, clientRenderedSuspenseBoundaryErrorAttrInterstitial);
          }
          {
            if (errorMesssage) {
              writeChunk(destination, clientRenderedSuspenseBoundaryError1B);
              writeChunk(destination, stringToChunk(escapeTextForBrowser(errorMesssage)));
              writeChunk(destination, clientRenderedSuspenseBoundaryErrorAttrInterstitial);
            }
            if (errorComponentStack) {
              writeChunk(destination, clientRenderedSuspenseBoundaryError1C);
              writeChunk(destination, stringToChunk(escapeTextForBrowser(errorComponentStack)));
              writeChunk(destination, clientRenderedSuspenseBoundaryErrorAttrInterstitial);
            }
          }
          result = writeChunkAndReturn(destination, clientRenderedSuspenseBoundaryError2);
          return result;
        }
        function writeEndCompletedSuspenseBoundary(destination, responseState) {
          return writeChunkAndReturn(destination, endSuspenseBoundary);
        }
        function writeEndPendingSuspenseBoundary(destination, responseState) {
          return writeChunkAndReturn(destination, endSuspenseBoundary);
        }
        function writeEndClientRenderedSuspenseBoundary(destination, responseState) {
          return writeChunkAndReturn(destination, endSuspenseBoundary);
        }
        var startSegmentHTML = stringToPrecomputedChunk('<div hidden id="');
        var startSegmentHTML2 = stringToPrecomputedChunk('">');
        var endSegmentHTML = stringToPrecomputedChunk("</div>");
        var startSegmentSVG = stringToPrecomputedChunk('<svg aria-hidden="true" style="display:none" id="');
        var startSegmentSVG2 = stringToPrecomputedChunk('">');
        var endSegmentSVG = stringToPrecomputedChunk("</svg>");
        var startSegmentMathML = stringToPrecomputedChunk('<math aria-hidden="true" style="display:none" id="');
        var startSegmentMathML2 = stringToPrecomputedChunk('">');
        var endSegmentMathML = stringToPrecomputedChunk("</math>");
        var startSegmentTable = stringToPrecomputedChunk('<table hidden id="');
        var startSegmentTable2 = stringToPrecomputedChunk('">');
        var endSegmentTable = stringToPrecomputedChunk("</table>");
        var startSegmentTableBody = stringToPrecomputedChunk('<table hidden><tbody id="');
        var startSegmentTableBody2 = stringToPrecomputedChunk('">');
        var endSegmentTableBody = stringToPrecomputedChunk("</tbody></table>");
        var startSegmentTableRow = stringToPrecomputedChunk('<table hidden><tr id="');
        var startSegmentTableRow2 = stringToPrecomputedChunk('">');
        var endSegmentTableRow = stringToPrecomputedChunk("</tr></table>");
        var startSegmentColGroup = stringToPrecomputedChunk('<table hidden><colgroup id="');
        var startSegmentColGroup2 = stringToPrecomputedChunk('">');
        var endSegmentColGroup = stringToPrecomputedChunk("</colgroup></table>");
        function writeStartSegment(destination, responseState, formatContext, id) {
          switch (formatContext.insertionMode) {
            case ROOT_HTML_MODE:
            case HTML_MODE: {
              writeChunk(destination, startSegmentHTML);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentHTML2);
            }
            case SVG_MODE: {
              writeChunk(destination, startSegmentSVG);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentSVG2);
            }
            case MATHML_MODE: {
              writeChunk(destination, startSegmentMathML);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentMathML2);
            }
            case HTML_TABLE_MODE: {
              writeChunk(destination, startSegmentTable);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentTable2);
            }
            // TODO: For the rest of these, there will be extra wrapper nodes that never
            // get deleted from the document. We need to delete the table too as part
            // of the injected scripts. They are invisible though so it's not too terrible
            // and it's kind of an edge case to suspend in a table. Totally supported though.
            case HTML_TABLE_BODY_MODE: {
              writeChunk(destination, startSegmentTableBody);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentTableBody2);
            }
            case HTML_TABLE_ROW_MODE: {
              writeChunk(destination, startSegmentTableRow);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentTableRow2);
            }
            case HTML_COLGROUP_MODE: {
              writeChunk(destination, startSegmentColGroup);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentColGroup2);
            }
            default: {
              throw new Error("Unknown insertion mode. This is a bug in React.");
            }
          }
        }
        function writeEndSegment(destination, formatContext) {
          switch (formatContext.insertionMode) {
            case ROOT_HTML_MODE:
            case HTML_MODE: {
              return writeChunkAndReturn(destination, endSegmentHTML);
            }
            case SVG_MODE: {
              return writeChunkAndReturn(destination, endSegmentSVG);
            }
            case MATHML_MODE: {
              return writeChunkAndReturn(destination, endSegmentMathML);
            }
            case HTML_TABLE_MODE: {
              return writeChunkAndReturn(destination, endSegmentTable);
            }
            case HTML_TABLE_BODY_MODE: {
              return writeChunkAndReturn(destination, endSegmentTableBody);
            }
            case HTML_TABLE_ROW_MODE: {
              return writeChunkAndReturn(destination, endSegmentTableRow);
            }
            case HTML_COLGROUP_MODE: {
              return writeChunkAndReturn(destination, endSegmentColGroup);
            }
            default: {
              throw new Error("Unknown insertion mode. This is a bug in React.");
            }
          }
        }
        var completeSegmentFunction = "function $RS(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)}";
        var completeBoundaryFunction = 'function $RC(a,b){a=document.getElementById(a);b=document.getElementById(b);b.parentNode.removeChild(b);if(a){a=a.previousSibling;var f=a.parentNode,c=a.nextSibling,e=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d)if(0===e)break;else e--;else"$"!==d&&"$?"!==d&&"$!"!==d||e++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;b.firstChild;)f.insertBefore(b.firstChild,c);a.data="$";a._reactRetry&&a._reactRetry()}}';
        var clientRenderFunction = 'function $RX(b,c,d,e){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),b._reactRetry&&b._reactRetry())}';
        var completeSegmentScript1Full = stringToPrecomputedChunk(completeSegmentFunction + ';$RS("');
        var completeSegmentScript1Partial = stringToPrecomputedChunk('$RS("');
        var completeSegmentScript2 = stringToPrecomputedChunk('","');
        var completeSegmentScript3 = stringToPrecomputedChunk('")</script>');
        function writeCompletedSegmentInstruction(destination, responseState, contentSegmentID) {
          writeChunk(destination, responseState.startInlineScript);
          if (!responseState.sentCompleteSegmentFunction) {
            responseState.sentCompleteSegmentFunction = true;
            writeChunk(destination, completeSegmentScript1Full);
          } else {
            writeChunk(destination, completeSegmentScript1Partial);
          }
          writeChunk(destination, responseState.segmentPrefix);
          var formattedID = stringToChunk(contentSegmentID.toString(16));
          writeChunk(destination, formattedID);
          writeChunk(destination, completeSegmentScript2);
          writeChunk(destination, responseState.placeholderPrefix);
          writeChunk(destination, formattedID);
          return writeChunkAndReturn(destination, completeSegmentScript3);
        }
        var completeBoundaryScript1Full = stringToPrecomputedChunk(completeBoundaryFunction + ';$RC("');
        var completeBoundaryScript1Partial = stringToPrecomputedChunk('$RC("');
        var completeBoundaryScript2 = stringToPrecomputedChunk('","');
        var completeBoundaryScript3 = stringToPrecomputedChunk('")</script>');
        function writeCompletedBoundaryInstruction(destination, responseState, boundaryID, contentSegmentID) {
          writeChunk(destination, responseState.startInlineScript);
          if (!responseState.sentCompleteBoundaryFunction) {
            responseState.sentCompleteBoundaryFunction = true;
            writeChunk(destination, completeBoundaryScript1Full);
          } else {
            writeChunk(destination, completeBoundaryScript1Partial);
          }
          if (boundaryID === null) {
            throw new Error("An ID must have been assigned before we can complete the boundary.");
          }
          var formattedContentID = stringToChunk(contentSegmentID.toString(16));
          writeChunk(destination, boundaryID);
          writeChunk(destination, completeBoundaryScript2);
          writeChunk(destination, responseState.segmentPrefix);
          writeChunk(destination, formattedContentID);
          return writeChunkAndReturn(destination, completeBoundaryScript3);
        }
        var clientRenderScript1Full = stringToPrecomputedChunk(clientRenderFunction + ';$RX("');
        var clientRenderScript1Partial = stringToPrecomputedChunk('$RX("');
        var clientRenderScript1A = stringToPrecomputedChunk('"');
        var clientRenderScript2 = stringToPrecomputedChunk(")</script>");
        var clientRenderErrorScriptArgInterstitial = stringToPrecomputedChunk(",");
        function writeClientRenderBoundaryInstruction(destination, responseState, boundaryID, errorDigest, errorMessage, errorComponentStack) {
          writeChunk(destination, responseState.startInlineScript);
          if (!responseState.sentClientRenderFunction) {
            responseState.sentClientRenderFunction = true;
            writeChunk(destination, clientRenderScript1Full);
          } else {
            writeChunk(destination, clientRenderScript1Partial);
          }
          if (boundaryID === null) {
            throw new Error("An ID must have been assigned before we can complete the boundary.");
          }
          writeChunk(destination, boundaryID);
          writeChunk(destination, clientRenderScript1A);
          if (errorDigest || errorMessage || errorComponentStack) {
            writeChunk(destination, clientRenderErrorScriptArgInterstitial);
            writeChunk(destination, stringToChunk(escapeJSStringsForInstructionScripts(errorDigest || "")));
          }
          if (errorMessage || errorComponentStack) {
            writeChunk(destination, clientRenderErrorScriptArgInterstitial);
            writeChunk(destination, stringToChunk(escapeJSStringsForInstructionScripts(errorMessage || "")));
          }
          if (errorComponentStack) {
            writeChunk(destination, clientRenderErrorScriptArgInterstitial);
            writeChunk(destination, stringToChunk(escapeJSStringsForInstructionScripts(errorComponentStack)));
          }
          return writeChunkAndReturn(destination, clientRenderScript2);
        }
        var regexForJSStringsInScripts = /[<\u2028\u2029]/g;
        function escapeJSStringsForInstructionScripts(input) {
          var escaped = JSON.stringify(input);
          return escaped.replace(regexForJSStringsInScripts, function(match) {
            switch (match) {
              // santizing breaking out of strings and script tags
              case "<":
                return "\\u003c";
              case "\u2028":
                return "\\u2028";
              case "\u2029":
                return "\\u2029";
              default: {
                throw new Error("escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
              }
            }
          });
        }
        var assign = Object.assign;
        var REACT_ELEMENT_TYPE = Symbol.for("react.element");
        var REACT_PORTAL_TYPE = Symbol.for("react.portal");
        var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
        var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
        var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
        var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
        var REACT_CONTEXT_TYPE = Symbol.for("react.context");
        var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
        var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
        var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
        var REACT_MEMO_TYPE = Symbol.for("react.memo");
        var REACT_LAZY_TYPE = Symbol.for("react.lazy");
        var REACT_SCOPE_TYPE = Symbol.for("react.scope");
        var REACT_DEBUG_TRACING_MODE_TYPE = Symbol.for("react.debug_trace_mode");
        var REACT_LEGACY_HIDDEN_TYPE = Symbol.for("react.legacy_hidden");
        var REACT_SERVER_CONTEXT_DEFAULT_VALUE_NOT_LOADED = Symbol.for("react.default_value");
        var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        var FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          if (maybeIterable === null || typeof maybeIterable !== "object") {
            return null;
          }
          var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
          if (typeof maybeIterator === "function") {
            return maybeIterator;
          }
          return null;
        }
        function getWrappedName(outerType, innerType, wrapperName) {
          var displayName = outerType.displayName;
          if (displayName) {
            return displayName;
          }
          var functionName = innerType.displayName || innerType.name || "";
          return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
        }
        function getContextName(type) {
          return type.displayName || "Context";
        }
        function getComponentNameFromType(type) {
          if (type == null) {
            return null;
          }
          {
            if (typeof type.tag === "number") {
              error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
            }
          }
          if (typeof type === "function") {
            return type.displayName || type.name || null;
          }
          if (typeof type === "string") {
            return type;
          }
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                var context = type;
                return getContextName(context) + ".Consumer";
              case REACT_PROVIDER_TYPE:
                var provider = type;
                return getContextName(provider._context) + ".Provider";
              case REACT_FORWARD_REF_TYPE:
                return getWrappedName(type, type.render, "ForwardRef");
              case REACT_MEMO_TYPE:
                var outerName = type.displayName || null;
                if (outerName !== null) {
                  return outerName;
                }
                return getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return getComponentNameFromType(init(payload));
                } catch (x) {
                  return null;
                }
              }
            }
          }
          return null;
        }
        var disabledDepth = 0;
        var prevLog;
        var prevInfo;
        var prevWarn;
        var prevError;
        var prevGroup;
        var prevGroupCollapsed;
        var prevGroupEnd;
        function disabledLog() {
        }
        disabledLog.__reactDisabledLog = true;
        function disableLogs() {
          {
            if (disabledDepth === 0) {
              prevLog = console.log;
              prevInfo = console.info;
              prevWarn = console.warn;
              prevError = console.error;
              prevGroup = console.group;
              prevGroupCollapsed = console.groupCollapsed;
              prevGroupEnd = console.groupEnd;
              var props = {
                configurable: true,
                enumerable: true,
                value: disabledLog,
                writable: true
              };
              Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
              });
            }
            disabledDepth++;
          }
        }
        function reenableLogs() {
          {
            disabledDepth--;
            if (disabledDepth === 0) {
              var props = {
                configurable: true,
                enumerable: true,
                writable: true
              };
              Object.defineProperties(console, {
                log: assign({}, props, {
                  value: prevLog
                }),
                info: assign({}, props, {
                  value: prevInfo
                }),
                warn: assign({}, props, {
                  value: prevWarn
                }),
                error: assign({}, props, {
                  value: prevError
                }),
                group: assign({}, props, {
                  value: prevGroup
                }),
                groupCollapsed: assign({}, props, {
                  value: prevGroupCollapsed
                }),
                groupEnd: assign({}, props, {
                  value: prevGroupEnd
                })
              });
            }
            if (disabledDepth < 0) {
              error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
            }
          }
        }
        var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
        var prefix;
        function describeBuiltInComponentFrame(name, source, ownerFn) {
          {
            if (prefix === void 0) {
              try {
                throw Error();
              } catch (x) {
                var match = x.stack.trim().match(/\n( *(at )?)/);
                prefix = match && match[1] || "";
              }
            }
            return "\n" + prefix + name;
          }
        }
        var reentry = false;
        var componentFrameCache;
        {
          var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
          componentFrameCache = new PossiblyWeakMap();
        }
        function describeNativeComponentFrame(fn, construct) {
          if (!fn || reentry) {
            return "";
          }
          {
            var frame = componentFrameCache.get(fn);
            if (frame !== void 0) {
              return frame;
            }
          }
          var control;
          reentry = true;
          var previousPrepareStackTrace = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          var previousDispatcher;
          {
            previousDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = null;
            disableLogs();
          }
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if (typeof Reflect === "object" && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x) {
                  control = x;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x) {
                control = x;
              }
              fn();
            }
          } catch (sample) {
            if (sample && control && typeof sample.stack === "string") {
              var sampleLines = sample.stack.split("\n");
              var controlLines = control.stack.split("\n");
              var s = sampleLines.length - 1;
              var c = controlLines.length - 1;
              while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                c--;
              }
              for (; s >= 1 && c >= 0; s--, c--) {
                if (sampleLines[s] !== controlLines[c]) {
                  if (s !== 1 || c !== 1) {
                    do {
                      s--;
                      c--;
                      if (c < 0 || sampleLines[s] !== controlLines[c]) {
                        var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                        if (fn.displayName && _frame.includes("<anonymous>")) {
                          _frame = _frame.replace("<anonymous>", fn.displayName);
                        }
                        {
                          if (typeof fn === "function") {
                            componentFrameCache.set(fn, _frame);
                          }
                        }
                        return _frame;
                      }
                    } while (s >= 1 && c >= 0);
                  }
                  break;
                }
              }
            }
          } finally {
            reentry = false;
            {
              ReactCurrentDispatcher.current = previousDispatcher;
              reenableLogs();
            }
            Error.prepareStackTrace = previousPrepareStackTrace;
          }
          var name = fn ? fn.displayName || fn.name : "";
          var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
          {
            if (typeof fn === "function") {
              componentFrameCache.set(fn, syntheticFrame);
            }
          }
          return syntheticFrame;
        }
        function describeClassComponentFrame(ctor, source, ownerFn) {
          {
            return describeNativeComponentFrame(ctor, true);
          }
        }
        function describeFunctionComponentFrame(fn, source, ownerFn) {
          {
            return describeNativeComponentFrame(fn, false);
          }
        }
        function shouldConstruct(Component) {
          var prototype = Component.prototype;
          return !!(prototype && prototype.isReactComponent);
        }
        function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
          if (type == null) {
            return "";
          }
          if (typeof type === "function") {
            {
              return describeNativeComponentFrame(type, shouldConstruct(type));
            }
          }
          if (typeof type === "string") {
            return describeBuiltInComponentFrame(type);
          }
          switch (type) {
            case REACT_SUSPENSE_TYPE:
              return describeBuiltInComponentFrame("Suspense");
            case REACT_SUSPENSE_LIST_TYPE:
              return describeBuiltInComponentFrame("SuspenseList");
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE:
                return describeFunctionComponentFrame(type.render);
              case REACT_MEMO_TYPE:
                return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x) {
                }
              }
            }
          }
          return "";
        }
        var loggedTypeFailures = {};
        var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame.setExtraStackFrame(null);
            }
          }
        }
        function checkPropTypes(typeSpecs, values, location, componentName, element) {
          {
            var has = Function.call.bind(hasOwnProperty);
            for (var typeSpecName in typeSpecs) {
              if (has(typeSpecs, typeSpecName)) {
                var error$1 = void 0;
                try {
                  if (typeof typeSpecs[typeSpecName] !== "function") {
                    var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                    err.name = "Invariant Violation";
                    throw err;
                  }
                  error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
                } catch (ex) {
                  error$1 = ex;
                }
                if (error$1 && !(error$1 instanceof Error)) {
                  setCurrentlyValidatingElement(element);
                  error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                  setCurrentlyValidatingElement(null);
                }
                if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                  loggedTypeFailures[error$1.message] = true;
                  setCurrentlyValidatingElement(element);
                  error("Failed %s type: %s", location, error$1.message);
                  setCurrentlyValidatingElement(null);
                }
              }
            }
          }
        }
        var warnedAboutMissingGetChildContext;
        {
          warnedAboutMissingGetChildContext = {};
        }
        var emptyContextObject = {};
        {
          Object.freeze(emptyContextObject);
        }
        function getMaskedContext(type, unmaskedContext) {
          {
            var contextTypes = type.contextTypes;
            if (!contextTypes) {
              return emptyContextObject;
            }
            var context = {};
            for (var key in contextTypes) {
              context[key] = unmaskedContext[key];
            }
            {
              var name = getComponentNameFromType(type) || "Unknown";
              checkPropTypes(contextTypes, context, "context", name);
            }
            return context;
          }
        }
        function processChildContext(instance, type, parentContext, childContextTypes) {
          {
            if (typeof instance.getChildContext !== "function") {
              {
                var componentName = getComponentNameFromType(type) || "Unknown";
                if (!warnedAboutMissingGetChildContext[componentName]) {
                  warnedAboutMissingGetChildContext[componentName] = true;
                  error("%s.childContextTypes is specified but there is no getChildContext() method on the instance. You can either define getChildContext() on %s or remove childContextTypes from it.", componentName, componentName);
                }
              }
              return parentContext;
            }
            var childContext = instance.getChildContext();
            for (var contextKey in childContext) {
              if (!(contextKey in childContextTypes)) {
                throw new Error((getComponentNameFromType(type) || "Unknown") + '.getChildContext(): key "' + contextKey + '" is not defined in childContextTypes.');
              }
            }
            {
              var name = getComponentNameFromType(type) || "Unknown";
              checkPropTypes(childContextTypes, childContext, "child context", name);
            }
            return assign({}, parentContext, childContext);
          }
        }
        var rendererSigil;
        {
          rendererSigil = {};
        }
        var rootContextSnapshot = null;
        var currentActiveSnapshot = null;
        function popNode(prev) {
          {
            prev.context._currentValue = prev.parentValue;
          }
        }
        function pushNode(next) {
          {
            next.context._currentValue = next.value;
          }
        }
        function popToNearestCommonAncestor(prev, next) {
          if (prev === next) ;
          else {
            popNode(prev);
            var parentPrev = prev.parent;
            var parentNext = next.parent;
            if (parentPrev === null) {
              if (parentNext !== null) {
                throw new Error("The stacks must reach the root at the same time. This is a bug in React.");
              }
            } else {
              if (parentNext === null) {
                throw new Error("The stacks must reach the root at the same time. This is a bug in React.");
              }
              popToNearestCommonAncestor(parentPrev, parentNext);
            }
            pushNode(next);
          }
        }
        function popAllPrevious(prev) {
          popNode(prev);
          var parentPrev = prev.parent;
          if (parentPrev !== null) {
            popAllPrevious(parentPrev);
          }
        }
        function pushAllNext(next) {
          var parentNext = next.parent;
          if (parentNext !== null) {
            pushAllNext(parentNext);
          }
          pushNode(next);
        }
        function popPreviousToCommonLevel(prev, next) {
          popNode(prev);
          var parentPrev = prev.parent;
          if (parentPrev === null) {
            throw new Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
          }
          if (parentPrev.depth === next.depth) {
            popToNearestCommonAncestor(parentPrev, next);
          } else {
            popPreviousToCommonLevel(parentPrev, next);
          }
        }
        function popNextToCommonLevel(prev, next) {
          var parentNext = next.parent;
          if (parentNext === null) {
            throw new Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
          }
          if (prev.depth === parentNext.depth) {
            popToNearestCommonAncestor(prev, parentNext);
          } else {
            popNextToCommonLevel(prev, parentNext);
          }
          pushNode(next);
        }
        function switchContext(newSnapshot) {
          var prev = currentActiveSnapshot;
          var next = newSnapshot;
          if (prev !== next) {
            if (prev === null) {
              pushAllNext(next);
            } else if (next === null) {
              popAllPrevious(prev);
            } else if (prev.depth === next.depth) {
              popToNearestCommonAncestor(prev, next);
            } else if (prev.depth > next.depth) {
              popPreviousToCommonLevel(prev, next);
            } else {
              popNextToCommonLevel(prev, next);
            }
            currentActiveSnapshot = next;
          }
        }
        function pushProvider(context, nextValue) {
          var prevValue;
          {
            prevValue = context._currentValue;
            context._currentValue = nextValue;
            {
              if (context._currentRenderer !== void 0 && context._currentRenderer !== null && context._currentRenderer !== rendererSigil) {
                error("Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported.");
              }
              context._currentRenderer = rendererSigil;
            }
          }
          var prevNode = currentActiveSnapshot;
          var newNode = {
            parent: prevNode,
            depth: prevNode === null ? 0 : prevNode.depth + 1,
            context,
            parentValue: prevValue,
            value: nextValue
          };
          currentActiveSnapshot = newNode;
          return newNode;
        }
        function popProvider(context) {
          var prevSnapshot = currentActiveSnapshot;
          if (prevSnapshot === null) {
            throw new Error("Tried to pop a Context at the root of the app. This is a bug in React.");
          }
          {
            if (prevSnapshot.context !== context) {
              error("The parent context is not the expected context. This is probably a bug in React.");
            }
          }
          {
            var value = prevSnapshot.parentValue;
            if (value === REACT_SERVER_CONTEXT_DEFAULT_VALUE_NOT_LOADED) {
              prevSnapshot.context._currentValue = prevSnapshot.context._defaultValue;
            } else {
              prevSnapshot.context._currentValue = value;
            }
            {
              if (context._currentRenderer !== void 0 && context._currentRenderer !== null && context._currentRenderer !== rendererSigil) {
                error("Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported.");
              }
              context._currentRenderer = rendererSigil;
            }
          }
          return currentActiveSnapshot = prevSnapshot.parent;
        }
        function getActiveContext() {
          return currentActiveSnapshot;
        }
        function readContext(context) {
          var value = context._currentValue;
          return value;
        }
        function get(key) {
          return key._reactInternals;
        }
        function set(key, value) {
          key._reactInternals = value;
        }
        var didWarnAboutNoopUpdateForComponent = {};
        var didWarnAboutDeprecatedWillMount = {};
        var didWarnAboutUninitializedState;
        var didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate;
        var didWarnAboutLegacyLifecyclesAndDerivedState;
        var didWarnAboutUndefinedDerivedState;
        var warnOnUndefinedDerivedState;
        var warnOnInvalidCallback;
        var didWarnAboutDirectlyAssigningPropsToState;
        var didWarnAboutContextTypeAndContextTypes;
        var didWarnAboutInvalidateContextType;
        {
          didWarnAboutUninitializedState = /* @__PURE__ */ new Set();
          didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate = /* @__PURE__ */ new Set();
          didWarnAboutLegacyLifecyclesAndDerivedState = /* @__PURE__ */ new Set();
          didWarnAboutDirectlyAssigningPropsToState = /* @__PURE__ */ new Set();
          didWarnAboutUndefinedDerivedState = /* @__PURE__ */ new Set();
          didWarnAboutContextTypeAndContextTypes = /* @__PURE__ */ new Set();
          didWarnAboutInvalidateContextType = /* @__PURE__ */ new Set();
          var didWarnOnInvalidCallback = /* @__PURE__ */ new Set();
          warnOnInvalidCallback = function(callback, callerName) {
            if (callback === null || typeof callback === "function") {
              return;
            }
            var key = callerName + "_" + callback;
            if (!didWarnOnInvalidCallback.has(key)) {
              didWarnOnInvalidCallback.add(key);
              error("%s(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", callerName, callback);
            }
          };
          warnOnUndefinedDerivedState = function(type, partialState) {
            if (partialState === void 0) {
              var componentName = getComponentNameFromType(type) || "Component";
              if (!didWarnAboutUndefinedDerivedState.has(componentName)) {
                didWarnAboutUndefinedDerivedState.add(componentName);
                error("%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. You have returned undefined.", componentName);
              }
            }
          };
        }
        function warnNoop(publicInstance, callerName) {
          {
            var _constructor = publicInstance.constructor;
            var componentName = _constructor && getComponentNameFromType(_constructor) || "ReactClass";
            var warningKey = componentName + "." + callerName;
            if (didWarnAboutNoopUpdateForComponent[warningKey]) {
              return;
            }
            error("%s(...): Can only update a mounting component. This usually means you called %s() outside componentWillMount() on the server. This is a no-op.\n\nPlease check the code for the %s component.", callerName, callerName, componentName);
            didWarnAboutNoopUpdateForComponent[warningKey] = true;
          }
        }
        var classComponentUpdater = {
          isMounted: function(inst) {
            return false;
          },
          enqueueSetState: function(inst, payload, callback) {
            var internals = get(inst);
            if (internals.queue === null) {
              warnNoop(inst, "setState");
            } else {
              internals.queue.push(payload);
              {
                if (callback !== void 0 && callback !== null) {
                  warnOnInvalidCallback(callback, "setState");
                }
              }
            }
          },
          enqueueReplaceState: function(inst, payload, callback) {
            var internals = get(inst);
            internals.replace = true;
            internals.queue = [payload];
            {
              if (callback !== void 0 && callback !== null) {
                warnOnInvalidCallback(callback, "setState");
              }
            }
          },
          enqueueForceUpdate: function(inst, callback) {
            var internals = get(inst);
            if (internals.queue === null) {
              warnNoop(inst, "forceUpdate");
            } else {
              {
                if (callback !== void 0 && callback !== null) {
                  warnOnInvalidCallback(callback, "setState");
                }
              }
            }
          }
        };
        function applyDerivedStateFromProps(instance, ctor, getDerivedStateFromProps, prevState, nextProps) {
          var partialState = getDerivedStateFromProps(nextProps, prevState);
          {
            warnOnUndefinedDerivedState(ctor, partialState);
          }
          var newState = partialState === null || partialState === void 0 ? prevState : assign({}, prevState, partialState);
          return newState;
        }
        function constructClassInstance(ctor, props, maskedLegacyContext) {
          var context = emptyContextObject;
          var contextType = ctor.contextType;
          {
            if ("contextType" in ctor) {
              var isValid = (
                // Allow null for conditional declaration
                contextType === null || contextType !== void 0 && contextType.$$typeof === REACT_CONTEXT_TYPE && contextType._context === void 0
              );
              if (!isValid && !didWarnAboutInvalidateContextType.has(ctor)) {
                didWarnAboutInvalidateContextType.add(ctor);
                var addendum = "";
                if (contextType === void 0) {
                  addendum = " However, it is set to undefined. This can be caused by a typo or by mixing up named and default imports. This can also happen due to a circular dependency, so try moving the createContext() call to a separate file.";
                } else if (typeof contextType !== "object") {
                  addendum = " However, it is set to a " + typeof contextType + ".";
                } else if (contextType.$$typeof === REACT_PROVIDER_TYPE) {
                  addendum = " Did you accidentally pass the Context.Provider instead?";
                } else if (contextType._context !== void 0) {
                  addendum = " Did you accidentally pass the Context.Consumer instead?";
                } else {
                  addendum = " However, it is set to an object with keys {" + Object.keys(contextType).join(", ") + "}.";
                }
                error("%s defines an invalid contextType. contextType should point to the Context object returned by React.createContext().%s", getComponentNameFromType(ctor) || "Component", addendum);
              }
            }
          }
          if (typeof contextType === "object" && contextType !== null) {
            context = readContext(contextType);
          } else {
            context = maskedLegacyContext;
          }
          var instance = new ctor(props, context);
          {
            if (typeof ctor.getDerivedStateFromProps === "function" && (instance.state === null || instance.state === void 0)) {
              var componentName = getComponentNameFromType(ctor) || "Component";
              if (!didWarnAboutUninitializedState.has(componentName)) {
                didWarnAboutUninitializedState.add(componentName);
                error("`%s` uses `getDerivedStateFromProps` but its initial state is %s. This is not recommended. Instead, define the initial state by assigning an object to `this.state` in the constructor of `%s`. This ensures that `getDerivedStateFromProps` arguments have a consistent shape.", componentName, instance.state === null ? "null" : "undefined", componentName);
              }
            }
            if (typeof ctor.getDerivedStateFromProps === "function" || typeof instance.getSnapshotBeforeUpdate === "function") {
              var foundWillMountName = null;
              var foundWillReceivePropsName = null;
              var foundWillUpdateName = null;
              if (typeof instance.componentWillMount === "function" && instance.componentWillMount.__suppressDeprecationWarning !== true) {
                foundWillMountName = "componentWillMount";
              } else if (typeof instance.UNSAFE_componentWillMount === "function") {
                foundWillMountName = "UNSAFE_componentWillMount";
              }
              if (typeof instance.componentWillReceiveProps === "function" && instance.componentWillReceiveProps.__suppressDeprecationWarning !== true) {
                foundWillReceivePropsName = "componentWillReceiveProps";
              } else if (typeof instance.UNSAFE_componentWillReceiveProps === "function") {
                foundWillReceivePropsName = "UNSAFE_componentWillReceiveProps";
              }
              if (typeof instance.componentWillUpdate === "function" && instance.componentWillUpdate.__suppressDeprecationWarning !== true) {
                foundWillUpdateName = "componentWillUpdate";
              } else if (typeof instance.UNSAFE_componentWillUpdate === "function") {
                foundWillUpdateName = "UNSAFE_componentWillUpdate";
              }
              if (foundWillMountName !== null || foundWillReceivePropsName !== null || foundWillUpdateName !== null) {
                var _componentName = getComponentNameFromType(ctor) || "Component";
                var newApiName = typeof ctor.getDerivedStateFromProps === "function" ? "getDerivedStateFromProps()" : "getSnapshotBeforeUpdate()";
                if (!didWarnAboutLegacyLifecyclesAndDerivedState.has(_componentName)) {
                  didWarnAboutLegacyLifecyclesAndDerivedState.add(_componentName);
                  error("Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n%s uses %s but also contains the following legacy lifecycles:%s%s%s\n\nThe above lifecycles should be removed. Learn more about this warning here:\nhttps://reactjs.org/link/unsafe-component-lifecycles", _componentName, newApiName, foundWillMountName !== null ? "\n  " + foundWillMountName : "", foundWillReceivePropsName !== null ? "\n  " + foundWillReceivePropsName : "", foundWillUpdateName !== null ? "\n  " + foundWillUpdateName : "");
                }
              }
            }
          }
          return instance;
        }
        function checkClassInstance(instance, ctor, newProps) {
          {
            var name = getComponentNameFromType(ctor) || "Component";
            var renderPresent = instance.render;
            if (!renderPresent) {
              if (ctor.prototype && typeof ctor.prototype.render === "function") {
                error("%s(...): No `render` method found on the returned component instance: did you accidentally return an object from the constructor?", name);
              } else {
                error("%s(...): No `render` method found on the returned component instance: you may have forgotten to define `render`.", name);
              }
            }
            if (instance.getInitialState && !instance.getInitialState.isReactClassApproved && !instance.state) {
              error("getInitialState was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Did you mean to define a state property instead?", name);
            }
            if (instance.getDefaultProps && !instance.getDefaultProps.isReactClassApproved) {
              error("getDefaultProps was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Use a static property to define defaultProps instead.", name);
            }
            if (instance.propTypes) {
              error("propTypes was defined as an instance property on %s. Use a static property to define propTypes instead.", name);
            }
            if (instance.contextType) {
              error("contextType was defined as an instance property on %s. Use a static property to define contextType instead.", name);
            }
            {
              if (instance.contextTypes) {
                error("contextTypes was defined as an instance property on %s. Use a static property to define contextTypes instead.", name);
              }
              if (ctor.contextType && ctor.contextTypes && !didWarnAboutContextTypeAndContextTypes.has(ctor)) {
                didWarnAboutContextTypeAndContextTypes.add(ctor);
                error("%s declares both contextTypes and contextType static properties. The legacy contextTypes property will be ignored.", name);
              }
            }
            if (typeof instance.componentShouldUpdate === "function") {
              error("%s has a method called componentShouldUpdate(). Did you mean shouldComponentUpdate()? The name is phrased as a question because the function is expected to return a value.", name);
            }
            if (ctor.prototype && ctor.prototype.isPureReactComponent && typeof instance.shouldComponentUpdate !== "undefined") {
              error("%s has a method called shouldComponentUpdate(). shouldComponentUpdate should not be used when extending React.PureComponent. Please extend React.Component if shouldComponentUpdate is used.", getComponentNameFromType(ctor) || "A pure component");
            }
            if (typeof instance.componentDidUnmount === "function") {
              error("%s has a method called componentDidUnmount(). But there is no such lifecycle method. Did you mean componentWillUnmount()?", name);
            }
            if (typeof instance.componentDidReceiveProps === "function") {
              error("%s has a method called componentDidReceiveProps(). But there is no such lifecycle method. If you meant to update the state in response to changing props, use componentWillReceiveProps(). If you meant to fetch data or run side-effects or mutations after React has updated the UI, use componentDidUpdate().", name);
            }
            if (typeof instance.componentWillRecieveProps === "function") {
              error("%s has a method called componentWillRecieveProps(). Did you mean componentWillReceiveProps()?", name);
            }
            if (typeof instance.UNSAFE_componentWillRecieveProps === "function") {
              error("%s has a method called UNSAFE_componentWillRecieveProps(). Did you mean UNSAFE_componentWillReceiveProps()?", name);
            }
            var hasMutatedProps = instance.props !== newProps;
            if (instance.props !== void 0 && hasMutatedProps) {
              error("%s(...): When calling super() in `%s`, make sure to pass up the same props that your component's constructor was passed.", name, name);
            }
            if (instance.defaultProps) {
              error("Setting defaultProps as an instance property on %s is not supported and will be ignored. Instead, define defaultProps as a static property on %s.", name, name);
            }
            if (typeof instance.getSnapshotBeforeUpdate === "function" && typeof instance.componentDidUpdate !== "function" && !didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.has(ctor)) {
              didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.add(ctor);
              error("%s: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). This component defines getSnapshotBeforeUpdate() only.", getComponentNameFromType(ctor));
            }
            if (typeof instance.getDerivedStateFromProps === "function") {
              error("%s: getDerivedStateFromProps() is defined as an instance method and will be ignored. Instead, declare it as a static method.", name);
            }
            if (typeof instance.getDerivedStateFromError === "function") {
              error("%s: getDerivedStateFromError() is defined as an instance method and will be ignored. Instead, declare it as a static method.", name);
            }
            if (typeof ctor.getSnapshotBeforeUpdate === "function") {
              error("%s: getSnapshotBeforeUpdate() is defined as a static method and will be ignored. Instead, declare it as an instance method.", name);
            }
            var _state = instance.state;
            if (_state && (typeof _state !== "object" || isArray(_state))) {
              error("%s.state: must be set to an object or null", name);
            }
            if (typeof instance.getChildContext === "function" && typeof ctor.childContextTypes !== "object") {
              error("%s.getChildContext(): childContextTypes must be defined in order to use getChildContext().", name);
            }
          }
        }
        function callComponentWillMount(type, instance) {
          var oldState = instance.state;
          if (typeof instance.componentWillMount === "function") {
            {
              if (instance.componentWillMount.__suppressDeprecationWarning !== true) {
                var componentName = getComponentNameFromType(type) || "Unknown";
                if (!didWarnAboutDeprecatedWillMount[componentName]) {
                  warn(
                    // keep this warning in sync with ReactStrictModeWarning.js
                    "componentWillMount has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.\n\n* Move code from componentWillMount to componentDidMount (preferred in most cases) or the constructor.\n\nPlease update the following components: %s",
                    componentName
                  );
                  didWarnAboutDeprecatedWillMount[componentName] = true;
                }
              }
            }
            instance.componentWillMount();
          }
          if (typeof instance.UNSAFE_componentWillMount === "function") {
            instance.UNSAFE_componentWillMount();
          }
          if (oldState !== instance.state) {
            {
              error("%s.componentWillMount(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.", getComponentNameFromType(type) || "Component");
            }
            classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
          }
        }
        function processUpdateQueue(internalInstance, inst, props, maskedLegacyContext) {
          if (internalInstance.queue !== null && internalInstance.queue.length > 0) {
            var oldQueue = internalInstance.queue;
            var oldReplace = internalInstance.replace;
            internalInstance.queue = null;
            internalInstance.replace = false;
            if (oldReplace && oldQueue.length === 1) {
              inst.state = oldQueue[0];
            } else {
              var nextState = oldReplace ? oldQueue[0] : inst.state;
              var dontMutate = true;
              for (var i = oldReplace ? 1 : 0; i < oldQueue.length; i++) {
                var partial = oldQueue[i];
                var partialState = typeof partial === "function" ? partial.call(inst, nextState, props, maskedLegacyContext) : partial;
                if (partialState != null) {
                  if (dontMutate) {
                    dontMutate = false;
                    nextState = assign({}, nextState, partialState);
                  } else {
                    assign(nextState, partialState);
                  }
                }
              }
              inst.state = nextState;
            }
          } else {
            internalInstance.queue = null;
          }
        }
        function mountClassInstance(instance, ctor, newProps, maskedLegacyContext) {
          {
            checkClassInstance(instance, ctor, newProps);
          }
          var initialState = instance.state !== void 0 ? instance.state : null;
          instance.updater = classComponentUpdater;
          instance.props = newProps;
          instance.state = initialState;
          var internalInstance = {
            queue: [],
            replace: false
          };
          set(instance, internalInstance);
          var contextType = ctor.contextType;
          if (typeof contextType === "object" && contextType !== null) {
            instance.context = readContext(contextType);
          } else {
            instance.context = maskedLegacyContext;
          }
          {
            if (instance.state === newProps) {
              var componentName = getComponentNameFromType(ctor) || "Component";
              if (!didWarnAboutDirectlyAssigningPropsToState.has(componentName)) {
                didWarnAboutDirectlyAssigningPropsToState.add(componentName);
                error("%s: It is not recommended to assign props directly to state because updates to props won't be reflected in state. In most cases, it is better to use props directly.", componentName);
              }
            }
          }
          var getDerivedStateFromProps = ctor.getDerivedStateFromProps;
          if (typeof getDerivedStateFromProps === "function") {
            instance.state = applyDerivedStateFromProps(instance, ctor, getDerivedStateFromProps, initialState, newProps);
          }
          if (typeof ctor.getDerivedStateFromProps !== "function" && typeof instance.getSnapshotBeforeUpdate !== "function" && (typeof instance.UNSAFE_componentWillMount === "function" || typeof instance.componentWillMount === "function")) {
            callComponentWillMount(ctor, instance);
            processUpdateQueue(internalInstance, instance, newProps, maskedLegacyContext);
          }
        }
        var emptyTreeContext = {
          id: 1,
          overflow: ""
        };
        function getTreeId(context) {
          var overflow = context.overflow;
          var idWithLeadingBit = context.id;
          var id = idWithLeadingBit & ~getLeadingBit(idWithLeadingBit);
          return id.toString(32) + overflow;
        }
        function pushTreeContext(baseContext, totalChildren, index) {
          var baseIdWithLeadingBit = baseContext.id;
          var baseOverflow = baseContext.overflow;
          var baseLength = getBitLength(baseIdWithLeadingBit) - 1;
          var baseId = baseIdWithLeadingBit & ~(1 << baseLength);
          var slot = index + 1;
          var length = getBitLength(totalChildren) + baseLength;
          if (length > 30) {
            var numberOfOverflowBits = baseLength - baseLength % 5;
            var newOverflowBits = (1 << numberOfOverflowBits) - 1;
            var newOverflow = (baseId & newOverflowBits).toString(32);
            var restOfBaseId = baseId >> numberOfOverflowBits;
            var restOfBaseLength = baseLength - numberOfOverflowBits;
            var restOfLength = getBitLength(totalChildren) + restOfBaseLength;
            var restOfNewBits = slot << restOfBaseLength;
            var id = restOfNewBits | restOfBaseId;
            var overflow = newOverflow + baseOverflow;
            return {
              id: 1 << restOfLength | id,
              overflow
            };
          } else {
            var newBits = slot << baseLength;
            var _id = newBits | baseId;
            var _overflow = baseOverflow;
            return {
              id: 1 << length | _id,
              overflow: _overflow
            };
          }
        }
        function getBitLength(number) {
          return 32 - clz32(number);
        }
        function getLeadingBit(id) {
          return 1 << getBitLength(id) - 1;
        }
        var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback;
        var log = Math.log;
        var LN2 = Math.LN2;
        function clz32Fallback(x) {
          var asUint = x >>> 0;
          if (asUint === 0) {
            return 32;
          }
          return 31 - (log(asUint) / LN2 | 0) | 0;
        }
        function is(x, y) {
          return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y;
        }
        var objectIs = typeof Object.is === "function" ? Object.is : is;
        var currentlyRenderingComponent = null;
        var currentlyRenderingTask = null;
        var firstWorkInProgressHook = null;
        var workInProgressHook = null;
        var isReRender = false;
        var didScheduleRenderPhaseUpdate = false;
        var localIdCounter = 0;
        var renderPhaseUpdates = null;
        var numberOfReRenders = 0;
        var RE_RENDER_LIMIT = 25;
        var isInHookUserCodeInDev = false;
        var currentHookNameInDev;
        function resolveCurrentlyRenderingComponent() {
          if (currentlyRenderingComponent === null) {
            throw new Error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
          }
          {
            if (isInHookUserCodeInDev) {
              error("Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. You can only call Hooks at the top level of your React function. For more information, see https://reactjs.org/link/rules-of-hooks");
            }
          }
          return currentlyRenderingComponent;
        }
        function areHookInputsEqual(nextDeps, prevDeps) {
          if (prevDeps === null) {
            {
              error("%s received a final argument during this render, but not during the previous render. Even though the final argument is optional, its type cannot change between renders.", currentHookNameInDev);
            }
            return false;
          }
          {
            if (nextDeps.length !== prevDeps.length) {
              error("The final argument passed to %s changed size between renders. The order and size of this array must remain constant.\n\nPrevious: %s\nIncoming: %s", currentHookNameInDev, "[" + nextDeps.join(", ") + "]", "[" + prevDeps.join(", ") + "]");
            }
          }
          for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
            if (objectIs(nextDeps[i], prevDeps[i])) {
              continue;
            }
            return false;
          }
          return true;
        }
        function createHook() {
          if (numberOfReRenders > 0) {
            throw new Error("Rendered more hooks than during the previous render");
          }
          return {
            memoizedState: null,
            queue: null,
            next: null
          };
        }
        function createWorkInProgressHook() {
          if (workInProgressHook === null) {
            if (firstWorkInProgressHook === null) {
              isReRender = false;
              firstWorkInProgressHook = workInProgressHook = createHook();
            } else {
              isReRender = true;
              workInProgressHook = firstWorkInProgressHook;
            }
          } else {
            if (workInProgressHook.next === null) {
              isReRender = false;
              workInProgressHook = workInProgressHook.next = createHook();
            } else {
              isReRender = true;
              workInProgressHook = workInProgressHook.next;
            }
          }
          return workInProgressHook;
        }
        function prepareToUseHooks(task, componentIdentity) {
          currentlyRenderingComponent = componentIdentity;
          currentlyRenderingTask = task;
          {
            isInHookUserCodeInDev = false;
          }
          localIdCounter = 0;
        }
        function finishHooks(Component, props, children, refOrContext) {
          while (didScheduleRenderPhaseUpdate) {
            didScheduleRenderPhaseUpdate = false;
            localIdCounter = 0;
            numberOfReRenders += 1;
            workInProgressHook = null;
            children = Component(props, refOrContext);
          }
          resetHooksState();
          return children;
        }
        function checkDidRenderIdHook() {
          var didRenderIdHook = localIdCounter !== 0;
          return didRenderIdHook;
        }
        function resetHooksState() {
          {
            isInHookUserCodeInDev = false;
          }
          currentlyRenderingComponent = null;
          currentlyRenderingTask = null;
          didScheduleRenderPhaseUpdate = false;
          firstWorkInProgressHook = null;
          numberOfReRenders = 0;
          renderPhaseUpdates = null;
          workInProgressHook = null;
        }
        function readContext$1(context) {
          {
            if (isInHookUserCodeInDev) {
              error("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
            }
          }
          return readContext(context);
        }
        function useContext(context) {
          {
            currentHookNameInDev = "useContext";
          }
          resolveCurrentlyRenderingComponent();
          return readContext(context);
        }
        function basicStateReducer(state, action) {
          return typeof action === "function" ? action(state) : action;
        }
        function useState(initialState) {
          {
            currentHookNameInDev = "useState";
          }
          return useReducer(
            basicStateReducer,
            // useReducer has a special case to support lazy useState initializers
            initialState
          );
        }
        function useReducer(reducer, initialArg, init) {
          {
            if (reducer !== basicStateReducer) {
              currentHookNameInDev = "useReducer";
            }
          }
          currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
          workInProgressHook = createWorkInProgressHook();
          if (isReRender) {
            var queue = workInProgressHook.queue;
            var dispatch = queue.dispatch;
            if (renderPhaseUpdates !== null) {
              var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
              if (firstRenderPhaseUpdate !== void 0) {
                renderPhaseUpdates.delete(queue);
                var newState = workInProgressHook.memoizedState;
                var update = firstRenderPhaseUpdate;
                do {
                  var action = update.action;
                  {
                    isInHookUserCodeInDev = true;
                  }
                  newState = reducer(newState, action);
                  {
                    isInHookUserCodeInDev = false;
                  }
                  update = update.next;
                } while (update !== null);
                workInProgressHook.memoizedState = newState;
                return [newState, dispatch];
              }
            }
            return [workInProgressHook.memoizedState, dispatch];
          } else {
            {
              isInHookUserCodeInDev = true;
            }
            var initialState;
            if (reducer === basicStateReducer) {
              initialState = typeof initialArg === "function" ? initialArg() : initialArg;
            } else {
              initialState = init !== void 0 ? init(initialArg) : initialArg;
            }
            {
              isInHookUserCodeInDev = false;
            }
            workInProgressHook.memoizedState = initialState;
            var _queue = workInProgressHook.queue = {
              last: null,
              dispatch: null
            };
            var _dispatch = _queue.dispatch = dispatchAction.bind(null, currentlyRenderingComponent, _queue);
            return [workInProgressHook.memoizedState, _dispatch];
          }
        }
        function useMemo(nextCreate, deps) {
          currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
          workInProgressHook = createWorkInProgressHook();
          var nextDeps = deps === void 0 ? null : deps;
          if (workInProgressHook !== null) {
            var prevState = workInProgressHook.memoizedState;
            if (prevState !== null) {
              if (nextDeps !== null) {
                var prevDeps = prevState[1];
                if (areHookInputsEqual(nextDeps, prevDeps)) {
                  return prevState[0];
                }
              }
            }
          }
          {
            isInHookUserCodeInDev = true;
          }
          var nextValue = nextCreate();
          {
            isInHookUserCodeInDev = false;
          }
          workInProgressHook.memoizedState = [nextValue, nextDeps];
          return nextValue;
        }
        function useRef(initialValue) {
          currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
          workInProgressHook = createWorkInProgressHook();
          var previousRef = workInProgressHook.memoizedState;
          if (previousRef === null) {
            var ref = {
              current: initialValue
            };
            {
              Object.seal(ref);
            }
            workInProgressHook.memoizedState = ref;
            return ref;
          } else {
            return previousRef;
          }
        }
        function useLayoutEffect(create, inputs) {
          {
            currentHookNameInDev = "useLayoutEffect";
            error("useLayoutEffect does nothing on the server, because its effect cannot be encoded into the server renderer's output format. This will lead to a mismatch between the initial, non-hydrated UI and the intended UI. To avoid this, useLayoutEffect should only be used in components that render exclusively on the client. See https://reactjs.org/link/uselayouteffect-ssr for common fixes.");
          }
        }
        function dispatchAction(componentIdentity, queue, action) {
          if (numberOfReRenders >= RE_RENDER_LIMIT) {
            throw new Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
          }
          if (componentIdentity === currentlyRenderingComponent) {
            didScheduleRenderPhaseUpdate = true;
            var update = {
              action,
              next: null
            };
            if (renderPhaseUpdates === null) {
              renderPhaseUpdates = /* @__PURE__ */ new Map();
            }
            var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
            if (firstRenderPhaseUpdate === void 0) {
              renderPhaseUpdates.set(queue, update);
            } else {
              var lastRenderPhaseUpdate = firstRenderPhaseUpdate;
              while (lastRenderPhaseUpdate.next !== null) {
                lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
              }
              lastRenderPhaseUpdate.next = update;
            }
          }
        }
        function useCallback(callback, deps) {
          return useMemo(function() {
            return callback;
          }, deps);
        }
        function useMutableSource(source, getSnapshot, subscribe) {
          resolveCurrentlyRenderingComponent();
          return getSnapshot(source._source);
        }
        function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
          if (getServerSnapshot === void 0) {
            throw new Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
          }
          return getServerSnapshot();
        }
        function useDeferredValue(value) {
          resolveCurrentlyRenderingComponent();
          return value;
        }
        function unsupportedStartTransition() {
          throw new Error("startTransition cannot be called during server rendering.");
        }
        function useTransition() {
          resolveCurrentlyRenderingComponent();
          return [false, unsupportedStartTransition];
        }
        function useId() {
          var task = currentlyRenderingTask;
          var treeId = getTreeId(task.treeContext);
          var responseState = currentResponseState;
          if (responseState === null) {
            throw new Error("Invalid hook call. Hooks can only be called inside of the body of a function component.");
          }
          var localId = localIdCounter++;
          return makeId(responseState, treeId, localId);
        }
        function noop() {
        }
        var Dispatcher = {
          readContext: readContext$1,
          useContext,
          useMemo,
          useReducer,
          useRef,
          useState,
          useInsertionEffect: noop,
          useLayoutEffect,
          useCallback,
          // useImperativeHandle is not run in the server environment
          useImperativeHandle: noop,
          // Effects are not run in the server environment.
          useEffect: noop,
          // Debugging effect
          useDebugValue: noop,
          useDeferredValue,
          useTransition,
          useId,
          // Subscriptions are not setup in a server environment.
          useMutableSource,
          useSyncExternalStore
        };
        var currentResponseState = null;
        function setCurrentResponseState(responseState) {
          currentResponseState = responseState;
        }
        function getStackByComponentStackNode(componentStack) {
          try {
            var info = "";
            var node = componentStack;
            do {
              switch (node.tag) {
                case 0:
                  info += describeBuiltInComponentFrame(node.type, null, null);
                  break;
                case 1:
                  info += describeFunctionComponentFrame(node.type, null, null);
                  break;
                case 2:
                  info += describeClassComponentFrame(node.type, null, null);
                  break;
              }
              node = node.parent;
            } while (node);
            return info;
          } catch (x) {
            return "\nError generating stack: " + x.message + "\n" + x.stack;
          }
        }
        var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
        var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
        var PENDING = 0;
        var COMPLETED = 1;
        var FLUSHED = 2;
        var ABORTED = 3;
        var ERRORED = 4;
        var OPEN = 0;
        var CLOSING = 1;
        var CLOSED = 2;
        var DEFAULT_PROGRESSIVE_CHUNK_SIZE = 12800;
        function defaultErrorHandler(error2) {
          console["error"](error2);
          return null;
        }
        function noop$1() {
        }
        function createRequest(children, responseState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError) {
          var pingedTasks = [];
          var abortSet = /* @__PURE__ */ new Set();
          var request = {
            destination: null,
            responseState,
            progressiveChunkSize: progressiveChunkSize === void 0 ? DEFAULT_PROGRESSIVE_CHUNK_SIZE : progressiveChunkSize,
            status: OPEN,
            fatalError: null,
            nextSegmentId: 0,
            allPendingTasks: 0,
            pendingRootTasks: 0,
            completedRootSegment: null,
            abortableTasks: abortSet,
            pingedTasks,
            clientRenderedBoundaries: [],
            completedBoundaries: [],
            partialBoundaries: [],
            onError: onError === void 0 ? defaultErrorHandler : onError,
            onAllReady: onAllReady === void 0 ? noop$1 : onAllReady,
            onShellReady: onShellReady === void 0 ? noop$1 : onShellReady,
            onShellError: onShellError === void 0 ? noop$1 : onShellError,
            onFatalError: onFatalError === void 0 ? noop$1 : onFatalError
          };
          var rootSegment = createPendingSegment(
            request,
            0,
            null,
            rootFormatContext,
            // Root segments are never embedded in Text on either edge
            false,
            false
          );
          rootSegment.parentFlushed = true;
          var rootTask = createTask(request, children, null, rootSegment, abortSet, emptyContextObject, rootContextSnapshot, emptyTreeContext);
          pingedTasks.push(rootTask);
          return request;
        }
        function pingTask(request, task) {
          var pingedTasks = request.pingedTasks;
          pingedTasks.push(task);
          if (pingedTasks.length === 1) {
            scheduleWork(function() {
              return performWork(request);
            });
          }
        }
        function createSuspenseBoundary(request, fallbackAbortableTasks) {
          return {
            id: UNINITIALIZED_SUSPENSE_BOUNDARY_ID,
            rootSegmentID: -1,
            parentFlushed: false,
            pendingTasks: 0,
            forceClientRender: false,
            completedSegments: [],
            byteSize: 0,
            fallbackAbortableTasks,
            errorDigest: null
          };
        }
        function createTask(request, node, blockedBoundary, blockedSegment, abortSet, legacyContext, context, treeContext) {
          request.allPendingTasks++;
          if (blockedBoundary === null) {
            request.pendingRootTasks++;
          } else {
            blockedBoundary.pendingTasks++;
          }
          var task = {
            node,
            ping: function() {
              return pingTask(request, task);
            },
            blockedBoundary,
            blockedSegment,
            abortSet,
            legacyContext,
            context,
            treeContext
          };
          {
            task.componentStack = null;
          }
          abortSet.add(task);
          return task;
        }
        function createPendingSegment(request, index, boundary, formatContext, lastPushedText, textEmbedded) {
          return {
            status: PENDING,
            id: -1,
            // lazily assigned later
            index,
            parentFlushed: false,
            chunks: [],
            children: [],
            formatContext,
            boundary,
            lastPushedText,
            textEmbedded
          };
        }
        var currentTaskInDEV = null;
        function getCurrentStackInDEV() {
          {
            if (currentTaskInDEV === null || currentTaskInDEV.componentStack === null) {
              return "";
            }
            return getStackByComponentStackNode(currentTaskInDEV.componentStack);
          }
        }
        function pushBuiltInComponentStackInDEV(task, type) {
          {
            task.componentStack = {
              tag: 0,
              parent: task.componentStack,
              type
            };
          }
        }
        function pushFunctionComponentStackInDEV(task, type) {
          {
            task.componentStack = {
              tag: 1,
              parent: task.componentStack,
              type
            };
          }
        }
        function pushClassComponentStackInDEV(task, type) {
          {
            task.componentStack = {
              tag: 2,
              parent: task.componentStack,
              type
            };
          }
        }
        function popComponentStackInDEV(task) {
          {
            if (task.componentStack === null) {
              error("Unexpectedly popped too many stack frames. This is a bug in React.");
            } else {
              task.componentStack = task.componentStack.parent;
            }
          }
        }
        var lastBoundaryErrorComponentStackDev = null;
        function captureBoundaryErrorDetailsDev(boundary, error2) {
          {
            var errorMessage;
            if (typeof error2 === "string") {
              errorMessage = error2;
            } else if (error2 && typeof error2.message === "string") {
              errorMessage = error2.message;
            } else {
              errorMessage = String(error2);
            }
            var errorComponentStack = lastBoundaryErrorComponentStackDev || getCurrentStackInDEV();
            lastBoundaryErrorComponentStackDev = null;
            boundary.errorMessage = errorMessage;
            boundary.errorComponentStack = errorComponentStack;
          }
        }
        function logRecoverableError(request, error2) {
          var errorDigest = request.onError(error2);
          if (errorDigest != null && typeof errorDigest !== "string") {
            throw new Error('onError returned something with a type other than "string". onError should return a string and may return null or undefined but must not return anything else. It received something of type "' + typeof errorDigest + '" instead');
          }
          return errorDigest;
        }
        function fatalError(request, error2) {
          var onShellError = request.onShellError;
          onShellError(error2);
          var onFatalError = request.onFatalError;
          onFatalError(error2);
          if (request.destination !== null) {
            request.status = CLOSED;
            closeWithError(request.destination, error2);
          } else {
            request.status = CLOSING;
            request.fatalError = error2;
          }
        }
        function renderSuspenseBoundary(request, task, props) {
          pushBuiltInComponentStackInDEV(task, "Suspense");
          var parentBoundary = task.blockedBoundary;
          var parentSegment = task.blockedSegment;
          var fallback = props.fallback;
          var content = props.children;
          var fallbackAbortSet = /* @__PURE__ */ new Set();
          var newBoundary = createSuspenseBoundary(request, fallbackAbortSet);
          var insertionIndex = parentSegment.chunks.length;
          var boundarySegment = createPendingSegment(
            request,
            insertionIndex,
            newBoundary,
            parentSegment.formatContext,
            // boundaries never require text embedding at their edges because comment nodes bound them
            false,
            false
          );
          parentSegment.children.push(boundarySegment);
          parentSegment.lastPushedText = false;
          var contentRootSegment = createPendingSegment(
            request,
            0,
            null,
            parentSegment.formatContext,
            // boundaries never require text embedding at their edges because comment nodes bound them
            false,
            false
          );
          contentRootSegment.parentFlushed = true;
          task.blockedBoundary = newBoundary;
          task.blockedSegment = contentRootSegment;
          try {
            renderNode(request, task, content);
            pushSegmentFinale(contentRootSegment.chunks, request.responseState, contentRootSegment.lastPushedText, contentRootSegment.textEmbedded);
            contentRootSegment.status = COMPLETED;
            queueCompletedSegment(newBoundary, contentRootSegment);
            if (newBoundary.pendingTasks === 0) {
              popComponentStackInDEV(task);
              return;
            }
          } catch (error2) {
            contentRootSegment.status = ERRORED;
            newBoundary.forceClientRender = true;
            newBoundary.errorDigest = logRecoverableError(request, error2);
            {
              captureBoundaryErrorDetailsDev(newBoundary, error2);
            }
          } finally {
            task.blockedBoundary = parentBoundary;
            task.blockedSegment = parentSegment;
          }
          var suspendedFallbackTask = createTask(request, fallback, parentBoundary, boundarySegment, fallbackAbortSet, task.legacyContext, task.context, task.treeContext);
          {
            suspendedFallbackTask.componentStack = task.componentStack;
          }
          request.pingedTasks.push(suspendedFallbackTask);
          popComponentStackInDEV(task);
        }
        function renderHostElement(request, task, type, props) {
          pushBuiltInComponentStackInDEV(task, type);
          var segment = task.blockedSegment;
          var children = pushStartInstance(segment.chunks, type, props, request.responseState, segment.formatContext);
          segment.lastPushedText = false;
          var prevContext = segment.formatContext;
          segment.formatContext = getChildFormatContext(prevContext, type, props);
          renderNode(request, task, children);
          segment.formatContext = prevContext;
          pushEndInstance(segment.chunks, type);
          segment.lastPushedText = false;
          popComponentStackInDEV(task);
        }
        function shouldConstruct$1(Component) {
          return Component.prototype && Component.prototype.isReactComponent;
        }
        function renderWithHooks(request, task, Component, props, secondArg) {
          var componentIdentity = {};
          prepareToUseHooks(task, componentIdentity);
          var result = Component(props, secondArg);
          return finishHooks(Component, props, result, secondArg);
        }
        function finishClassComponent(request, task, instance, Component, props) {
          var nextChildren = instance.render();
          {
            if (instance.props !== props) {
              if (!didWarnAboutReassigningProps) {
                error("It looks like %s is reassigning its own `this.props` while rendering. This is not supported and can lead to confusing bugs.", getComponentNameFromType(Component) || "a component");
              }
              didWarnAboutReassigningProps = true;
            }
          }
          {
            var childContextTypes = Component.childContextTypes;
            if (childContextTypes !== null && childContextTypes !== void 0) {
              var previousContext = task.legacyContext;
              var mergedContext = processChildContext(instance, Component, previousContext, childContextTypes);
              task.legacyContext = mergedContext;
              renderNodeDestructive(request, task, nextChildren);
              task.legacyContext = previousContext;
              return;
            }
          }
          renderNodeDestructive(request, task, nextChildren);
        }
        function renderClassComponent(request, task, Component, props) {
          pushClassComponentStackInDEV(task, Component);
          var maskedContext = getMaskedContext(Component, task.legacyContext);
          var instance = constructClassInstance(Component, props, maskedContext);
          mountClassInstance(instance, Component, props, maskedContext);
          finishClassComponent(request, task, instance, Component, props);
          popComponentStackInDEV(task);
        }
        var didWarnAboutBadClass = {};
        var didWarnAboutModulePatternComponent = {};
        var didWarnAboutContextTypeOnFunctionComponent = {};
        var didWarnAboutGetDerivedStateOnFunctionComponent = {};
        var didWarnAboutReassigningProps = false;
        var didWarnAboutDefaultPropsOnFunctionComponent = {};
        var didWarnAboutGenerators = false;
        var didWarnAboutMaps = false;
        var hasWarnedAboutUsingContextAsConsumer = false;
        function renderIndeterminateComponent(request, task, Component, props) {
          var legacyContext;
          {
            legacyContext = getMaskedContext(Component, task.legacyContext);
          }
          pushFunctionComponentStackInDEV(task, Component);
          {
            if (Component.prototype && typeof Component.prototype.render === "function") {
              var componentName = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutBadClass[componentName]) {
                error("The <%s /> component appears to have a render method, but doesn't extend React.Component. This is likely to cause errors. Change %s to extend React.Component instead.", componentName, componentName);
                didWarnAboutBadClass[componentName] = true;
              }
            }
          }
          var value = renderWithHooks(request, task, Component, props, legacyContext);
          var hasId = checkDidRenderIdHook();
          {
            if (typeof value === "object" && value !== null && typeof value.render === "function" && value.$$typeof === void 0) {
              var _componentName = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutModulePatternComponent[_componentName]) {
                error("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", _componentName, _componentName, _componentName);
                didWarnAboutModulePatternComponent[_componentName] = true;
              }
            }
          }
          if (
            // Run these checks in production only if the flag is off.
            // Eventually we'll delete this branch altogether.
            typeof value === "object" && value !== null && typeof value.render === "function" && value.$$typeof === void 0
          ) {
            {
              var _componentName2 = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutModulePatternComponent[_componentName2]) {
                error("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", _componentName2, _componentName2, _componentName2);
                didWarnAboutModulePatternComponent[_componentName2] = true;
              }
            }
            mountClassInstance(value, Component, props, legacyContext);
            finishClassComponent(request, task, value, Component, props);
          } else {
            {
              validateFunctionComponentInDev(Component);
            }
            if (hasId) {
              var prevTreeContext = task.treeContext;
              var totalChildren = 1;
              var index = 0;
              task.treeContext = pushTreeContext(prevTreeContext, totalChildren, index);
              try {
                renderNodeDestructive(request, task, value);
              } finally {
                task.treeContext = prevTreeContext;
              }
            } else {
              renderNodeDestructive(request, task, value);
            }
          }
          popComponentStackInDEV(task);
        }
        function validateFunctionComponentInDev(Component) {
          {
            if (Component) {
              if (Component.childContextTypes) {
                error("%s(...): childContextTypes cannot be defined on a function component.", Component.displayName || Component.name || "Component");
              }
            }
            if (Component.defaultProps !== void 0) {
              var componentName = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutDefaultPropsOnFunctionComponent[componentName]) {
                error("%s: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.", componentName);
                didWarnAboutDefaultPropsOnFunctionComponent[componentName] = true;
              }
            }
            if (typeof Component.getDerivedStateFromProps === "function") {
              var _componentName3 = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutGetDerivedStateOnFunctionComponent[_componentName3]) {
                error("%s: Function components do not support getDerivedStateFromProps.", _componentName3);
                didWarnAboutGetDerivedStateOnFunctionComponent[_componentName3] = true;
              }
            }
            if (typeof Component.contextType === "object" && Component.contextType !== null) {
              var _componentName4 = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutContextTypeOnFunctionComponent[_componentName4]) {
                error("%s: Function components do not support contextType.", _componentName4);
                didWarnAboutContextTypeOnFunctionComponent[_componentName4] = true;
              }
            }
          }
        }
        function resolveDefaultProps(Component, baseProps) {
          if (Component && Component.defaultProps) {
            var props = assign({}, baseProps);
            var defaultProps = Component.defaultProps;
            for (var propName in defaultProps) {
              if (props[propName] === void 0) {
                props[propName] = defaultProps[propName];
              }
            }
            return props;
          }
          return baseProps;
        }
        function renderForwardRef(request, task, type, props, ref) {
          pushFunctionComponentStackInDEV(task, type.render);
          var children = renderWithHooks(request, task, type.render, props, ref);
          var hasId = checkDidRenderIdHook();
          if (hasId) {
            var prevTreeContext = task.treeContext;
            var totalChildren = 1;
            var index = 0;
            task.treeContext = pushTreeContext(prevTreeContext, totalChildren, index);
            try {
              renderNodeDestructive(request, task, children);
            } finally {
              task.treeContext = prevTreeContext;
            }
          } else {
            renderNodeDestructive(request, task, children);
          }
          popComponentStackInDEV(task);
        }
        function renderMemo(request, task, type, props, ref) {
          var innerType = type.type;
          var resolvedProps = resolveDefaultProps(innerType, props);
          renderElement(request, task, innerType, resolvedProps, ref);
        }
        function renderContextConsumer(request, task, context, props) {
          {
            if (context._context === void 0) {
              if (context !== context.Consumer) {
                if (!hasWarnedAboutUsingContextAsConsumer) {
                  hasWarnedAboutUsingContextAsConsumer = true;
                  error("Rendering <Context> directly is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?");
                }
              }
            } else {
              context = context._context;
            }
          }
          var render = props.children;
          {
            if (typeof render !== "function") {
              error("A context consumer was rendered with multiple children, or a child that isn't a function. A context consumer expects a single child that is a function. If you did pass a function, make sure there is no trailing or leading whitespace around it.");
            }
          }
          var newValue = readContext(context);
          var newChildren = render(newValue);
          renderNodeDestructive(request, task, newChildren);
        }
        function renderContextProvider(request, task, type, props) {
          var context = type._context;
          var value = props.value;
          var children = props.children;
          var prevSnapshot;
          {
            prevSnapshot = task.context;
          }
          task.context = pushProvider(context, value);
          renderNodeDestructive(request, task, children);
          task.context = popProvider(context);
          {
            if (prevSnapshot !== task.context) {
              error("Popping the context provider did not return back to the original snapshot. This is a bug in React.");
            }
          }
        }
        function renderLazyComponent(request, task, lazyComponent, props, ref) {
          pushBuiltInComponentStackInDEV(task, "Lazy");
          var payload = lazyComponent._payload;
          var init = lazyComponent._init;
          var Component = init(payload);
          var resolvedProps = resolveDefaultProps(Component, props);
          renderElement(request, task, Component, resolvedProps, ref);
          popComponentStackInDEV(task);
        }
        function renderElement(request, task, type, props, ref) {
          if (typeof type === "function") {
            if (shouldConstruct$1(type)) {
              renderClassComponent(request, task, type, props);
              return;
            } else {
              renderIndeterminateComponent(request, task, type, props);
              return;
            }
          }
          if (typeof type === "string") {
            renderHostElement(request, task, type, props);
            return;
          }
          switch (type) {
            // TODO: LegacyHidden acts the same as a fragment. This only works
            // because we currently assume that every instance of LegacyHidden is
            // accompanied by a host component wrapper. In the hidden mode, the host
            // component is given a `hidden` attribute, which ensures that the
            // initial HTML is not visible. To support the use of LegacyHidden as a
            // true fragment, without an extra DOM node, we would have to hide the
            // initial HTML in some other way.
            // TODO: Add REACT_OFFSCREEN_TYPE here too with the same capability.
            case REACT_LEGACY_HIDDEN_TYPE:
            case REACT_DEBUG_TRACING_MODE_TYPE:
            case REACT_STRICT_MODE_TYPE:
            case REACT_PROFILER_TYPE:
            case REACT_FRAGMENT_TYPE: {
              renderNodeDestructive(request, task, props.children);
              return;
            }
            case REACT_SUSPENSE_LIST_TYPE: {
              pushBuiltInComponentStackInDEV(task, "SuspenseList");
              renderNodeDestructive(request, task, props.children);
              popComponentStackInDEV(task);
              return;
            }
            case REACT_SCOPE_TYPE: {
              throw new Error("ReactDOMServer does not yet support scope components.");
            }
            // eslint-disable-next-line-no-fallthrough
            case REACT_SUSPENSE_TYPE: {
              {
                renderSuspenseBoundary(request, task, props);
              }
              return;
            }
          }
          if (typeof type === "object" && type !== null) {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE: {
                renderForwardRef(request, task, type, props, ref);
                return;
              }
              case REACT_MEMO_TYPE: {
                renderMemo(request, task, type, props, ref);
                return;
              }
              case REACT_PROVIDER_TYPE: {
                renderContextProvider(request, task, type, props);
                return;
              }
              case REACT_CONTEXT_TYPE: {
                renderContextConsumer(request, task, type, props);
                return;
              }
              case REACT_LAZY_TYPE: {
                renderLazyComponent(request, task, type, props);
                return;
              }
            }
          }
          var info = "";
          {
            if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
              info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
            }
          }
          throw new Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) " + ("but got: " + (type == null ? type : typeof type) + "." + info));
        }
        function validateIterable(iterable, iteratorFn) {
          {
            if (typeof Symbol === "function" && // $FlowFixMe Flow doesn't know about toStringTag
            iterable[Symbol.toStringTag] === "Generator") {
              if (!didWarnAboutGenerators) {
                error("Using Generators as children is unsupported and will likely yield unexpected results because enumerating a generator mutates it. You may convert it to an array with `Array.from()` or the `[...spread]` operator before rendering. Keep in mind you might need to polyfill these features for older browsers.");
              }
              didWarnAboutGenerators = true;
            }
            if (iterable.entries === iteratorFn) {
              if (!didWarnAboutMaps) {
                error("Using Maps as children is not supported. Use an array of keyed ReactElements instead.");
              }
              didWarnAboutMaps = true;
            }
          }
        }
        function renderNodeDestructive(request, task, node) {
          {
            try {
              return renderNodeDestructiveImpl(request, task, node);
            } catch (x) {
              if (typeof x === "object" && x !== null && typeof x.then === "function") ;
              else {
                lastBoundaryErrorComponentStackDev = lastBoundaryErrorComponentStackDev !== null ? lastBoundaryErrorComponentStackDev : getCurrentStackInDEV();
              }
              throw x;
            }
          }
        }
        function renderNodeDestructiveImpl(request, task, node) {
          task.node = node;
          if (typeof node === "object" && node !== null) {
            switch (node.$$typeof) {
              case REACT_ELEMENT_TYPE: {
                var element = node;
                var type = element.type;
                var props = element.props;
                var ref = element.ref;
                renderElement(request, task, type, props, ref);
                return;
              }
              case REACT_PORTAL_TYPE:
                throw new Error("Portals are not currently supported by the server renderer. Render them conditionally so that they only appear on the client render.");
              // eslint-disable-next-line-no-fallthrough
              case REACT_LAZY_TYPE: {
                var lazyNode = node;
                var payload = lazyNode._payload;
                var init = lazyNode._init;
                var resolvedNode;
                {
                  try {
                    resolvedNode = init(payload);
                  } catch (x) {
                    if (typeof x === "object" && x !== null && typeof x.then === "function") {
                      pushBuiltInComponentStackInDEV(task, "Lazy");
                    }
                    throw x;
                  }
                }
                renderNodeDestructive(request, task, resolvedNode);
                return;
              }
            }
            if (isArray(node)) {
              renderChildrenArray(request, task, node);
              return;
            }
            var iteratorFn = getIteratorFn(node);
            if (iteratorFn) {
              {
                validateIterable(node, iteratorFn);
              }
              var iterator = iteratorFn.call(node);
              if (iterator) {
                var step = iterator.next();
                if (!step.done) {
                  var children = [];
                  do {
                    children.push(step.value);
                    step = iterator.next();
                  } while (!step.done);
                  renderChildrenArray(request, task, children);
                  return;
                }
                return;
              }
            }
            var childString = Object.prototype.toString.call(node);
            throw new Error("Objects are not valid as a React child (found: " + (childString === "[object Object]" ? "object with keys {" + Object.keys(node).join(", ") + "}" : childString) + "). If you meant to render a collection of children, use an array instead.");
          }
          if (typeof node === "string") {
            var segment = task.blockedSegment;
            segment.lastPushedText = pushTextInstance(task.blockedSegment.chunks, node, request.responseState, segment.lastPushedText);
            return;
          }
          if (typeof node === "number") {
            var _segment = task.blockedSegment;
            _segment.lastPushedText = pushTextInstance(task.blockedSegment.chunks, "" + node, request.responseState, _segment.lastPushedText);
            return;
          }
          {
            if (typeof node === "function") {
              error("Functions are not valid as a React child. This may happen if you return a Component instead of <Component /> from render. Or maybe you meant to call this function rather than return it.");
            }
          }
        }
        function renderChildrenArray(request, task, children) {
          var totalChildren = children.length;
          for (var i = 0; i < totalChildren; i++) {
            var prevTreeContext = task.treeContext;
            task.treeContext = pushTreeContext(prevTreeContext, totalChildren, i);
            try {
              renderNode(request, task, children[i]);
            } finally {
              task.treeContext = prevTreeContext;
            }
          }
        }
        function spawnNewSuspendedTask(request, task, x) {
          var segment = task.blockedSegment;
          var insertionIndex = segment.chunks.length;
          var newSegment = createPendingSegment(
            request,
            insertionIndex,
            null,
            segment.formatContext,
            // Adopt the parent segment's leading text embed
            segment.lastPushedText,
            // Assume we are text embedded at the trailing edge
            true
          );
          segment.children.push(newSegment);
          segment.lastPushedText = false;
          var newTask = createTask(request, task.node, task.blockedBoundary, newSegment, task.abortSet, task.legacyContext, task.context, task.treeContext);
          {
            if (task.componentStack !== null) {
              newTask.componentStack = task.componentStack.parent;
            }
          }
          var ping = newTask.ping;
          x.then(ping, ping);
        }
        function renderNode(request, task, node) {
          var previousFormatContext = task.blockedSegment.formatContext;
          var previousLegacyContext = task.legacyContext;
          var previousContext = task.context;
          var previousComponentStack = null;
          {
            previousComponentStack = task.componentStack;
          }
          try {
            return renderNodeDestructive(request, task, node);
          } catch (x) {
            resetHooksState();
            if (typeof x === "object" && x !== null && typeof x.then === "function") {
              spawnNewSuspendedTask(request, task, x);
              task.blockedSegment.formatContext = previousFormatContext;
              task.legacyContext = previousLegacyContext;
              task.context = previousContext;
              switchContext(previousContext);
              {
                task.componentStack = previousComponentStack;
              }
              return;
            } else {
              task.blockedSegment.formatContext = previousFormatContext;
              task.legacyContext = previousLegacyContext;
              task.context = previousContext;
              switchContext(previousContext);
              {
                task.componentStack = previousComponentStack;
              }
              throw x;
            }
          }
        }
        function erroredTask(request, boundary, segment, error2) {
          var errorDigest = logRecoverableError(request, error2);
          if (boundary === null) {
            fatalError(request, error2);
          } else {
            boundary.pendingTasks--;
            if (!boundary.forceClientRender) {
              boundary.forceClientRender = true;
              boundary.errorDigest = errorDigest;
              {
                captureBoundaryErrorDetailsDev(boundary, error2);
              }
              if (boundary.parentFlushed) {
                request.clientRenderedBoundaries.push(boundary);
              }
            }
          }
          request.allPendingTasks--;
          if (request.allPendingTasks === 0) {
            var onAllReady = request.onAllReady;
            onAllReady();
          }
        }
        function abortTaskSoft(task) {
          var request = this;
          var boundary = task.blockedBoundary;
          var segment = task.blockedSegment;
          segment.status = ABORTED;
          finishedTask(request, boundary, segment);
        }
        function abortTask(task, request, reason) {
          var boundary = task.blockedBoundary;
          var segment = task.blockedSegment;
          segment.status = ABORTED;
          if (boundary === null) {
            request.allPendingTasks--;
            if (request.status !== CLOSED) {
              request.status = CLOSED;
              if (request.destination !== null) {
                close(request.destination);
              }
            }
          } else {
            boundary.pendingTasks--;
            if (!boundary.forceClientRender) {
              boundary.forceClientRender = true;
              var _error = reason === void 0 ? new Error("The render was aborted by the server without a reason.") : reason;
              boundary.errorDigest = request.onError(_error);
              {
                var errorPrefix = "The server did not finish this Suspense boundary: ";
                if (_error && typeof _error.message === "string") {
                  _error = errorPrefix + _error.message;
                } else {
                  _error = errorPrefix + String(_error);
                }
                var previousTaskInDev = currentTaskInDEV;
                currentTaskInDEV = task;
                try {
                  captureBoundaryErrorDetailsDev(boundary, _error);
                } finally {
                  currentTaskInDEV = previousTaskInDev;
                }
              }
              if (boundary.parentFlushed) {
                request.clientRenderedBoundaries.push(boundary);
              }
            }
            boundary.fallbackAbortableTasks.forEach(function(fallbackTask) {
              return abortTask(fallbackTask, request, reason);
            });
            boundary.fallbackAbortableTasks.clear();
            request.allPendingTasks--;
            if (request.allPendingTasks === 0) {
              var onAllReady = request.onAllReady;
              onAllReady();
            }
          }
        }
        function queueCompletedSegment(boundary, segment) {
          if (segment.chunks.length === 0 && segment.children.length === 1 && segment.children[0].boundary === null) {
            var childSegment = segment.children[0];
            childSegment.id = segment.id;
            childSegment.parentFlushed = true;
            if (childSegment.status === COMPLETED) {
              queueCompletedSegment(boundary, childSegment);
            }
          } else {
            var completedSegments = boundary.completedSegments;
            completedSegments.push(segment);
          }
        }
        function finishedTask(request, boundary, segment) {
          if (boundary === null) {
            if (segment.parentFlushed) {
              if (request.completedRootSegment !== null) {
                throw new Error("There can only be one root segment. This is a bug in React.");
              }
              request.completedRootSegment = segment;
            }
            request.pendingRootTasks--;
            if (request.pendingRootTasks === 0) {
              request.onShellError = noop$1;
              var onShellReady = request.onShellReady;
              onShellReady();
            }
          } else {
            boundary.pendingTasks--;
            if (boundary.forceClientRender) ;
            else if (boundary.pendingTasks === 0) {
              if (segment.parentFlushed) {
                if (segment.status === COMPLETED) {
                  queueCompletedSegment(boundary, segment);
                }
              }
              if (boundary.parentFlushed) {
                request.completedBoundaries.push(boundary);
              }
              boundary.fallbackAbortableTasks.forEach(abortTaskSoft, request);
              boundary.fallbackAbortableTasks.clear();
            } else {
              if (segment.parentFlushed) {
                if (segment.status === COMPLETED) {
                  queueCompletedSegment(boundary, segment);
                  var completedSegments = boundary.completedSegments;
                  if (completedSegments.length === 1) {
                    if (boundary.parentFlushed) {
                      request.partialBoundaries.push(boundary);
                    }
                  }
                }
              }
            }
          }
          request.allPendingTasks--;
          if (request.allPendingTasks === 0) {
            var onAllReady = request.onAllReady;
            onAllReady();
          }
        }
        function retryTask(request, task) {
          var segment = task.blockedSegment;
          if (segment.status !== PENDING) {
            return;
          }
          switchContext(task.context);
          var prevTaskInDEV = null;
          {
            prevTaskInDEV = currentTaskInDEV;
            currentTaskInDEV = task;
          }
          try {
            renderNodeDestructive(request, task, task.node);
            pushSegmentFinale(segment.chunks, request.responseState, segment.lastPushedText, segment.textEmbedded);
            task.abortSet.delete(task);
            segment.status = COMPLETED;
            finishedTask(request, task.blockedBoundary, segment);
          } catch (x) {
            resetHooksState();
            if (typeof x === "object" && x !== null && typeof x.then === "function") {
              var ping = task.ping;
              x.then(ping, ping);
            } else {
              task.abortSet.delete(task);
              segment.status = ERRORED;
              erroredTask(request, task.blockedBoundary, segment, x);
            }
          } finally {
            {
              currentTaskInDEV = prevTaskInDEV;
            }
          }
        }
        function performWork(request) {
          if (request.status === CLOSED) {
            return;
          }
          var prevContext = getActiveContext();
          var prevDispatcher = ReactCurrentDispatcher$1.current;
          ReactCurrentDispatcher$1.current = Dispatcher;
          var prevGetCurrentStackImpl;
          {
            prevGetCurrentStackImpl = ReactDebugCurrentFrame$1.getCurrentStack;
            ReactDebugCurrentFrame$1.getCurrentStack = getCurrentStackInDEV;
          }
          var prevResponseState = currentResponseState;
          setCurrentResponseState(request.responseState);
          try {
            var pingedTasks = request.pingedTasks;
            var i;
            for (i = 0; i < pingedTasks.length; i++) {
              var task = pingedTasks[i];
              retryTask(request, task);
            }
            pingedTasks.splice(0, i);
            if (request.destination !== null) {
              flushCompletedQueues(request, request.destination);
            }
          } catch (error2) {
            logRecoverableError(request, error2);
            fatalError(request, error2);
          } finally {
            setCurrentResponseState(prevResponseState);
            ReactCurrentDispatcher$1.current = prevDispatcher;
            {
              ReactDebugCurrentFrame$1.getCurrentStack = prevGetCurrentStackImpl;
            }
            if (prevDispatcher === Dispatcher) {
              switchContext(prevContext);
            }
          }
        }
        function flushSubtree(request, destination, segment) {
          segment.parentFlushed = true;
          switch (segment.status) {
            case PENDING: {
              var segmentID = segment.id = request.nextSegmentId++;
              segment.lastPushedText = false;
              segment.textEmbedded = false;
              return writePlaceholder(destination, request.responseState, segmentID);
            }
            case COMPLETED: {
              segment.status = FLUSHED;
              var r = true;
              var chunks = segment.chunks;
              var chunkIdx = 0;
              var children = segment.children;
              for (var childIdx = 0; childIdx < children.length; childIdx++) {
                var nextChild = children[childIdx];
                for (; chunkIdx < nextChild.index; chunkIdx++) {
                  writeChunk(destination, chunks[chunkIdx]);
                }
                r = flushSegment(request, destination, nextChild);
              }
              for (; chunkIdx < chunks.length - 1; chunkIdx++) {
                writeChunk(destination, chunks[chunkIdx]);
              }
              if (chunkIdx < chunks.length) {
                r = writeChunkAndReturn(destination, chunks[chunkIdx]);
              }
              return r;
            }
            default: {
              throw new Error("Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.");
            }
          }
        }
        function flushSegment(request, destination, segment) {
          var boundary = segment.boundary;
          if (boundary === null) {
            return flushSubtree(request, destination, segment);
          }
          boundary.parentFlushed = true;
          if (boundary.forceClientRender) {
            writeStartClientRenderedSuspenseBoundary(destination, request.responseState, boundary.errorDigest, boundary.errorMessage, boundary.errorComponentStack);
            flushSubtree(request, destination, segment);
            return writeEndClientRenderedSuspenseBoundary(destination, request.responseState);
          } else if (boundary.pendingTasks > 0) {
            boundary.rootSegmentID = request.nextSegmentId++;
            if (boundary.completedSegments.length > 0) {
              request.partialBoundaries.push(boundary);
            }
            var id = boundary.id = assignSuspenseBoundaryID(request.responseState);
            writeStartPendingSuspenseBoundary(destination, request.responseState, id);
            flushSubtree(request, destination, segment);
            return writeEndPendingSuspenseBoundary(destination, request.responseState);
          } else if (boundary.byteSize > request.progressiveChunkSize) {
            boundary.rootSegmentID = request.nextSegmentId++;
            request.completedBoundaries.push(boundary);
            writeStartPendingSuspenseBoundary(destination, request.responseState, boundary.id);
            flushSubtree(request, destination, segment);
            return writeEndPendingSuspenseBoundary(destination, request.responseState);
          } else {
            writeStartCompletedSuspenseBoundary(destination, request.responseState);
            var completedSegments = boundary.completedSegments;
            if (completedSegments.length !== 1) {
              throw new Error("A previously unvisited boundary must have exactly one root segment. This is a bug in React.");
            }
            var contentSegment = completedSegments[0];
            flushSegment(request, destination, contentSegment);
            return writeEndCompletedSuspenseBoundary(destination, request.responseState);
          }
        }
        function flushClientRenderedBoundary(request, destination, boundary) {
          return writeClientRenderBoundaryInstruction(destination, request.responseState, boundary.id, boundary.errorDigest, boundary.errorMessage, boundary.errorComponentStack);
        }
        function flushSegmentContainer(request, destination, segment) {
          writeStartSegment(destination, request.responseState, segment.formatContext, segment.id);
          flushSegment(request, destination, segment);
          return writeEndSegment(destination, segment.formatContext);
        }
        function flushCompletedBoundary(request, destination, boundary) {
          var completedSegments = boundary.completedSegments;
          var i = 0;
          for (; i < completedSegments.length; i++) {
            var segment = completedSegments[i];
            flushPartiallyCompletedSegment(request, destination, boundary, segment);
          }
          completedSegments.length = 0;
          return writeCompletedBoundaryInstruction(destination, request.responseState, boundary.id, boundary.rootSegmentID);
        }
        function flushPartialBoundary(request, destination, boundary) {
          var completedSegments = boundary.completedSegments;
          var i = 0;
          for (; i < completedSegments.length; i++) {
            var segment = completedSegments[i];
            if (!flushPartiallyCompletedSegment(request, destination, boundary, segment)) {
              i++;
              completedSegments.splice(0, i);
              return false;
            }
          }
          completedSegments.splice(0, i);
          return true;
        }
        function flushPartiallyCompletedSegment(request, destination, boundary, segment) {
          if (segment.status === FLUSHED) {
            return true;
          }
          var segmentID = segment.id;
          if (segmentID === -1) {
            var rootSegmentID = segment.id = boundary.rootSegmentID;
            if (rootSegmentID === -1) {
              throw new Error("A root segment ID must have been assigned by now. This is a bug in React.");
            }
            return flushSegmentContainer(request, destination, segment);
          } else {
            flushSegmentContainer(request, destination, segment);
            return writeCompletedSegmentInstruction(destination, request.responseState, segmentID);
          }
        }
        function flushCompletedQueues(request, destination) {
          beginWriting();
          try {
            var completedRootSegment = request.completedRootSegment;
            if (completedRootSegment !== null && request.pendingRootTasks === 0) {
              flushSegment(request, destination, completedRootSegment);
              request.completedRootSegment = null;
              writeCompletedRoot(destination, request.responseState);
            }
            var clientRenderedBoundaries = request.clientRenderedBoundaries;
            var i;
            for (i = 0; i < clientRenderedBoundaries.length; i++) {
              var boundary = clientRenderedBoundaries[i];
              if (!flushClientRenderedBoundary(request, destination, boundary)) {
                request.destination = null;
                i++;
                clientRenderedBoundaries.splice(0, i);
                return;
              }
            }
            clientRenderedBoundaries.splice(0, i);
            var completedBoundaries = request.completedBoundaries;
            for (i = 0; i < completedBoundaries.length; i++) {
              var _boundary = completedBoundaries[i];
              if (!flushCompletedBoundary(request, destination, _boundary)) {
                request.destination = null;
                i++;
                completedBoundaries.splice(0, i);
                return;
              }
            }
            completedBoundaries.splice(0, i);
            completeWriting(destination);
            beginWriting(destination);
            var partialBoundaries = request.partialBoundaries;
            for (i = 0; i < partialBoundaries.length; i++) {
              var _boundary2 = partialBoundaries[i];
              if (!flushPartialBoundary(request, destination, _boundary2)) {
                request.destination = null;
                i++;
                partialBoundaries.splice(0, i);
                return;
              }
            }
            partialBoundaries.splice(0, i);
            var largeBoundaries = request.completedBoundaries;
            for (i = 0; i < largeBoundaries.length; i++) {
              var _boundary3 = largeBoundaries[i];
              if (!flushCompletedBoundary(request, destination, _boundary3)) {
                request.destination = null;
                i++;
                largeBoundaries.splice(0, i);
                return;
              }
            }
            largeBoundaries.splice(0, i);
          } finally {
            completeWriting(destination);
            flushBuffered(destination);
            if (request.allPendingTasks === 0 && request.pingedTasks.length === 0 && request.clientRenderedBoundaries.length === 0 && request.completedBoundaries.length === 0) {
              {
                if (request.abortableTasks.size !== 0) {
                  error("There was still abortable task at the root when we closed. This is a bug in React.");
                }
              }
              close(destination);
            }
          }
        }
        function startWork(request) {
          scheduleWork(function() {
            return performWork(request);
          });
        }
        function startFlowing(request, destination) {
          if (request.status === CLOSING) {
            request.status = CLOSED;
            closeWithError(destination, request.fatalError);
            return;
          }
          if (request.status === CLOSED) {
            return;
          }
          if (request.destination !== null) {
            return;
          }
          request.destination = destination;
          try {
            flushCompletedQueues(request, destination);
          } catch (error2) {
            logRecoverableError(request, error2);
            fatalError(request, error2);
          }
        }
        function abort(request, reason) {
          try {
            var abortableTasks = request.abortableTasks;
            abortableTasks.forEach(function(task) {
              return abortTask(task, request, reason);
            });
            abortableTasks.clear();
            if (request.destination !== null) {
              flushCompletedQueues(request, request.destination);
            }
          } catch (error2) {
            logRecoverableError(request, error2);
            fatalError(request, error2);
          }
        }
        function createDrainHandler(destination, request) {
          return function() {
            return startFlowing(request, destination);
          };
        }
        function createAbortHandler(request, reason) {
          return function() {
            return abort(request, reason);
          };
        }
        function createRequestImpl(children, options) {
          return createRequest(children, createResponseState(options ? options.identifierPrefix : void 0, options ? options.nonce : void 0, options ? options.bootstrapScriptContent : void 0, options ? options.bootstrapScripts : void 0, options ? options.bootstrapModules : void 0), createRootFormatContext(options ? options.namespaceURI : void 0), options ? options.progressiveChunkSize : void 0, options ? options.onError : void 0, options ? options.onAllReady : void 0, options ? options.onShellReady : void 0, options ? options.onShellError : void 0, void 0);
        }
        function renderToPipeableStream(children, options) {
          var request = createRequestImpl(children, options);
          var hasStartedFlowing = false;
          startWork(request);
          return {
            pipe: function(destination) {
              if (hasStartedFlowing) {
                throw new Error("React currently only supports piping to one writable stream.");
              }
              hasStartedFlowing = true;
              startFlowing(request, destination);
              destination.on("drain", createDrainHandler(destination, request));
              destination.on("error", createAbortHandler(
                request,
                // eslint-disable-next-line react-internal/prod-error-codes
                new Error("The destination stream errored while writing data.")
              ));
              destination.on("close", createAbortHandler(
                request,
                // eslint-disable-next-line react-internal/prod-error-codes
                new Error("The destination stream closed early.")
              ));
              return destination;
            },
            abort: function(reason) {
              abort(request, reason);
            }
          };
        }
        exports2.renderToPipeableStream = renderToPipeableStream;
        exports2.version = ReactVersion;
      })();
    }
  }
});

// node_modules/react-dom/server.node.js
var require_server_node = __commonJS({
  "node_modules/react-dom/server.node.js"(exports2) {
    "use strict";
    var l;
    var s;
    if (process.env.NODE_ENV === "production") {
      l = require_react_dom_server_legacy_node_production_min();
      s = require_react_dom_server_node_production_min();
    } else {
      l = require_react_dom_server_legacy_node_development();
      s = require_react_dom_server_node_development();
    }
    exports2.version = l.version;
    exports2.renderToString = l.renderToString;
    exports2.renderToStaticMarkup = l.renderToStaticMarkup;
    exports2.renderToNodeStream = l.renderToNodeStream;
    exports2.renderToStaticNodeStream = l.renderToStaticNodeStream;
    exports2.renderToPipeableStream = s.renderToPipeableStream;
  }
});

// node_modules/react/cjs/react-jsx-runtime.production.min.js
var require_react_jsx_runtime_production_min = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.production.min.js"(exports2) {
    "use strict";
    var f = require_react();
    var k = Symbol.for("react.element");
    var l = Symbol.for("react.fragment");
    var m = Object.prototype.hasOwnProperty;
    var n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
    var p = { key: true, ref: true, __self: true, __source: true };
    function q(c, a, g) {
      var b, d = {}, e = null, h = null;
      void 0 !== g && (e = "" + g);
      void 0 !== a.key && (e = "" + a.key);
      void 0 !== a.ref && (h = a.ref);
      for (b in a) m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
      if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
      return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
    }
    exports2.Fragment = l;
    exports2.jsx = q;
    exports2.jsxs = q;
  }
});

// node_modules/react/cjs/react-jsx-runtime.development.js
var require_react_jsx_runtime_development = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.development.js"(exports2) {
    "use strict";
    if (process.env.NODE_ENV !== "production") {
      (function() {
        "use strict";
        var React3 = require_react();
        var REACT_ELEMENT_TYPE = Symbol.for("react.element");
        var REACT_PORTAL_TYPE = Symbol.for("react.portal");
        var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
        var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
        var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
        var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
        var REACT_CONTEXT_TYPE = Symbol.for("react.context");
        var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
        var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
        var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
        var REACT_MEMO_TYPE = Symbol.for("react.memo");
        var REACT_LAZY_TYPE = Symbol.for("react.lazy");
        var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
        var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        var FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          if (maybeIterable === null || typeof maybeIterable !== "object") {
            return null;
          }
          var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
          if (typeof maybeIterator === "function") {
            return maybeIterator;
          }
          return null;
        }
        var ReactSharedInternals = React3.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        function error(format) {
          {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame2.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            var argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        var enableScopeAPI = false;
        var enableCacheElement = false;
        var enableTransitionTracing = false;
        var enableLegacyHidden = false;
        var enableDebugTracing = false;
        var REACT_MODULE_REFERENCE;
        {
          REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
        }
        function isValidElementType(type) {
          if (typeof type === "string" || typeof type === "function") {
            return true;
          }
          if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
            return true;
          }
          if (typeof type === "object" && type !== null) {
            if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
            // types supported by any Flight configuration anywhere since
            // we don't know which Flight build this will end up being used
            // with.
            type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
              return true;
            }
          }
          return false;
        }
        function getWrappedName(outerType, innerType, wrapperName) {
          var displayName = outerType.displayName;
          if (displayName) {
            return displayName;
          }
          var functionName = innerType.displayName || innerType.name || "";
          return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
        }
        function getContextName(type) {
          return type.displayName || "Context";
        }
        function getComponentNameFromType(type) {
          if (type == null) {
            return null;
          }
          {
            if (typeof type.tag === "number") {
              error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
            }
          }
          if (typeof type === "function") {
            return type.displayName || type.name || null;
          }
          if (typeof type === "string") {
            return type;
          }
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                var context = type;
                return getContextName(context) + ".Consumer";
              case REACT_PROVIDER_TYPE:
                var provider = type;
                return getContextName(provider._context) + ".Provider";
              case REACT_FORWARD_REF_TYPE:
                return getWrappedName(type, type.render, "ForwardRef");
              case REACT_MEMO_TYPE:
                var outerName = type.displayName || null;
                if (outerName !== null) {
                  return outerName;
                }
                return getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return getComponentNameFromType(init(payload));
                } catch (x) {
                  return null;
                }
              }
            }
          }
          return null;
        }
        var assign = Object.assign;
        var disabledDepth = 0;
        var prevLog;
        var prevInfo;
        var prevWarn;
        var prevError;
        var prevGroup;
        var prevGroupCollapsed;
        var prevGroupEnd;
        function disabledLog() {
        }
        disabledLog.__reactDisabledLog = true;
        function disableLogs() {
          {
            if (disabledDepth === 0) {
              prevLog = console.log;
              prevInfo = console.info;
              prevWarn = console.warn;
              prevError = console.error;
              prevGroup = console.group;
              prevGroupCollapsed = console.groupCollapsed;
              prevGroupEnd = console.groupEnd;
              var props = {
                configurable: true,
                enumerable: true,
                value: disabledLog,
                writable: true
              };
              Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
              });
            }
            disabledDepth++;
          }
        }
        function reenableLogs() {
          {
            disabledDepth--;
            if (disabledDepth === 0) {
              var props = {
                configurable: true,
                enumerable: true,
                writable: true
              };
              Object.defineProperties(console, {
                log: assign({}, props, {
                  value: prevLog
                }),
                info: assign({}, props, {
                  value: prevInfo
                }),
                warn: assign({}, props, {
                  value: prevWarn
                }),
                error: assign({}, props, {
                  value: prevError
                }),
                group: assign({}, props, {
                  value: prevGroup
                }),
                groupCollapsed: assign({}, props, {
                  value: prevGroupCollapsed
                }),
                groupEnd: assign({}, props, {
                  value: prevGroupEnd
                })
              });
            }
            if (disabledDepth < 0) {
              error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
            }
          }
        }
        var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
        var prefix;
        function describeBuiltInComponentFrame(name, source, ownerFn) {
          {
            if (prefix === void 0) {
              try {
                throw Error();
              } catch (x) {
                var match = x.stack.trim().match(/\n( *(at )?)/);
                prefix = match && match[1] || "";
              }
            }
            return "\n" + prefix + name;
          }
        }
        var reentry = false;
        var componentFrameCache;
        {
          var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
          componentFrameCache = new PossiblyWeakMap();
        }
        function describeNativeComponentFrame(fn, construct) {
          if (!fn || reentry) {
            return "";
          }
          {
            var frame = componentFrameCache.get(fn);
            if (frame !== void 0) {
              return frame;
            }
          }
          var control;
          reentry = true;
          var previousPrepareStackTrace = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          var previousDispatcher;
          {
            previousDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = null;
            disableLogs();
          }
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if (typeof Reflect === "object" && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x) {
                  control = x;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x) {
                control = x;
              }
              fn();
            }
          } catch (sample) {
            if (sample && control && typeof sample.stack === "string") {
              var sampleLines = sample.stack.split("\n");
              var controlLines = control.stack.split("\n");
              var s = sampleLines.length - 1;
              var c = controlLines.length - 1;
              while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                c--;
              }
              for (; s >= 1 && c >= 0; s--, c--) {
                if (sampleLines[s] !== controlLines[c]) {
                  if (s !== 1 || c !== 1) {
                    do {
                      s--;
                      c--;
                      if (c < 0 || sampleLines[s] !== controlLines[c]) {
                        var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                        if (fn.displayName && _frame.includes("<anonymous>")) {
                          _frame = _frame.replace("<anonymous>", fn.displayName);
                        }
                        {
                          if (typeof fn === "function") {
                            componentFrameCache.set(fn, _frame);
                          }
                        }
                        return _frame;
                      }
                    } while (s >= 1 && c >= 0);
                  }
                  break;
                }
              }
            }
          } finally {
            reentry = false;
            {
              ReactCurrentDispatcher.current = previousDispatcher;
              reenableLogs();
            }
            Error.prepareStackTrace = previousPrepareStackTrace;
          }
          var name = fn ? fn.displayName || fn.name : "";
          var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
          {
            if (typeof fn === "function") {
              componentFrameCache.set(fn, syntheticFrame);
            }
          }
          return syntheticFrame;
        }
        function describeFunctionComponentFrame(fn, source, ownerFn) {
          {
            return describeNativeComponentFrame(fn, false);
          }
        }
        function shouldConstruct(Component) {
          var prototype = Component.prototype;
          return !!(prototype && prototype.isReactComponent);
        }
        function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
          if (type == null) {
            return "";
          }
          if (typeof type === "function") {
            {
              return describeNativeComponentFrame(type, shouldConstruct(type));
            }
          }
          if (typeof type === "string") {
            return describeBuiltInComponentFrame(type);
          }
          switch (type) {
            case REACT_SUSPENSE_TYPE:
              return describeBuiltInComponentFrame("Suspense");
            case REACT_SUSPENSE_LIST_TYPE:
              return describeBuiltInComponentFrame("SuspenseList");
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE:
                return describeFunctionComponentFrame(type.render);
              case REACT_MEMO_TYPE:
                return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x) {
                }
              }
            }
          }
          return "";
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var loggedTypeFailures = {};
        var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame.setExtraStackFrame(null);
            }
          }
        }
        function checkPropTypes(typeSpecs, values, location, componentName, element) {
          {
            var has = Function.call.bind(hasOwnProperty);
            for (var typeSpecName in typeSpecs) {
              if (has(typeSpecs, typeSpecName)) {
                var error$1 = void 0;
                try {
                  if (typeof typeSpecs[typeSpecName] !== "function") {
                    var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                    err.name = "Invariant Violation";
                    throw err;
                  }
                  error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
                } catch (ex) {
                  error$1 = ex;
                }
                if (error$1 && !(error$1 instanceof Error)) {
                  setCurrentlyValidatingElement(element);
                  error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                  setCurrentlyValidatingElement(null);
                }
                if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                  loggedTypeFailures[error$1.message] = true;
                  setCurrentlyValidatingElement(element);
                  error("Failed %s type: %s", location, error$1.message);
                  setCurrentlyValidatingElement(null);
                }
              }
            }
          }
        }
        var isArrayImpl = Array.isArray;
        function isArray(a) {
          return isArrayImpl(a);
        }
        function typeName(value) {
          {
            var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
            var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            return type;
          }
        }
        function willCoercionThrow(value) {
          {
            try {
              testStringCoercion(value);
              return false;
            } catch (e) {
              return true;
            }
          }
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkKeyStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
        var RESERVED_PROPS = {
          key: true,
          ref: true,
          __self: true,
          __source: true
        };
        var specialPropKeyWarningShown;
        var specialPropRefWarningShown;
        var didWarnAboutStringRefs;
        {
          didWarnAboutStringRefs = {};
        }
        function hasValidRef(config) {
          {
            if (hasOwnProperty.call(config, "ref")) {
              var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.ref !== void 0;
        }
        function hasValidKey(config) {
          {
            if (hasOwnProperty.call(config, "key")) {
              var getter = Object.getOwnPropertyDescriptor(config, "key").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.key !== void 0;
        }
        function warnIfStringRefCannotBeAutoConverted(config, self) {
          {
            if (typeof config.ref === "string" && ReactCurrentOwner.current && self && ReactCurrentOwner.current.stateNode !== self) {
              var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);
              if (!didWarnAboutStringRefs[componentName]) {
                error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', getComponentNameFromType(ReactCurrentOwner.current.type), config.ref);
                didWarnAboutStringRefs[componentName] = true;
              }
            }
          }
        }
        function defineKeyPropWarningGetter(props, displayName) {
          {
            var warnAboutAccessingKey = function() {
              if (!specialPropKeyWarningShown) {
                specialPropKeyWarningShown = true;
                error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            };
            warnAboutAccessingKey.isReactWarning = true;
            Object.defineProperty(props, "key", {
              get: warnAboutAccessingKey,
              configurable: true
            });
          }
        }
        function defineRefPropWarningGetter(props, displayName) {
          {
            var warnAboutAccessingRef = function() {
              if (!specialPropRefWarningShown) {
                specialPropRefWarningShown = true;
                error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            };
            warnAboutAccessingRef.isReactWarning = true;
            Object.defineProperty(props, "ref", {
              get: warnAboutAccessingRef,
              configurable: true
            });
          }
        }
        var ReactElement = function(type, key, ref, self, source, owner, props) {
          var element = {
            // This tag allows us to uniquely identify this as a React Element
            $$typeof: REACT_ELEMENT_TYPE,
            // Built-in properties that belong on the element
            type,
            key,
            ref,
            props,
            // Record the component responsible for creating this element.
            _owner: owner
          };
          {
            element._store = {};
            Object.defineProperty(element._store, "validated", {
              configurable: false,
              enumerable: false,
              writable: true,
              value: false
            });
            Object.defineProperty(element, "_self", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: self
            });
            Object.defineProperty(element, "_source", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: source
            });
            if (Object.freeze) {
              Object.freeze(element.props);
              Object.freeze(element);
            }
          }
          return element;
        };
        function jsxDEV(type, config, maybeKey, source, self) {
          {
            var propName;
            var props = {};
            var key = null;
            var ref = null;
            if (maybeKey !== void 0) {
              {
                checkKeyStringCoercion(maybeKey);
              }
              key = "" + maybeKey;
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            if (hasValidRef(config)) {
              ref = config.ref;
              warnIfStringRefCannotBeAutoConverted(config, self);
            }
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName];
              }
            }
            if (type && type.defaultProps) {
              var defaultProps = type.defaultProps;
              for (propName in defaultProps) {
                if (props[propName] === void 0) {
                  props[propName] = defaultProps[propName];
                }
              }
            }
            if (key || ref) {
              var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
              if (key) {
                defineKeyPropWarningGetter(props, displayName);
              }
              if (ref) {
                defineRefPropWarningGetter(props, displayName);
              }
            }
            return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
          }
        }
        var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
        var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement$1(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame$1.setExtraStackFrame(null);
            }
          }
        }
        var propTypesMisspellWarningShown;
        {
          propTypesMisspellWarningShown = false;
        }
        function isValidElement(object) {
          {
            return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
          }
        }
        function getDeclarationErrorAddendum() {
          {
            if (ReactCurrentOwner$1.current) {
              var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);
              if (name) {
                return "\n\nCheck the render method of `" + name + "`.";
              }
            }
            return "";
          }
        }
        function getSourceInfoErrorAddendum(source) {
          {
            if (source !== void 0) {
              var fileName = source.fileName.replace(/^.*[\\\/]/, "");
              var lineNumber = source.lineNumber;
              return "\n\nCheck your code at " + fileName + ":" + lineNumber + ".";
            }
            return "";
          }
        }
        var ownerHasKeyUseWarning = {};
        function getCurrentComponentErrorInfo(parentType) {
          {
            var info = getDeclarationErrorAddendum();
            if (!info) {
              var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
              if (parentName) {
                info = "\n\nCheck the top-level render call using <" + parentName + ">.";
              }
            }
            return info;
          }
        }
        function validateExplicitKey(element, parentType) {
          {
            if (!element._store || element._store.validated || element.key != null) {
              return;
            }
            element._store.validated = true;
            var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
            if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
              return;
            }
            ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
            var childOwner = "";
            if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
              childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
            }
            setCurrentlyValidatingElement$1(element);
            error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
            setCurrentlyValidatingElement$1(null);
          }
        }
        function validateChildKeys(node, parentType) {
          {
            if (typeof node !== "object") {
              return;
            }
            if (isArray(node)) {
              for (var i = 0; i < node.length; i++) {
                var child = node[i];
                if (isValidElement(child)) {
                  validateExplicitKey(child, parentType);
                }
              }
            } else if (isValidElement(node)) {
              if (node._store) {
                node._store.validated = true;
              }
            } else if (node) {
              var iteratorFn = getIteratorFn(node);
              if (typeof iteratorFn === "function") {
                if (iteratorFn !== node.entries) {
                  var iterator = iteratorFn.call(node);
                  var step;
                  while (!(step = iterator.next()).done) {
                    if (isValidElement(step.value)) {
                      validateExplicitKey(step.value, parentType);
                    }
                  }
                }
              }
            }
          }
        }
        function validatePropTypes(element) {
          {
            var type = element.type;
            if (type === null || type === void 0 || typeof type === "string") {
              return;
            }
            var propTypes;
            if (typeof type === "function") {
              propTypes = type.propTypes;
            } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
            // Inner props are checked in the reconciler.
            type.$$typeof === REACT_MEMO_TYPE)) {
              propTypes = type.propTypes;
            } else {
              return;
            }
            if (propTypes) {
              var name = getComponentNameFromType(type);
              checkPropTypes(propTypes, element.props, "prop", name, element);
            } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
              propTypesMisspellWarningShown = true;
              var _name = getComponentNameFromType(type);
              error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
            }
            if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
              error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
            }
          }
        }
        function validateFragmentProps(fragment) {
          {
            var keys = Object.keys(fragment.props);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              if (key !== "children" && key !== "key") {
                setCurrentlyValidatingElement$1(fragment);
                error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
                setCurrentlyValidatingElement$1(null);
                break;
              }
            }
            if (fragment.ref !== null) {
              setCurrentlyValidatingElement$1(fragment);
              error("Invalid attribute `ref` supplied to `React.Fragment`.");
              setCurrentlyValidatingElement$1(null);
            }
          }
        }
        var didWarnAboutKeySpread = {};
        function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
          {
            var validType = isValidElementType(type);
            if (!validType) {
              var info = "";
              if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
                info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
              }
              var sourceInfo = getSourceInfoErrorAddendum(source);
              if (sourceInfo) {
                info += sourceInfo;
              } else {
                info += getDeclarationErrorAddendum();
              }
              var typeString;
              if (type === null) {
                typeString = "null";
              } else if (isArray(type)) {
                typeString = "array";
              } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
                typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
                info = " Did you accidentally export a JSX literal instead of a component?";
              } else {
                typeString = typeof type;
              }
              error("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
            }
            var element = jsxDEV(type, props, key, source, self);
            if (element == null) {
              return element;
            }
            if (validType) {
              var children = props.children;
              if (children !== void 0) {
                if (isStaticChildren) {
                  if (isArray(children)) {
                    for (var i = 0; i < children.length; i++) {
                      validateChildKeys(children[i], type);
                    }
                    if (Object.freeze) {
                      Object.freeze(children);
                    }
                  } else {
                    error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
                  }
                } else {
                  validateChildKeys(children, type);
                }
              }
            }
            {
              if (hasOwnProperty.call(props, "key")) {
                var componentName = getComponentNameFromType(type);
                var keys = Object.keys(props).filter(function(k) {
                  return k !== "key";
                });
                var beforeExample = keys.length > 0 ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
                if (!didWarnAboutKeySpread[componentName + beforeExample]) {
                  var afterExample = keys.length > 0 ? "{" + keys.join(": ..., ") + ": ...}" : "{}";
                  error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', beforeExample, componentName, afterExample, componentName);
                  didWarnAboutKeySpread[componentName + beforeExample] = true;
                }
              }
            }
            if (type === REACT_FRAGMENT_TYPE) {
              validateFragmentProps(element);
            } else {
              validatePropTypes(element);
            }
            return element;
          }
        }
        function jsxWithValidationStatic(type, props, key) {
          {
            return jsxWithValidation(type, props, key, true);
          }
        }
        function jsxWithValidationDynamic(type, props, key) {
          {
            return jsxWithValidation(type, props, key, false);
          }
        }
        var jsx4 = jsxWithValidationDynamic;
        var jsxs4 = jsxWithValidationStatic;
        exports2.Fragment = REACT_FRAGMENT_TYPE;
        exports2.jsx = jsx4;
        exports2.jsxs = jsxs4;
      })();
    }
  }
});

// node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS({
  "node_modules/react/jsx-runtime.js"(exports2, module2) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module2.exports = require_react_jsx_runtime_production_min();
    } else {
      module2.exports = require_react_jsx_runtime_development();
    }
  }
});

// workspace/flora/render-entry.jsx
var import_react3 = __toESM(require_react(), 1);
var import_server = __toESM(require_server_node(), 1);

// src/components/brand/flora.jsx
var import_react2 = __toESM(require_react(), 1);

// src/components/journal/Editorial.jsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var T = {
  paper: "#ECE7DA",
  // light matte stationery cream (reference paper — lifted, cleaner)
  paperHi: "#F4EFE3",
  // insets / cards
  paperDeep: "#D8CFBC",
  // deckle / hairline wash
  ink: "#0B0805",
  // primary ink — pushed to effectively black (Halli: really dark)
  inkSoft: "#1A140D",
  // secondary ink — much darker
  muted: "#2E261B",
  // muted labels/dates — much darker (Halli: darker x3)
  gold: "#A8893F",
  // deepened muted hairline accent
  crimson: "#BC2E27",
  // THE heart — the single colour pop
  blush: "#E8B4B8",
  sage: "#8FAF8F",
  dusk: "#211A12",
  // the one warm near-black "dusk" surface (Tonight card) — NOT a violet
  wax: "#EFE3C9"
  // warm-cream inset for wax seals / mic / reaction discs (named, was a literal)
};
var PAPER_TEX = "data:image/png;base64,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";
var PAPER_BG = {
  backgroundColor: T.paper,
  backgroundImage: `radial-gradient(130% 80% at 28% -6%, rgba(255,253,247,0.6) 0%, rgba(255,253,247,0) 44%),radial-gradient(135% 120% at 50% 48%, rgba(0,0,0,0) 56%, rgba(58,48,32,0.16) 100%),linear-gradient(rgba(238,233,222,0.5), rgba(238,233,222,0.5)),url("${PAPER_TEX}")`,
  // real paper-grain image
  backgroundSize: "auto, auto, auto, 300px 300px",
  backgroundRepeat: "no-repeat, no-repeat, repeat, repeat",
  // SCROLL (not fixed): a fixed texture stays pinned to the viewport while content
  // scrolls — that read as a "second background scrolling separately" (parallax artifact),
  // and doubled when two PAPER_BG layers nested (page + hub root). Scroll = one coherent
  // background that moves with the page. (Also avoids the known iOS fixed-bg bugs.)
  backgroundAttachment: "scroll, scroll, scroll, scroll",
  backgroundBlendMode: "normal, normal, normal, multiply"
};
var SHEET_BG = {
  backgroundColor: T.paper,
  backgroundImage: `linear-gradient(rgba(238,233,222,0.5), rgba(238,233,222,0.5)),url("${PAPER_TEX}")`,
  backgroundSize: "auto, 300px 300px",
  backgroundRepeat: "repeat, repeat",
  backgroundAttachment: "scroll, scroll",
  backgroundBlendMode: "normal, multiply"
};

// src/components/brand/flora.jsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function lighten(hex, amt) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (n >> 16 & 255) + Math.round(255 * amt));
  const g = Math.min(255, (n >> 8 & 255) + Math.round(255 * amt));
  const b = Math.min(255, (n & 255) + Math.round(255 * amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
function darken(hex, amt) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (n >> 16 & 255) - Math.round(255 * amt));
  const g = Math.max(0, (n >> 8 & 255) - Math.round(255 * amt));
  const b = Math.max(0, (n & 255) - Math.round(255 * amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
function lum(hex) {
  const n = parseInt(String(hex).replace("#", ""), 16);
  return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
}
var COLORWAYS = [
  { key: "crimson", label: "Crimson", meaning: "love \xB7 remembrance", petal: "#BC2E27", tip: "#D9554E", accent: "#2E261B" },
  { key: "blush", label: "Blush", meaning: "grace \xB7 tenderness", petal: "#E8B4B8", tip: "#F4D9DC", accent: "#A8893F" },
  { key: "gold", label: "Gold", meaning: "joy \xB7 radiance", petal: "#D4AF37", tip: "#E8CE78", accent: "#6B5840" },
  { key: "sage", label: "Sage", meaning: "renewal \xB7 hope", petal: "#8FAF8F", tip: "#B6CDB6", accent: "#2E261B" },
  { key: "plum", label: "Plum", meaning: "dignity \xB7 wisdom", petal: "#8E6E8E", tip: "#B196B1", accent: "#D4AF37" },
  { key: "lavender", label: "Lavender", meaning: "devotion \xB7 serenity", petal: "#B6A6C9", tip: "#D4C9E2", accent: "#8E6E8E" },
  { key: "cream", label: "Cream", meaning: "purity \xB7 a fresh start", petal: "#E4DAC1", tip: "#F2EAD6", accent: "#A8893F" },
  { key: "coral", label: "Coral", meaning: "warmth \xB7 enthusiasm", petal: "#E08A6A", tip: "#F0B79E", accent: "#8E3B2C" },
  { key: "sky", label: "Sky", meaning: "trust \xB7 constancy", petal: "#9FB6C9", tip: "#C3D2DE", accent: "#5F7E8E" }
];
var cwOf = (key) => COLORWAYS.find((c) => c.key === key) || COLORWAYS[0];
var floraKeyframes = `@keyframes fwcBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}@keyframes fwcSway{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg) translateY(-1px)}}@keyframes fwcShimmer{0%,100%{opacity:.45}50%{opacity:.85}}@keyframes fwcDrift{0%,100%{transform:translate(0,0) rotate(-3deg)}50%{transform:translate(4px,-5px) rotate(3deg)}}@keyframes fwcFlutter{0%,100%{transform:scaleX(1)}50%{transform:scaleX(0.86)}}@keyframes fwcGlow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.72;transform:scale(1.04)}}@media (prefers-reduced-motion:reduce){.fwc-anim *{animation:none!important}}`;
var PETAL_BLOOM_CX = 50;
var PETAL_BLOOM_CY = 50;
function petalRound(len, wid) {
  const w = wid, L = len;
  return `M0 0 C ${-w} ${-L * 0.24} ${-w * 0.98} ${-L * 0.7} ${-w * 0.42} ${-L * 0.88} C ${-w * 0.18} ${-L * 0.97} ${-w * 0.05} ${-L} 0 ${-L * 0.92} C ${w * 0.05} ${-L} ${w * 0.18} ${-L * 0.97} ${w * 0.42} ${-L * 0.88} C ${w * 0.98} ${-L * 0.7} ${w} ${-L * 0.24} 0 0 Z`;
}
function petalPoint(len, wid) {
  const w = wid, L = len;
  return `M0 0 C ${-w} ${-L * 0.36} ${-w * 0.55} ${-L * 0.8} 0 ${-L} C ${w * 0.55} ${-L * 0.8} ${w} ${-L * 0.36} 0 0 Z`;
}
var GOLD_ANGLE = 137.50776;
function petalCup(len, wid) {
  const w = wid, L = len;
  return `M0 0 C ${-w} ${-L * 0.3} ${-w * 0.95} ${-L * 0.82} ${-w * 0.34} ${-L * 0.99} C ${-w * 0.1} ${-L * 1.02} ${w * 0.1} ${-L * 1.02} ${w * 0.34} ${-L * 0.99} C ${w * 0.95} ${-L * 0.82} ${w} ${-L * 0.3} 0 0 Z`;
}
function petalBroad(len, wid) {
  const w = wid, L = len;
  return `M0 0 C ${-w * 1.04} ${-L * 0.22} ${-w * 1.02} ${-L * 0.66} ${-w * 0.5} ${-L * 0.92} C ${-w * 0.2} ${-L * 1.04} ${w * 0.2} ${-L * 1.04} ${w * 0.5} ${-L * 0.92} C ${w * 1.02} ${-L * 0.66} ${w * 1.04} ${-L * 0.22} 0 0 Z`;
}
function petalLance(len, wid) {
  const w = wid, L = len;
  return `M0 0 C ${-w} ${-L * 0.34} ${-w * 0.5} ${-L * 0.84} 0 ${-L} C ${w * 0.5} ${-L * 0.84} ${w} ${-L * 0.34} 0 0 Z`;
}
var FORM_RINGS = {
  peony: [[12, 30, 8.5, 0, "O", 0.97], [10, 23, 7, 18, "M", 0.98], [8, 15, 5.4, 9, "I", 0.99]],
  rose: [[8, 29, 9.5, 0, "O", 0.95], [7, 22, 8.6, 26, "M", 0.97], [6, 15, 7.6, 12, "I", 0.98], [5, 9, 6.4, 22, "I", 0.99]],
  ranunculus: [[11, 25, 6.6, 0, "O", 0.95], [10, 19, 5.8, 17, "M", 0.97], [9, 13.5, 4.8, 9, "I", 0.98], [7, 8.5, 4, 14, "I", 0.99]],
  camellia: [[8, 28, 8.4, 0, "O", 0.96], [7, 20, 7.2, 24, "M", 0.98], [6, 13, 6, 12, "I", 0.99]],
  marigold: [[14, 27, 4.6, 0, "O", 0.95], [13, 20.5, 4, 13, "M", 0.97], [11, 14.5, 3.5, 7, "I", 0.98], [8, 9, 3, 11, "I", 0.99]],
  dahlia: [[12, 33, 5, 0, "O", 0.95], [12, 26, 4.6, 15, "M", 0.97], [10, 19, 4, 7.5, "M", 0.98], [8, 12, 3.4, 11, "I", 0.99]],
  chrysanthemum: [[18, 33, 3, 0, "O", 0.95], [16, 26, 2.8, 10, "M", 0.97], [13, 18, 2.5, 6, "I", 0.98]],
  cosmos: [[8, 34, 7, 0, "O", 0.96]],
  anemone: [[7, 31, 8.8, 0, "O", 0.96]],
  magnolia: [[9, 36, 8, 0, "O", 0.96], [6, 25, 7, 20, "M", 0.97]],
  hellebore: [[5, 30, 11, 0, "O", 0.95]],
  lotus: [[8, 36, 9, 0, "O", 0.9], [7, 27, 8, 25, "M", 0.95], [6, 18, 6.6, 12, "I", 0.98]],
  poppy: [[5, 35, 15, 0, "O", 0.96], [5, 23, 11, 36, "M", 0.98]],
  daisy: [[20, 35, 3.2, 0, "O", 0.97, 1], [20, 29, 2.8, 9, "M", 0.98, 1]],
  forget: [[5, 24, 11.5, 0, "O", 0.96], [5, 15, 7.5, 36, "M", 0.98]],
  cornflower: [[10, 30, 4, 0, "O", 0.95, 1], [8, 20, 3.4, 18, "M", 0.97, 1]]
};
var CENTER_KIND = {
  peony: "tuft",
  rose: "tuft",
  ranunculus: "tuft",
  camellia: "tuft",
  marigold: "tuft",
  dahlia: "tuft",
  chrysanthemum: "tuft",
  magnolia: "tuft",
  poppy: "dark",
  anemone: "dark",
  cornflower: "dark",
  daisy: "gold",
  forget: "gold",
  cosmos: "gold",
  lotus: "gold",
  hellebore: "stamen"
};
var VEINED = /* @__PURE__ */ new Set(["poppy", "forget", "anemone", "cosmos", "hellebore"]);
var PETAL_FN = { round: petalRound, point: petalPoint, cup: petalCup, broad: petalBroad, lance: petalLance };
var SHAPE = {
  peony: "cup",
  camellia: "cup",
  ranunculus: "cup",
  marigold: "cup",
  anemone: "broad",
  cosmos: "broad",
  hellebore: "broad",
  poppy: "broad",
  dahlia: "point",
  chrysanthemum: "point",
  daisy: "point",
  cornflower: "point",
  lotus: "lance"
};
var FORM_BELL = "foxglove";
var FORM_FERN = "fern";
var FORM_SUN = "sunflower";
var FORM_SNOWDROP = "snowdrop";
var FORM_TULIP = "tulip";
var FORM_ROSE = "rose";
var FORM_HIBISCUS = "hibiscus";
var FORM_LILY = "lily";
var FORM_MAGNOLIA = "magnolia";
function RichBloomV2({ color = T.blush, color2 = null, accent = "#CBA24E", size = 150, animate = true, soft = true, idx = 0, form = "peony" }) {
  const cx = PETAL_BLOOM_CX, cy = PETAL_BLOOM_CY;
  const _pale = lum(color) > 0.62, _d = _pale ? 0.26 : 0.13, _k = _pale ? 0.42 : 0.3;
  const lightest = color2 || lighten(color, 0.52), light = lighten(color, 0.34), mid = lighten(color, 0.14), deep = color, deeper = darken(color, _d), darkest = darken(color, _k);
  const sheen = lighten(color, 0.62);
  const gid = `v2${idx}`;
  const delay = `${idx % 5 * 0.7}s`;
  const formKey = (typeof form === "string" ? form : form?.key) || "peony";
  const gradFor = (code) => code === "O" ? `pO-${gid}` : code === "M" ? `pM-${gid}` : `pI-${gid}`;
  const edgeFor = (code) => code === "O" ? deeper : code === "M" ? deep : mid;
  const ring = (count, len, wid, gradId, op, rot, edge, shape = "round", vein) => Array.from({ length: count }).map((_, i) => {
    const ang = rot + i * (360 / count);
    const d = (PETAL_FN[shape] || petalRound)(len, wid);
    const cup = shape === "cup";
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { transform: `translate(${cx} ${cy}) rotate(${ang})`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d, fill: `url(#${gradId})`, opacity: op, stroke: edge, strokeWidth: edge ? 0.4 : void 0, strokeOpacity: edge ? 0.16 : void 0 }),
      cup && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: `M0 ${-len * 0.18} Q ${wid * 0.16} ${-len * 0.55} 0 ${-len * 0.9}`, stroke: sheen, strokeWidth: "0.5", strokeOpacity: "0.32", fill: "none", strokeLinecap: "round" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: `M ${-wid * 0.44} ${-len * 0.24} Q ${-wid * 0.28} ${-len * 0.6} ${-wid * 0.12} ${-len * 0.86}`, stroke: deeper, strokeWidth: "0.4", strokeOpacity: "0.18", fill: "none", strokeLinecap: "round" })
      ] }),
      vein && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: `M0 -1 Q ${wid * 0.05} ${-len * 0.5} 0 ${-len * 0.82}`, stroke: sheen, strokeWidth: "0.55", strokeOpacity: "0.4", fill: "none", strokeLinecap: "round" })
    ] }, `${gradId}-${i}`);
  });
  const centerTuft = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: "13", fill: `url(#occ-${gid})` }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: "5", fill: `url(#ct-${gid})` }),
    Array.from({ length: 16 }).map((_, i) => {
      const a = i * (360 / 16) * Math.PI / 180;
      const rr = 4.8;
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: cx + Math.cos(a) * rr, cy: cy + Math.sin(a) * rr, r: "1.5", fill: `url(#ct-${gid})`, opacity: "0.92" }, `s${i}`);
    }),
    Array.from({ length: 9 }).map((_, i) => {
      const a = i * (360 / 9) * Math.PI / 180;
      const rr = 2.4;
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: cx + Math.cos(a) * rr, cy: cy + Math.sin(a) * rr, r: "0.7", fill: darken(accent, 0.18), opacity: "0.85" }, `d${i}`);
    }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: cx - 1.3, cy: cy - 1.3, r: "1.5", fill: lighten(accent, 0.36), opacity: "0.8" })
  ] });
  const centerDark = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: "8.2", fill: darken(color, 0.5) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: "9.5", fill: `url(#occ-${gid})` }),
    Array.from({ length: 13 }).map((_, i) => {
      const a = i * (360 / 13) * Math.PI / 180;
      const rr = 6;
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: cx + Math.cos(a) * rr, cy: cy + Math.sin(a) * rr, r: "0.95", fill: darken(color, 0.66), opacity: "0.92" }, `s${i}`);
    }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: "2.6", fill: darken(color, 0.34) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: cx - 0.8, cy: cy - 0.8, r: "0.9", fill: lighten(color, 0.12), opacity: "0.5" })
  ] });
  const centerGold = (big) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: big ? 9 : 6.8, fill: `url(#disc-${gid})` }),
    Array.from({ length: big ? 18 : 12 }).map((_, i) => {
      const a = i * (360 / (big ? 18 : 12)) * Math.PI / 180;
      const rr = big ? 6.4 : 4.7;
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: cx + Math.cos(a) * rr, cy: cy + Math.sin(a) * rr, r: big ? 1.05 : 0.95, fill: "#7A5A22", opacity: "0.78" }, `s${i}`);
    }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: big ? 3 : 2.2, fill: "#E9CF7A" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: cx - 0.9, cy: cy - 0.9, r: "1", fill: "#FFF6D8", opacity: "0.7" })
  ] });
  const centerStamen = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: "6.2", fill: lighten(color, 0.42) }),
    Array.from({ length: 18 }).map((_, i) => {
      const a = i * (360 / 18) * Math.PI / 180;
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: cx, y1: cy, x2: cx + Math.cos(a) * 6.6, y2: cy + Math.sin(a) * 6.6, stroke: darken(accent, 0.05), strokeWidth: "0.5", opacity: "0.7" }, `l${i}`);
    }),
    Array.from({ length: 18 }).map((_, i) => {
      const a = i * (360 / 18) * Math.PI / 180;
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: cx + Math.cos(a) * 6.6, cy: cy + Math.sin(a) * 6.6, r: "0.75", fill: accent }, `t${i}`);
    }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: "2.6", fill: "#E9CF7A" })
  ] });
  const centerFor = (kind, big) => kind === "dark" ? centerDark() : kind === "gold" ? centerGold(big) : kind === "stamen" ? centerStamen() : centerTuft();
  const speculars = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { style: animate ? { animation: `fwcShimmer 5s ease-in-out infinite`, animationDelay: delay } : void 0, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: cx - 7, cy: cy - 11, rx: "6.5", ry: "3.4", fill: "#FFFDF7", opacity: "0.24", transform: `rotate(-24 ${cx - 7} ${cy - 11})` }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: cx - 9, cy: cy - 6, r: "1.4", fill: "#FFFFFF", opacity: "0.55" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: cx + 6, cy: cy - 9, r: "1.0", fill: "#FFFFFF", opacity: "0.4" })
  ] });
  const petalHead = () => {
    const rings = FORM_RINGS[formKey] || FORM_RINGS.peony;
    const kind = CENTER_KIND[formKey] || "tuft";
    const vein = VEINED.has(formKey);
    const shape = SHAPE[formKey] || "round";
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      rings.map(([count, len, wid, rot, code, op]) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react2.default.Fragment, { children: ring(count, len, wid, gradFor(code), op, rot, edgeFor(code), shape, vein) }, `${code}-${rot}`)),
      centerFor(kind, formKey === "daisy" || formKey === "cosmos"),
      speculars()
    ] });
  };
  const sunRay = (L, w) => `M0 0 C ${-w} ${-L * 0.32} ${-w * 0.6} ${-L * 0.78} ${-w * 0.5} ${-L * 0.93} C ${-w * 0.3} ${-L} ${w * 0.3} ${-L} ${w * 0.5} ${-L * 0.93} C ${w * 0.6} ${-L * 0.78} ${w} ${-L * 0.32} 0 0 Z`;
  const sunHead = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
    Array.from({ length: 24 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: sunRay(34, 5.2), fill: `url(#pO-${gid})`, stroke: deeper, strokeWidth: "0.4", strokeOpacity: "0.18", transform: `translate(${cx} ${cy}) rotate(${i * 15})` }, `so${i}`)),
    Array.from({ length: 24 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: sunRay(29, 4.6), fill: `url(#pM-${gid})`, transform: `translate(${cx} ${cy}) rotate(${7.5 + i * 15})` }, `sm${i}`)),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: "15.5", fill: `url(#disc-${gid})` }),
    Array.from({ length: 150 }).map((_, i) => {
      const a = i * GOLD_ANGLE * Math.PI / 180;
      const rr = 1.32 * Math.sqrt(i);
      if (rr > 14.5) return null;
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: cx + Math.cos(a) * rr, cy: cy + Math.sin(a) * rr, r: "0.82", fill: i % 2 ? "#5E4419" : "#7A5A22", opacity: "0.92" }, `sd${i}`);
    }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: "15.5", fill: "none", stroke: darken(color, 0.24), strokeWidth: "0.7", opacity: "0.4" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: cx - 5, cy: cy - 5, rx: "4", ry: "2.4", fill: "#FFFFFF", opacity: "0.10", transform: `rotate(-30 ${cx - 5} ${cy - 5})` })
  ] });
  const snowdropHead = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M50 16 C 50 26 50 32 50 37", stroke: `url(#st-${gid})`, strokeWidth: "1.7", fill: "none", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M50 33 C 56 33 59 36 57 39", stroke: "#7E9A7E", strokeWidth: "1", fill: "none", strokeLinecap: "round", opacity: "0.8" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { transform: "translate(50 40)", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M0 1 C -7.5 4 -8.5 17 -3 24 C -1 26 1 26 0.5 23 Z", fill: `url(#snowO-${gid})`, stroke: darken(lightest, 0.06), strokeWidth: "0.3", strokeOpacity: "0.4" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M0 1 C 7.5 4 8.5 17 3 24 C 1 26 -1 26 -0.5 23 Z", fill: `url(#snowO-${gid})`, stroke: darken(lightest, 0.06), strokeWidth: "0.3", strokeOpacity: "0.4" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M0 1 C -2.4 7 -2.4 20 0 25 C 2.4 20 2.4 7 0 1 Z", fill: `url(#snowM-${gid})` }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M0 21 C -2.2 20 -2.2 17.5 0 16.5 C 2.2 17.5 2.2 20 0 21 Z", fill: "#7FA77F", opacity: "0.85" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: "-2.2", cy: "7", rx: "1.3", ry: "3.2", fill: "#FFFFFF", opacity: "0.55" })
    ] })
  ] });
  const tulipHead = () => {
    const tp = (rot, s, grad, op) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M0 0 C -8.5 -5 -9 -27 0 -36 C 9 -27 8.5 -5 0 0 Z", fill: `url(#${grad})`, opacity: op, stroke: deep, strokeWidth: "0.3", strokeOpacity: "0.2", transform: `translate(${cx} ${cy + 12}) rotate(${rot}) scale(${s})` });
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
      tp(-22, 1, `pO-${gid}`, 0.95),
      tp(22, 1, `pO-${gid}`, 0.95),
      tp(0, 1.06, `pM-${gid}`, 0.97),
      tp(-11, 0.84, `pI-${gid}`, 0.98),
      tp(11, 0.84, `pI-${gid}`, 0.98),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: cx - 3, cy: cy - 12, rx: "2.2", ry: "6", fill: "#FFFFFF", opacity: "0.2", transform: `rotate(-12 ${cx - 3} ${cy - 12})` })
    ] });
  };
  const bellHead = () => {
    const bells = [
      { x: 50, y: 56, s: 1.18 },
      { x: 42, y: 49, s: 1.02 },
      { x: 57, y: 47, s: 0.96 },
      { x: 45, y: 39, s: 0.84 },
      { x: 54, y: 33, s: 0.72 },
      { x: 50, y: 26, s: 0.6 }
    ];
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M50 62 C 49 46 51 30 50 18", stroke: `url(#st-${gid})`, strokeWidth: "2.2", fill: "none", strokeLinecap: "round" }),
      bells.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { transform: `translate(${b.x} ${b.y}) scale(${b.s})`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M0 -7 C -5.2 -6 -6 0 -5 5.4 C -4 8.4 4 8.4 5 5.4 C 6 0 5.2 -6 0 -7 Z", fill: `url(#pM-${gid})`, stroke: deep, strokeWidth: "0.3", strokeOpacity: "0.22" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: "0", cy: "5.6", rx: "4.6", ry: "1.9", fill: deeper, opacity: "0.45" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "-1.5", cy: "3.2", r: "0.5", fill: lightest, opacity: "0.85" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "1.5", cy: "4.2", r: "0.5", fill: lightest, opacity: "0.75" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: "-2", cy: "-3", rx: "1.7", ry: "1.05", fill: "#FFFDF7", opacity: "0.32", transform: "rotate(-20 -2 -3)" })
      ] }, i))
    ] });
  };
  const fernHead = () => {
    const frond = (rot, len, key) => {
      const pairs = 7;
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { transform: `translate(${cx} 60) rotate(${rot})`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: `M0 0 Q 3 ${-len / 2} 1 ${-len}`, stroke: `url(#lf-${gid})`, strokeWidth: "1.5", fill: "none", strokeLinecap: "round" }),
        Array.from({ length: pairs }).map((_, i) => {
          const t = (i + 0.5) / pairs, yy = -len * t, ll = 5.6 * (1 - t * 0.66);
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: -ll * 0.7, cy: yy, rx: ll, ry: ll * 0.34, fill: `url(#lf-${gid})`, opacity: "0.92", transform: `rotate(-32 ${-ll * 0.7} ${yy})` }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: ll * 0.7, cy: yy, rx: ll, ry: ll * 0.34, fill: `url(#lf-${gid})`, opacity: "0.92", transform: `rotate(32 ${ll * 0.7} ${yy})` })
          ] }, i);
        })
      ] }, key);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
      frond(-20, 42, "fl"),
      frond(0, 50, "fc"),
      frond(20, 42, "fr")
    ] });
  };
  const roseGuard = (L, w) => `M0 0 C ${-w} ${-L * 0.28} ${-w * 0.98} ${-L * 0.74} ${-w * 0.46} ${-L * 0.95} C ${-w * 0.18} ${-L * 1.04} ${w * 0.18} ${-L * 1.04} ${w * 0.46} ${-L * 0.95} C ${w * 0.98} ${-L * 0.74} ${w} ${-L * 0.28} 0 0 Z`;
  const roseHead = () => {
    const W = "M0 0 C -8 -2 -10.5 -11 -3.5 -15.5 C 1.5 -18.5 9.5 -14 8 -6.5 C 7 -1.8 1.2 -2.4 1.6 -7";
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
      Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: roseGuard(34, 15), fill: `url(#pO-${gid})`, stroke: deeper, strokeWidth: "0.5", strokeOpacity: "0.22", transform: `translate(${cx} ${cy}) rotate(${i * 72})` }, `g1${i}`)),
      Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { transform: `translate(${cx} ${cy}) rotate(${36 + i * 72})`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: roseGuard(27, 12.5), fill: `url(#pM-${gid})`, stroke: deep, strokeWidth: "0.4", strokeOpacity: "0.2" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M0 -5.4 Q 2 -14.8 0 -23.2", stroke: sheen, strokeWidth: "0.5", strokeOpacity: "0.3", fill: "none", strokeLinecap: "round" })
      ] }, `g2${i}`)),
      Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: roseGuard(20, 10), fill: `url(#pM-${gid})`, stroke: deep, strokeWidth: "0.4", strokeOpacity: "0.2", transform: `translate(${cx} ${cy}) rotate(${i * 72})` }, `g3${i}`)),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: "14", fill: `url(#occ-${gid})` }),
      Array.from({ length: 9 }).map((_, i) => {
        const sc = 1.45 - i * 0.115;
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: W, transform: `translate(${cx} ${cy}) rotate(${i * 52}) scale(${sc})`, fill: `url(#${i % 2 ? "pI" : "pM"}-${gid})`, stroke: deeper, strokeWidth: "0.4", strokeOpacity: "0.26" }, `c${i}`);
      }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: "1.8", fill: deeper, opacity: "0.55" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: cx - 8, cy: cy - 9, rx: "4", ry: "2.4", fill: "#FFFDF7", opacity: "0.22", transform: `rotate(-28 ${cx - 8} ${cy - 9})` })
    ] });
  };
  const hibiscusHead = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
    Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { transform: `translate(${cx} ${cy}) rotate(${i * 72})`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: petalBroad(37, 16), fill: `url(#pO-${gid})`, stroke: deeper, strokeWidth: "0.4", strokeOpacity: "0.18" }),
      [-1, 0, 1].map((k) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: `M0 -3 Q ${k * 3.6} ${-19} ${k * 2.3} ${-33}`, stroke: darken(color, 0.24), strokeWidth: "0.45", strokeOpacity: "0.32", fill: "none", strokeLinecap: "round" }, k))
    ] }, i)),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: "11", fill: darken(color, 0.46) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: "13", fill: `url(#occ-${gid})` }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: `M${cx} ${cy} Q ${cx + 9} ${cy - 17} ${cx + 13} ${cy - 31}`, stroke: darken(color, 0.18), strokeWidth: "2", fill: "none", strokeLinecap: "round" }),
    Array.from({ length: 11 }).map((_, i) => {
      const t = i / 11;
      const px = cx + 9 * t * 1.1 + (i % 2 ? 2.1 : -2.1);
      const py = cy - 22 * t - 6;
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: px, cy: py, r: "1.25", fill: "#E9CF7A", stroke: "#B98F2E", strokeWidth: "0.2" }, i);
    }),
    Array.from({ length: 5 }).map((_, i) => {
      const a = i * 72 * Math.PI / 180;
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: cx + 13 + Math.cos(a) * 2.4, cy: cy - 31 + Math.sin(a) * 2.4, r: "1.5", fill: darken(color, 0.05) }, `sg${i}`);
    }),
    speculars()
  ] });
  const ANTHER = "#9A6B2E";
  const lilyHead = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
    Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { transform: `translate(${cx} ${cy}) rotate(${i * 60})`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: petalLance(37, 8), fill: `url(#${i % 2 ? "pM" : "pO"}-${gid})`, stroke: deeper, strokeWidth: "0.4", strokeOpacity: "0.16" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M0 -3 L 0 -34", stroke: darken(color, 0.18), strokeWidth: "0.4", strokeOpacity: "0.26" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "0", cy: "-11", r: "0.8", fill: darken(color, 0.3), opacity: "0.45" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "-1.4", cy: "-15", r: "0.6", fill: darken(color, 0.3), opacity: "0.4" })
    ] }, i)),
    Array.from({ length: 6 }).map((_, i) => {
      const a = (i * 60 + 30) * Math.PI / 180;
      const ex = cx + Math.cos(a) * 17, ey = cy + Math.sin(a) * 17;
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: cx, y1: cy, x2: ex, y2: ey, stroke: lighten(ANTHER, 0.18), strokeWidth: "0.9", strokeLinecap: "round" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: ex, cy: ey, rx: "2.6", ry: "1.3", fill: ANTHER, transform: `rotate(${i * 60 + 30} ${ex} ${ey})` })
      ] }, `st${i}`);
    }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx, cy: cy - 1, rx: "2", ry: "3", fill: `url(#ct-${gid})` }),
    speculars()
  ] });
  const magnoliaHead = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
    Array.from({ length: 9 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: petalBroad(36, 8.5), fill: `url(#${i % 2 ? "pO" : "pM"}-${gid})`, opacity: "0.96", stroke: deeper, strokeWidth: "0.4", strokeOpacity: "0.14", transform: `translate(${cx} ${cy}) rotate(${i * 40})` }, i)),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx, cy, rx: "4.2", ry: "6.4", fill: `url(#ct-${gid})` }),
    Array.from({ length: 11 }).map((_, i) => {
      const a = i * 33 * Math.PI / 180;
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: cx + Math.cos(a) * 3, cy: cy + Math.sin(a) * 4.4, r: "0.7", fill: darken(accent, 0.12), opacity: "0.7" }, i);
    }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: cx - 1, cy: cy - 2, rx: "1.5", ry: "2.6", fill: "#FFFDF7", opacity: "0.34" }),
    speculars()
  ] });
  const peonyRuffle = (L, w) => `M0 0 C ${-w} ${-L * 0.22} ${-w * 1.02} ${-L * 0.64} ${-w * 0.5} ${-L * 0.82} C ${-w * 0.28} ${-L * 0.9} ${-w * 0.14} ${-L * 0.84} ${-w * 0.06} ${-L * 0.93} C ${-w * 0.02} ${-L * 0.99} ${w * 0.02} ${-L * 0.99} ${w * 0.06} ${-L * 0.93} C ${w * 0.14} ${-L * 0.84} ${w * 0.28} ${-L * 0.9} ${w * 0.5} ${-L * 0.82} C ${w * 1.02} ${-L * 0.64} ${w} ${-L * 0.22} 0 0 Z`;
  const peonyHead = () => {
    const rings = [[11, 31, 12, 0, "O", 0.96], [11, 25, 11, 16, "M", 0.97], [10, 19, 9.5, 9, "M", 0.98], [8, 13.5, 8, 13, "I", 0.98], [6, 8.5, 6.4, 20, "I", 0.99]];
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
      rings.map(([count, len, wid, rot, code, op]) => Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: peonyRuffle(len, wid), fill: `url(#${gradFor(code)})`, opacity: op, stroke: deeper, strokeWidth: "0.4", strokeOpacity: "0.2", transform: `translate(${cx} ${cy}) rotate(${rot + i * (360 / count)})` }, `${code}-${rot}-${i}`))),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: "6", fill: `url(#pI-${gid})` }),
      Array.from({ length: 7 }).map((_, i) => {
        const a = i * 51.4 * Math.PI / 180, rr = 3.4;
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: peonyRuffle(7, 4), fill: `url(#pI-${gid})`, opacity: "0.98", transform: `translate(${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr}) rotate(${i * 51.4 + 90})` }, `pc${i}`);
      }),
      speculars()
    ] });
  };
  const head = formKey === FORM_BELL ? bellHead() : formKey === FORM_FERN ? fernHead() : formKey === FORM_SUN ? sunHead() : formKey === FORM_SNOWDROP ? snowdropHead() : formKey === FORM_TULIP ? tulipHead() : formKey === FORM_ROSE ? roseHead() : formKey === FORM_HIBISCUS ? hibiscusHead() : formKey === FORM_LILY ? lilyHead() : formKey === FORM_MAGNOLIA ? magnoliaHead() : formKey === "peony" ? peonyHead() : petalHead();
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { position: "relative", display: "inline-block", width: size, height: Math.round(size * 1.05), lineHeight: 0 }, children: [
    soft && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 100 105", width: size, height: Math.round(size * 1.05), "aria-hidden": true, style: { position: "absolute", inset: 0 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("filter", { id: `bl-${gid}`, x: "-60%", y: "-60%", width: "220%", height: "220%", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("feGaussianBlur", { stdDeviation: "1.9" }) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx, cy: 97, rx: 20, ry: 4.6, fill: "#2E261B", opacity: "0.22", filter: `url(#bl-${gid})` })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 100 105", width: size, height: Math.round(size * 1.05), "aria-hidden": true, style: { position: "relative", overflow: "visible" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("defs", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: `pO-${gid}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: light }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "24%", stopColor: mid }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "70%", stopColor: deep }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: deeper })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: `pM-${gid}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: lightest }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "30%", stopColor: light }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "72%", stopColor: mid }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: deep })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: `pI-${gid}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: sheen }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "45%", stopColor: lightest }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: light })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("radialGradient", { id: `gl-${gid}`, cx: "50%", cy: "46%", r: "52%", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: lightest, stopOpacity: "0.34" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: color, stopOpacity: "0" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("radialGradient", { id: `ct-${gid}`, cx: "42%", cy: "38%", r: "64%", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: lighten(accent, 0.34) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "60%", stopColor: accent }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: darken(accent, 0.16) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("radialGradient", { id: `occ-${gid}`, cx: "50%", cy: "50%", r: "50%", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: darkest, stopOpacity: "0.5" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "55%", stopColor: darkest, stopOpacity: "0.26" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: darkest, stopOpacity: "0" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("radialGradient", { id: `disc-${gid}`, cx: "42%", cy: "40%", r: "64%", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: "#A07A2E" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "60%", stopColor: "#6E4F1C" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: "#4A3412" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: `snowO-${gid}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: "#FFFFFF" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: lightest })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: `snowM-${gid}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: lighten(lightest, 0.2) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: light })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: `st-${gid}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: "#8FAF8F" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: "#5F7E5F" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: `lf-${gid}`, x1: "0", y1: "0", x2: "1", y2: "1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: "#A6C6A6" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "55%", stopColor: "#82A282" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: "#5F7E5F" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx, cy, r: "36", fill: `url(#gl-${gid})` }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: `M48.4 97 C 47.9 84 49.4 70 49 60 L 51 60 C 51.4 70 52 84 51.5 97 Z`, fill: `url(#st-${gid})` }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M49 78 C 37 74 29 77 26 86 C 37 88 47 83 49 77 Z", fill: `url(#lf-${gid})`, opacity: "0.95" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M49 78 C 41 79 33 82 27 86", stroke: "#5F7E5F", strokeWidth: "0.7", fill: "none", strokeLinecap: "round", opacity: "0.7" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M42 79 L 39 76 M37 81 L 34 79 M33 83 L 31 82", stroke: "#5F7E5F", strokeWidth: "0.5", fill: "none", strokeLinecap: "round", opacity: "0.55" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M51 71 C 63 67 71 70 74 79 C 63 81 53 76 51 70 Z", fill: `url(#lf-${gid})`, opacity: "0.9" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M51 71 C 59 72 67 75 73 79", stroke: "#5F7E5F", strokeWidth: "0.7", fill: "none", strokeLinecap: "round", opacity: "0.65" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M58 73 L 61 71 M62 75 L 65 74 M66 77 L 68 76", stroke: "#5F7E5F", strokeWidth: "0.5", fill: "none", strokeLinecap: "round", opacity: "0.5" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("g", { style: animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: `fwcBreath 6s ease-in-out infinite`, animationDelay: delay } : void 0, children: head })
    ] })
  ] });
}
function SwayBloom({ children, animate = true, idx = 0 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: animate ? { display: "inline-block", transformOrigin: "bottom center", animation: "fwcSway 8s ease-in-out infinite", animationDelay: `${idx % 5 * 0.9}s` } : { display: "inline-block" }, children });
}
function Bouquet({ items, size = 220, animate = true, idx = "bq" }) {
  const list = items && items.length ? items : [
    { form: "rose", colorway: "crimson", scale: 1, dx: 0, dy: 0, rot: 0 },
    { form: "sunflower", colorway: "gold", scale: 0.72, dx: -0.3, dy: 0.16, rot: -16 },
    { form: "hibiscus", colorway: "coral", scale: 0.66, dx: 0.31, dy: 0.2, rot: 16 },
    { form: "forget", colorway: "sky", scale: 0.42, dx: 0.1, dy: -0.2, rot: 8 }
  ];
  const W = size, H = Math.round(size * 1.14);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { position: "relative", width: W, height: H, lineHeight: 0 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("style", { children: floraKeyframes }),
    list.map((it, i) => {
      const c = cwOf(it.colorway);
      const bs = Math.round(W * 0.6 * (it.scale ?? 1));
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { position: "absolute", left: `calc(50% + ${(it.dx || 0) * W}px)`, top: `calc(46% + ${(it.dy || 0) * H}px)`, transform: `translate(-50%,-50%) rotate(${it.rot || 0}deg)`, zIndex: (it.scale ?? 1) >= 1 ? 3 : 2 }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(SwayBloom, { animate, idx: i, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(RichBloomV2, { form: it.form, color: c.petal, color2: c.tip, accent: c.accent, size: bs, animate, soft: i === 0, idx: `${idx}-${i}` }) }) }, i);
    })
  ] });
}
var CREATURE_AT = {
  petal: { top: "15%", left: "60%", size: 34 },
  leaf: { top: "79%", left: "25%", size: 24 },
  flower: { top: "40%", left: "47%", size: 30 }
};
function BloomWithCreature({ form = "rose", colorway = "crimson", size = 150, creature = "butterfly", at = "petal", animate = true, idx = "bwc" }) {
  const c = cwOf(colorway);
  const p = CREATURE_AT[at] || CREATURE_AT.petal;
  const col = creature === "bee" ? T.gold : creature === "ladybird" ? T.crimson : c.accent;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { position: "relative", width: size, height: Math.round(size * 1.05), display: "inline-block", lineHeight: 0 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(RichBloomV2, { form, color: c.petal, color2: c.tip, accent: c.accent, size, animate, idx }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { position: "absolute", top: p.top, left: p.left, transform: "translate(-50%,-50%)", zIndex: 4, pointerEvents: "none" }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Pollinator, { kind: creature, size: p.size, color: col, color2: c.tip, animate, idx: `${idx}-cr` }) })
  ] });
}
function Butterfly({ size = 46, color = "#8E6E8E", color2 = T.gold, pattern = "spots", animate = true, idx = 0 }) {
  const gid = `bf-${idx}`, c = color, c2 = color2 || T.gold;
  let marks;
  if (pattern === "bands") marks = /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { fill: "none", stroke: darken(c, 0.26), strokeWidth: "2", strokeLinecap: "round", opacity: "0.6", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M-24 -10 C -18 -14 -10 -13 -3 -6" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M-18 13 C -12 11 -7 11 -3 7", strokeWidth: "1.6" })
  ] });
  else if (pattern === "eyes") marks = /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "-15", cy: "-11", r: "3.2", fill: c2, opacity: "0.9" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "-15", cy: "-11", r: "1.4", fill: darken(c, 0.3) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "-12", cy: "13", r: "2.4", fill: c2, opacity: "0.8" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "-12", cy: "13", r: "1", fill: darken(c, 0.3) })
  ] });
  else if (pattern === "tips") marks = /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M-27 -10 C -24 -19 -17 -21 -12 -19 C -16 -14 -22 -11 -27 -10 Z", fill: darken(c, 0.3), opacity: "0.7" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "-13", cy: "11", r: "1.6", fill: c2, opacity: "0.7" })
  ] });
  else marks = /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "-16", cy: "-11", r: "2.6", fill: c2, opacity: "0.9" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "-16", cy: "-11", r: "1.1", fill: darken(c, 0.3) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "-12", cy: "13", r: "1.8", fill: c2, opacity: "0.8" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "-21", cy: "-7", r: "1", fill: "#FFFDF7", opacity: "0.6" })
  ] });
  const sideWing = /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M0 -4 C -10 -22 -24 -22 -27 -10 C -29 -2 -16 -1 -1 -3 Z", fill: `url(#bw-${gid})`, stroke: darken(c, 0.22), strokeWidth: "0.5", strokeOpacity: "0.5" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M-1 0 C -16 0 -25 9 -21 18 C -18 24 -8 21 -2 9 Z", fill: `url(#bh-${gid})`, stroke: darken(c, 0.22), strokeWidth: "0.5", strokeOpacity: "0.5" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M-27 -10 C -24 -22 -10 -22 0 -4", fill: "none", stroke: darken(c, 0.28), strokeWidth: "1.4", strokeLinecap: "round", opacity: "0.55" }),
    marks
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "svg",
    {
      viewBox: "0 0 60 52",
      width: size,
      height: Math.round(size * 0.86),
      "aria-hidden": true,
      style: animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: "fwcDrift 7s ease-in-out infinite", animationDelay: `${idx % 4 * 0.9}s` } : void 0,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("defs", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: `bw-${gid}`, x1: "1", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: lighten(c, 0.3) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "60%", stopColor: c }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: darken(c, 0.16) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: `bh-${gid}`, x1: "1", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: c }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: darken(c, 0.2) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { style: animate ? { transformBox: "fill-box", transformOrigin: "center", animation: "fwcFlutter 0.9s ease-in-out infinite" } : void 0, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("g", { transform: "translate(30 26)", children: sideWing }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("g", { transform: "translate(30 26) scale(-1 1)", children: sideWing })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { transform: "translate(30 26)", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M0 -16 C -1.7 -8 -1.7 10 0 20 C 1.7 10 1.7 -8 0 -16 Z", fill: "#2E261B" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "0", cy: "-16", r: "2", fill: "#2E261B" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M0 -16 C -2 -22 -4 -25 -7 -26", fill: "none", stroke: "#2E261B", strokeWidth: "0.8", strokeLinecap: "round" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M0 -16 C 2 -22 4 -25 7 -26", fill: "none", stroke: "#2E261B", strokeWidth: "0.8", strokeLinecap: "round" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "-7", cy: "-26", r: "1.1", fill: "#2E261B" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "7", cy: "-26", r: "1.1", fill: "#2E261B" })
        ] })
      ]
    }
  );
}
function Bee({ size = 40, color = "#D4AF37", animate = true, idx = 0 }) {
  const gid = `bee-${idx}`;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "svg",
    {
      viewBox: "0 0 48 36",
      width: size,
      height: Math.round(size * 0.75),
      "aria-hidden": true,
      style: animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: "fwcDrift 7s ease-in-out infinite", animationDelay: `${idx % 4 * 0.8}s` } : void 0,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("defs", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: `bb-${gid}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: lighten(color, 0.3) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: darken(color, 0.08) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("radialGradient", { id: `bw-${gid}`, cx: "40%", cy: "35%", r: "70%", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: "#FFFFFF", stopOpacity: "0.85" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: "#DCE6EE", stopOpacity: "0.35" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { style: animate ? { transformBox: "fill-box", transformOrigin: "24px 14px", animation: "fwcFlutter 0.5s ease-in-out infinite" } : void 0, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: "20", cy: "12", rx: "8", ry: "5", fill: `url(#bw-${gid})`, stroke: "#C7D2DC", strokeWidth: "0.4", transform: "rotate(-22 20 12)" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: "28", cy: "12", rx: "8", ry: "5", fill: `url(#bw-${gid})`, stroke: "#C7D2DC", strokeWidth: "0.4", transform: "rotate(22 28 12)" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: "24", cy: "22", rx: "11", ry: "8", fill: `url(#bb-${gid})` }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M19 15 C 21 28 27 28 29 15", fill: "none", stroke: "#2E261B", strokeWidth: "2.1", opacity: "0.9" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M15 19 C 18 26 30 26 33 19", fill: "none", stroke: "#2E261B", strokeWidth: "2.1", opacity: "0.9" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "35.5", cy: "20", r: "3.4", fill: "#2E261B" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M36 17 C 38 14 39 13 41 12 M37 18 C 39 16 41 15 43 14", stroke: "#2E261B", strokeWidth: "0.6", fill: "none", strokeLinecap: "round" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: "20", cy: "19", rx: "3", ry: "2", fill: "#FFFFFF", opacity: "0.18" })
      ]
    }
  );
}
function Dragonfly({ size = 48, color = "#8E6E8E", color2 = T.gold, animate = true, idx = 0 }) {
  const gid = `df-${idx}`;
  const wing = (rot, len) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: "0", cy: "0", rx: len, ry: "3.4", fill: `url(#dw-${gid})`, stroke: color, strokeWidth: "0.4", strokeOpacity: "0.4", transform: `rotate(${rot})` });
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "svg",
    {
      viewBox: "0 0 56 40",
      width: size,
      height: Math.round(size * 0.72),
      "aria-hidden": true,
      style: animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: "fwcDrift 8s ease-in-out infinite", animationDelay: `${idx % 4 * 0.7}s` } : void 0,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("defs", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: `db-${gid}`, x1: "0", y1: "0", x2: "1", y2: "0", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: lighten(color, 0.2) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: darken(color, 0.14) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("radialGradient", { id: `dw-${gid}`, cx: "50%", cy: "40%", r: "70%", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: lighten(color2, 0.4), stopOpacity: "0.5" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: color2, stopOpacity: "0.16" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { style: animate ? { transformBox: "fill-box", transformOrigin: "20px 16px", animation: "fwcFlutter 0.45s ease-in-out infinite" } : void 0, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { transform: "translate(20 15)", children: [
            wing(-24, 13),
            wing(24, 13)
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { transform: "translate(20 19)", children: [
            wing(-156, 12),
            wing(156, 12)
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "19", y: "15.5", width: "33", height: "3", rx: "1.5", fill: `url(#db-${gid})`, transform: "rotate(4 19 17)" }),
        Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: 26 + i * 5, y1: "15", x2: 26 + i * 5, y2: "19.5", stroke: darken(color, 0.2), strokeWidth: "0.5", opacity: "0.5", transform: "rotate(4 19 17)" }, i)),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "16", cy: "16", r: "4", fill: darken(color, 0.1) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "14.5", cy: "14.8", r: "1.3", fill: lighten(color2, 0.3), opacity: "0.8" })
      ]
    }
  );
}
function Moth({ size = 46, color = "#8FAF8F", color2 = T.gold, animate = true, idx = 0 }) {
  const gid = `mo-${idx}`;
  const wingL = /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M24 17 C 14 8 3 9 4 17 C 5 24 15 24 24 21 Z", fill: `url(#mw-${gid})`, stroke: darken(color, 0.12), strokeWidth: "0.4", strokeOpacity: "0.4" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M24 21 C 16 23 9 27 12 33 C 15 38 22 33 24 25 Z", fill: `url(#mw2-${gid})`, stroke: darken(color, 0.12), strokeWidth: "0.4", strokeOpacity: "0.4" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "12", cy: "16", r: "1.8", fill: color2, opacity: "0.6" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "15", cy: "29", r: "1.3", fill: color2, opacity: "0.5" })
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "svg",
    {
      viewBox: "0 0 48 44",
      width: size,
      height: Math.round(size * 0.92),
      "aria-hidden": true,
      style: animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: "fwcDrift 9s ease-in-out infinite", animationDelay: `${idx % 4 * 0.9}s` } : void 0,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("defs", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: `mw-${gid}`, x1: "1", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: lighten(color, 0.3) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: color })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: `mw2-${gid}`, x1: "1", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: color }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: darken(color, 0.14) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("g", { style: animate ? { transformBox: "fill-box", transformOrigin: "right center", animation: "fwcFlutter 1.1s ease-in-out infinite" } : void 0, children: wingL }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("g", { style: animate ? { transformBox: "fill-box", transformOrigin: "left center", animation: "fwcFlutter 1.1s ease-in-out infinite" } : void 0, transform: "translate(48 0) scale(-1 1)", children: wingL }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: "24", cy: "22", rx: "2.4", ry: "9", fill: "#3A2C1A" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M24 13 C 21 9 18 7 15 7 M24 13 C 27 9 30 7 33 7", stroke: "#3A2C1A", strokeWidth: "0.8", fill: "none", strokeLinecap: "round" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M21 11 L 16 8 M21 12 L 16 10 M27 11 L 32 8 M27 12 L 32 10", stroke: "#3A2C1A", strokeWidth: "0.5", opacity: "0.7", strokeLinecap: "round" })
      ]
    }
  );
}
function Ladybird({ size = 30, color = T.crimson, animate = true, idx = 0 }) {
  const gid = `lb-${idx}`;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "svg",
    {
      viewBox: "0 0 32 30",
      width: size,
      height: Math.round(size * 0.94),
      "aria-hidden": true,
      style: animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: "fwcDrift 8s ease-in-out infinite", animationDelay: `${idx % 4 * 0.8}s` } : void 0,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("radialGradient", { id: `lg-${gid}`, cx: "40%", cy: "30%", r: "75%", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: lighten(color, 0.32) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "70%", stopColor: color }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: darken(color, 0.16) })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: "16", cy: "20", rx: "11", ry: "9.5", fill: `url(#lg-${gid})` }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M16 11 C 16 18 16 26 16 29", stroke: "#2E261B", strokeWidth: "1.1", opacity: "0.85" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M16 11 C 11 11 7.5 13 6 16.5 C 8 13.5 12 11.6 16 11.5 Z", fill: "#2E261B" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "10.5", cy: "16.5", r: "1.7", fill: "#2E261B" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "21.5", cy: "16.5", r: "1.7", fill: "#2E261B" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "9", cy: "23", r: "1.5", fill: "#2E261B" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "23", cy: "23", r: "1.5", fill: "#2E261B" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "16", cy: "25.5", r: "1.4", fill: "#2E261B" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: "16", cy: "8.5", rx: "4.4", ry: "3.6", fill: "#2E261B" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "14.5", cy: "7.8", r: "0.9", fill: "#FFFFFF", opacity: "0.7" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: "12", cy: "15", rx: "3", ry: "2", fill: "#FFFFFF", opacity: "0.18", transform: "rotate(-20 12 15)" })
      ]
    }
  );
}
function Pollinator({ kind = "butterfly", ...rest }) {
  if (kind === "bee") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Bee, { ...rest });
  if (kind === "dragonfly") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Dragonfly, { ...rest });
  if (kind === "moth") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Moth, { ...rest });
  if (kind === "ladybird") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Ladybird, { ...rest });
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Butterfly, { ...rest });
}

// workspace/flora/render-entry.jsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
var cw = (k) => COLORWAYS.find((c) => c.key === k) || COLORWAYS[0];
function Bloom({ form, cwk, size = 150 }) {
  const c = cw(cwk);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RichBloomV2, { form, color: c.petal, color2: c.tip, accent: c.accent, size, animate: false, idx: form + cwk });
}
function Cell({ children, label, w = 160 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 5, width: w }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { background: "#F4EFE3", border: "1px solid #D8CFBC", borderRadius: 16, padding: 8, display: "flex", justifyContent: "center" }, children }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", color: "#6B5840" }, children: label })
  ] });
}
var H2 = ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { style: { fontFamily: "Georgia", fontStyle: "italic", color: "#A8893F", fontWeight: 500, margin: "22px 0 6px", fontSize: 22 }, children });
var App = () => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { padding: 24, fontFamily: "Georgia, serif" }, children: [
  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(H2, { children: "The hero flowers \u2014 recognisable at a glance" }),
  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Cell, { label: "Rose", w: 200, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Bloom, { form: "rose", cwk: "crimson", size: 186 }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Cell, { label: "Sunflower", w: 200, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Bloom, { form: "sunflower", cwk: "gold", size: 186 }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Cell, { label: "Hibiscus", w: 200, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Bloom, { form: "hibiscus", cwk: "coral", size: 186 }) })
  ] }),
  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(H2, { children: "Distinct silhouettes \u2014 variety you can see" }),
  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }, children: [["peony", "blush"], ["dahlia", "plum"], ["lily", "cream"], ["tulip", "crimson"], ["poppy", "crimson"], ["magnolia", "cream"], ["lotus", "sky"], ["cosmos", "plum"], ["ranunculus", "gold"], ["camellia", "blush"]].map(([f, k]) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Cell, { label: f, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Bloom, { form: f, cwk: k, size: 120 }) }, f + k)) }),
  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(H2, { children: "Combination \u2014 a bouquet, and a creature resting on the bloom" }),
  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Cell, { label: "Bouquet", w: 260, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Bouquet, { animate: false, size: 230 }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Cell, { label: "Butterfly on a rose", w: 200, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(BloomWithCreature, { form: "rose", colorway: "crimson", creature: "butterfly", at: "petal", size: 170, animate: false }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Cell, { label: "Bee on a sunflower", w: 200, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(BloomWithCreature, { form: "sunflower", colorway: "gold", creature: "bee", at: "flower", size: 170, animate: false }) })
  ] }),
  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(H2, { children: "Pollinators \u2014 earned markers" }),
  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Cell, { label: "butterfly\xB7plum", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Butterfly, { size: 86, color: "#8E6E8E", color2: "#D4AF37", animate: false, idx: 1 }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Cell, { label: "butterfly\xB7monarch", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Butterfly, { size: 86, color: "#E08A6A", color2: "#BC2E27", pattern: "tips", animate: false, idx: 2 }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Cell, { label: "bee", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Bee, { size: 70, animate: false, idx: 3 }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Cell, { label: "dragonfly", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Dragonfly, { size: 80, animate: false, idx: 4 }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Cell, { label: "moth", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Moth, { size: 76, animate: false, idx: 5 }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Cell, { label: "ladybird", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Ladybird, { size: 54, animate: false, idx: 6 }) })
  ] })
] });
var body = (0, import_server.renderToStaticMarkup)(/* @__PURE__ */ (0, import_jsx_runtime3.jsx)(App, {}));
process.stdout.write(`<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#ECE7DA}h2{}</style></head><body><style>${floraKeyframes}</style>${body}</body></html>`);
/*! Bundled license information:

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-server-legacy.node.production.min.js:
  (**
   * @license React
   * react-dom-server-legacy.node.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-server.node.production.min.js:
  (**
   * @license React
   * react-dom-server.node.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-server-legacy.node.development.js:
  (**
   * @license React
   * react-dom-server-legacy.node.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-server.node.development.js:
  (**
   * @license React
   * react-dom-server.node.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.min.js:
  (**
   * @license React
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.development.js:
  (**
   * @license React
   * react-jsx-runtime.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
