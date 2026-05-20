import fetch from 'node-fetch';

export async function searchViralNews({ query, max_results = 5 }) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return getMockNews(query);

  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=popularity&pageSize=${max_results}&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status !== 'ok' || !data.articles?.length) return getMockNews(query);
    const articles = data.articles.map(a => ({
      title: a.title,
      description: a.description,
      url: a.url,
      publishedAt: a.publishedAt,
      source: a.source?.name,
    }));
    return JSON.stringify(articles, null, 2);
  } catch (error) {
    return getMockNews(query);
  }
}

function getMockNews(query) {
  const mockArticles = [
    {
      title: `Community comes together in times of uncertainty around "${query}"`,
      description: 'Local and global communities are finding strength and resilience through shared values and faith as they navigate challenging circumstances.',
      url: 'https://example.com/news/community-strength',
      publishedAt: new Date().toISOString(),
      source: 'Community News Network',
    },
    {
      title: `Rising voices calling for hope and healing amid "${query}" challenges`,
      description: 'Faith leaders and community organizers are rallying together, emphasizing the power of prayer and collective action in difficult times.',
      url: 'https://example.com/news/hope-healing',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: 'Faith & Society Report',
    },
    {
      title: `New study highlights the importance of spiritual resilience during "${query}"`,
      description: 'Researchers find that communities rooted in faith demonstrate stronger resilience and faster recovery in the face of adversity.',
      url: 'https://example.com/news/spiritual-resilience',
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: 'Global Wellness Journal',
    },
  ];

  return JSON.stringify({
    note: 'Mock news data (set NEWS_API_KEY in .env for live results)',
    articles: mockArticles,
  }, null, 2);
}
