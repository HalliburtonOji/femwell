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

export const base44 = new Proxy(_base44, {
  get(target, prop) {
    if (prop === 'entities') return _stampedEntities(target.entities);
    return target[prop];
  },
});