import fetch from 'node-fetch';

export async function getScripture({ reference }) {
  try {
    const encoded = encodeURIComponent(reference);
    const response = await fetch(`https://bible-api.com/${encoded}`);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const data = await response.json();
    if (data.error) return `Could not find scripture for "${reference}". Try a specific reference like "John 3:16".`;
    return `${data.reference}\n\n"${data.text.trim()}"\n\n(Translation: ${data.translation_id || 'WEB'})`;
  } catch (error) {
    return `Error fetching scripture for "${reference}": ${error.message}`;
  }
}
