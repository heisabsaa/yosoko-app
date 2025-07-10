const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Get the secret API key from Netlify's environment variables
  const { IMGBB_API_KEY } = process.env;

  // The image data is sent as a Base64 string from our website
  const { image } = JSON.parse(event.body);

  // We need to remove the "data:image/..." part from the string
  const imageBody = image.split(',')[1];

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `image=${encodeURIComponent(imageBody)}`,
    });

    if (!response.ok) {
      return { statusCode: response.status, body: 'Image upload to ImgBB failed.' };
    }

    const data = await response.json();

    // Send the final image URL back to our website
    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrl: data.data.url }),
    };
  } catch (error) {
    return { statusCode: 500, body: 'An error occurred.' };
  }
};