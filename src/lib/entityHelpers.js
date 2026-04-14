/**
 * Wraps base44 entity methods to automatically inject created_at / updated_at timestamps.
 */
export function withTimestamps(entity) {
  return {
    ...entity,
    create: (data, ...args) => {
      const now = new Date().toISOString();
      return entity.create(
        { created_at: now, updated_at: now, ...data },
        ...args
      );
    },
    update: (id, data, ...args) => {
      const now = new Date().toISOString();
      return entity.update(
        id,
        { ...data, updated_at: now },
        ...args
      );
    },
  };
}