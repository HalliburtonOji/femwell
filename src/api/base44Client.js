import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

//Create a client with authentication required
const _base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

// Proxy that auto-injects created_at / updated_at on every entity create/update
function _stampedEntities(entitiesObj) {
  return new Proxy(entitiesObj, {
    get(target, entityName) {
      const entity = target[entityName];
      if (!entity || typeof entity !== 'object') return entity;
      return new Proxy(entity, {
        get(ent, method) {
          if (method === 'create') {
            return (data, ...args) => {
              const now = new Date().toISOString();
              return ent.create({ created_at: now, updated_at: now, ...data }, ...args);
            };
          }
          if (method === 'update') {
            return (id, data, ...args) => {
              return ent.update(id, { ...data, updated_at: new Date().toISOString() }, ...args);
            };
          }
          return ent[method];
        },
      });
    },
  });
}

// Sprint 2 S2-1 — `base44.auth.me()` dedupe.
//
// Multiple components (Planner, JessDemoPanel, Today, Track, Doctor
// Export, Layout, etc.) each call `base44.auth.me()` on mount, leading
// to ~8 concurrent network calls per Planner load. Wrap once with:
//   • inflight Promise — concurrent callers share the same promise
//   • 30s TTL cache    — re-callers in the same minute get the cached
//                        user without hitting the network at all
// The AuthContext.user is still the canonical source for components
// that can take it from props/context; this wrapper just keeps the
// direct callers cheap until they're migrated.
let _meInflight = null;
let _meCache = { user: null, ts: 0 };
const ME_TTL_MS = 30 * 1000;
function _dedupedMe(realMe) {
  return function dedupedMe(...args) {
    const now = Date.now();
    if (_meCache.user && now - _meCache.ts < ME_TTL_MS) {
      return Promise.resolve(_meCache.user);
    }
    if (_meInflight) return _meInflight;
    _meInflight = Promise.resolve()
      .then(() => realMe.apply(_base44.auth, args))
      .then((u) => { _meCache = { user: u, ts: Date.now() }; return u; })
      .finally(() => { _meInflight = null; });
    return _meInflight;
  };
}
const _authProxy = new Proxy(_base44.auth, {
  get(target, prop) {
    if (prop === 'me') return _dedupedMe(target.me.bind(target));
    if (prop === 'logout') {
      // Invalidate the cache on logout so the next /me hits the network.
      return (...args) => {
        _meCache = { user: null, ts: 0 };
        _meInflight = null;
        return target.logout.apply(target, args);
      };
    }
    const v = target[prop];
    return typeof v === 'function' ? v.bind(target) : v;
  },
});

export const base44 = new Proxy(_base44, {
  get(target, prop) {
    if (prop === 'entities') return _stampedEntities(target.entities);
    if (prop === 'auth') return _authProxy;
    return target[prop];
  },
});