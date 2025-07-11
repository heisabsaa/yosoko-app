const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const { IMGBB_API_KEY } = process.env;
  if (!IMGBB_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key is not configured on the server.' })
    };
  }

  try {
    const { image } = JSON.parse(event.body);
    const imageBody = image.split(',')[1]; // Remove the "data:image/..." part

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `image=${encodeURIComponent(imageBody)}`,
    });

    const resultData = await response.json();

    if (!response.ok || !resultData.success) {
      // Send back a specific error from ImgBB if available
      return {
        statusCode: 500,
        body: JSON.stringify({ error: resultData.error?.message || 'Image upload to ImgBB failed.' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrl: resultData.data.url }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal error occurred.' })
    };
  }
};