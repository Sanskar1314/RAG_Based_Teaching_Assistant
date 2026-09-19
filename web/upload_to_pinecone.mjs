/**
 * upload_to_pinecone.mjs
 * One-time script to upload all embeddings from embeddings.json to Pinecone.
 *
 * Usage:
 *   export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
 *   cd web
 *   node upload_to_pinecone.mjs
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || 'pcsk_kxLfH_Sd9Zp7Mfwtr1yJA2Wy9Yas7MF3HuPrjgef5nwD5abBXrEYp594Sn9M8PvnJxiKS';
const PINECONE_INDEX  = process.env.PINECONE_INDEX  || 'sigmalearn';
const BATCH_SIZE = 100;

async function main() {
  console.log('📦 Loading embeddings.json...');
  const dataPath = join(__dirname, 'data', 'embeddings.json');
  const chunks = JSON.parse(readFileSync(dataPath, 'utf-8'));
  console.log(`✅ Loaded ${chunks.length} chunks`);

  const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  const index = pc.index(PINECONE_INDEX);

  // Upsert in batches of BATCH_SIZE
  let uploaded = 0;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    const vectors = batch
      .filter((c) => c.embedding && c.embedding.length > 0)
      .map((c, j) => ({
        id: `chunk-${i + j}`,
        values: c.embedding,
        metadata: {
          title: c.title || '',
          number: c.number ?? i + j,
          start: c.start ?? 0,
          end: c.end ?? 0,
          text: c.text?.slice(0, 1000) || '', // Pinecone metadata limit
        },
      }));

    if (vectors.length === 0) continue;

    await index.upsert({ records: vectors });
    uploaded += vectors.length;
    console.log(`⬆️  Uploaded ${uploaded} / ${chunks.length} chunks...`);
  }

  console.log(`\n🎉 Done! ${uploaded} chunks uploaded to Pinecone index "${PINECONE_INDEX}"`);
}

main().catch((err) => {
  console.error('❌ Upload failed:', err);
  process.exit(1);
});
