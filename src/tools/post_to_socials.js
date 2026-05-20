import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

const BUFFER_URL = 'https://api.bufferapp.com/1/updates/create.json';

async function postToBuffer(text, profileId, token) {
  const body = new URLSearchParams();
  body.append('text', text);
  body.append('profile_ids[]', profileId);

  const response = await fetch(BUFFER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data = await response.json();
  return { profileId, status: response.status, ok: response.ok, data };
}

async function archive(payload) {
  const outputDir = path.join(process.cwd(), 'output');
  const filepath = path.join(outputDir, 'posts.json');

  let existing = [];
  try {
    const raw = await fs.readFile(filepath, 'utf8');
    existing = JSON.parse(raw);
    if (!Array.isArray(existing)) existing = [existing];
  } catch {
    // File doesn't exist yet — start fresh
  }

  existing.push(payload);
  await fs.writeFile(filepath, JSON.stringify(existing, null, 2), 'utf8');
}

export async function postToSocials({ short_post, long_post, headline, scripture, prayer }) {
  console.log('📲 Posting to social platforms...');

  const timestamp = new Date().toISOString();
  const token = process.env.BUFFER_ACCESS_TOKEN;
  const profileIdsRaw = process.env.BUFFER_PROFILE_IDS || '';
  const profileIds = profileIdsRaw.split(',').map(id => id.trim()).filter(Boolean);

  const archivePayload = {
    timestamp,
    headline,
    scripture,
    short_post,
    long_post,
    prayer,
    buffer_response: {},
  };

  if (!token || !profileIds.length) {
    console.log('📲 BUFFER_ACCESS_TOKEN or BUFFER_PROFILE_IDS not set — skipping Buffer, archiving only');
    await archive(archivePayload);
    return { success: true, buffer_response: {}, timestamp };
  }

  const bufferResults = [];

  try {
    // First profile ID → Twitter (short_post)
    const twitterId = profileIds[0];
    console.log(`📲 Posting short_post to Twitter profile ${twitterId}...`);
    const twitterResult = await postToBuffer(short_post, twitterId, token);
    bufferResults.push(twitterResult);

    if (!twitterResult.ok) {
      console.log(`📲 ⚠️  Twitter post failed (${twitterResult.status})`);
    }

    // Remaining profile IDs → Facebook, Instagram (long_post)
    for (const profileId of profileIds.slice(1)) {
      console.log(`📲 Posting long_post to profile ${profileId}...`);
      const result = await postToBuffer(long_post, profileId, token);
      bufferResults.push(result);

      if (!result.ok) {
        console.log(`📲 ⚠️  Post to ${profileId} failed (${result.status})`);
      }
    }

    archivePayload.buffer_response = bufferResults;
    await archive(archivePayload);

    const allOk = bufferResults.every(r => r.ok);
    console.log(`📲 Buffer posting ${allOk ? 'succeeded' : 'partially failed'} — archived to output/posts.json`);
    return { success: allOk, buffer_response: bufferResults, timestamp };

  } catch (error) {
    console.log(`📲 ⚠️  Buffer error (${error.message}) — archiving to output/posts.json`);
    archivePayload.buffer_response = { error: error.message };
    await archive(archivePayload);
    return { success: false, buffer_response: { error: error.message }, timestamp };
  }
}
