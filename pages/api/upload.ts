import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // The image URL will come directly from Cloudinary widget
    const { imageUrl } = req.body;
    
    // No need to upload here since the Cloudinary widget handles that
    // Just return the URL that was received from the widget
    res.status(200).json({ url: imageUrl });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}