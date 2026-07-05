import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';
const root = path.resolve(fileURLToPath(import.meta.url), '../../..');
await build({
  entryPoints: [path.join(root,'workspace/flora/render-entry.jsx')],
  bundle: true,
  outfile: path.join(root,'workspace/flora/render-bundle.cjs'),
  platform: 'node',
  format: 'cjs',
  jsx: 'automatic',
  loader: { '.jsx': 'jsx', '.js': 'jsx' },
  alias: { '@': path.join(root,'src') },
  logLevel: 'error',
});
console.error('bundled OK');
