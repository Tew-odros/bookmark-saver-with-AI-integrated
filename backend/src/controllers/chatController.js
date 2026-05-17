const prisma = require('../config/db');

const chatWithML = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text query is required' });
    }

    // 1. Send query to Python ML Service
    // The service is running internally on Docker network at ml-service:5000
    const mlResponse = await fetch('http://ml-service:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!mlResponse.ok) {
      throw new Error(`ML Service responded with status ${mlResponse.status}`);
    }

    const mlData = await mlResponse.json();
    const intent = mlData.intent; // e.g., 'frontend', 'backend', 'ai'

    if (!intent) {
       return res.status(500).json({ success: false, error: 'Failed to classify intent' });
    }

    // 2. Fetch bookmarks based on intent
    // We will search for bookmarks that have the intent word in their title, description, or tags
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
        OR: [
          { tags: { some: { name: { contains: intent, mode: 'insensitive' } } } },
          { title: { contains: intent, mode: 'insensitive' } },
          { description: { contains: intent, mode: 'insensitive' } }
        ]
      },
      include: { tags: true },
      take: 5 // limit to top 5 matches
    });

    res.status(200).json({
      success: true,
      data: {
        intent,
        message: `I detected you are asking about '${intent}'. Here are your relevant bookmarks:`,
        bookmarks
      }
    });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ success: false, error: 'Failed to process chat query' });
  }
};

module.exports = { chatWithML };
