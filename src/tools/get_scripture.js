import fetch from 'node-fetch';

const FALLBACK = {
  reference: 'John 3:16',
  text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
};

export async function getScripture({ topic }) {
  try {
    const response = await fetch('https://bible-api.com/?random=verse');

    if (!response.ok) throw new Error(`bible-api error: ${response.status}`);

    const data = await response.json();

    if (!data.reference || !data.text) throw new Error('Invalid response from bible-api');

    console.log(`🕊️  Scripture: ${data.reference}`);
    return {
      reference: data.reference,
      text: data.text.trim(),
    };
  } catch (error) {
    console.log(`🕊️  Bible API failed (${error.message}) — using fallback verse`);
    return FALLBACK;
  }
}
