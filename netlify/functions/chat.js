const POLLINATIONS_URL = 'https://text.pollinations.ai/';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = event.body || '{}';
    const upstreamResponse = await fetch(POLLINATIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    const text = await upstreamResponse.text();

    return {
      statusCode: upstreamResponse.status,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
      body: text,
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Upstream request failed',
        detail: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
