import fetch from 'node-fetch';

const FALLBACK = {
  title: "hope and resilience in today's world",
  description: 'Communities around the world are finding strength and hope amid challenges.',
  url: null,
  publishedAt: new Date().toISOString(),
};

export async function searchViralNews() {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    console.log('📰 NEWS_API_KEY not set — using fallback topic');
    return FALLBACK;
  }

  try {
    const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`NewsAPI error: ${response.status}`);

    const data = await response.json();

    if (data.status !== 'ok' || !data.articles?.length) {
      console.log('📰 No articles returned — using fallback topic');
      return FALLBACK;
    }

    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const recent = data.articles.filter(
      a => a.publishedAt && new Date(a.publishedAt).getTime() >= twoHoursAgo
    );

    const source = recent.length ? recent : data.articles;
    const article = source[0];

    console.log(`📰 Top headline: "${article.title}"`);
    return {
      title: article.title,
      description: article.description || '',
      url: article.url || null,
      publishedAt: article.publishedAt,
    };
  } catch (error) {
    console.log(`📰 News fetch failed (${error.message}) — using fallback topic`);
    return FALLBACK;
  }
}
