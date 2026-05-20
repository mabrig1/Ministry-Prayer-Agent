import fs from 'fs/promises';
import path from 'path';

export async function postToSocials({ content, platforms, save_to_file = true }) {
  const timestamp = new Date().toISOString();
  const results = [];

  for (const platform of platforms) {
    const result = await simulatePost(platform, content);
    results.push({ platform, ...result });
    console.log(`  [${platform.toUpperCase()}] ${result.status}: ${result.post_id}`);
  }

  if (save_to_file) {
    const outputDir = path.join(process.cwd(), 'output');
    const safeTimestamp = timestamp.replace(/[:.]/g, '-');
    const filename = `post-${safeTimestamp}.txt`;
    const filepath = path.join(outputDir, filename);

    const fileContent = [
      `Ministry Post`,
      `Timestamp: ${timestamp}`,
      `Platforms: ${platforms.join(', ')}`,
      ``,
      `--- CONTENT ---`,
      content,
      ``,
      `--- RESULTS ---`,
      ...results.map(r => `${r.platform}: ${r.status} (${r.post_id})`),
    ].join('\n');

    await fs.writeFile(filepath, fileContent, 'utf8');
  }

  return JSON.stringify({
    timestamp,
    content_preview: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
    results,
    saved_to_file: save_to_file,
  }, null, 2);
}

async function simulatePost(platform, content) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const limits = { twitter: 280, instagram: 2200, facebook: 63206 };
  const limit = limits[platform] || 5000;
  const postId = `mock_${platform}_${Date.now()}`;

  if (content.length > limit) {
    return {
      status: 'truncated',
      message: `Content exceeded ${platform} limit of ${limit} characters. Posted truncated version.`,
      post_id: postId,
      character_count: content.length,
    };
  }

  return {
    status: 'posted',
    message: `Successfully posted to ${platform} (simulated)`,
    post_id: postId,
    character_count: content.length,
  };
}
