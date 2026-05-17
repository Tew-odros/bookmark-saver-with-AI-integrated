const prisma = require('../config/db');
const { fetchMetadata } = require('../services/metadataService');
const { generateAnalysis } = require('../services/aiService');

const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getAllBookmarks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { q, tag } = req.query;

    const where = { userId };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { url: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (tag) {
      where.tags = { some: { name: tag } };
    }

    const bookmarks = await prisma.bookmark.findMany({
      where,
      include: { tags: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: bookmarks });
  } catch (err) {
    next(err);
  }
};

const createBookmark = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let { title, url, tags = [], description = "" } = req.body;

    if (!url || typeof url !== 'string') {
      return next(createError('URL is required.', 400));
    }

    const trimmedUrl = url.trim();
    if (!isValidUrl(trimmedUrl)) {
      return next(createError('Invalid URL. Please provide a valid http:// or https:// URL.', 400));
    }

    // --- EARLY CHECK: Prevent duplicate processing ---
    const existing = await prisma.bookmark.findFirst({
      where: { userId, url: trimmedUrl }
    });

    if (existing) {
      return next(createError('You have already bookmarked this URL.', 409));
    }

    // --- 1. Fetch metadata if title or description is missing ---
    if (!title || title.trim().length === 0 || !description) {
      try {
        const metadata = await fetchMetadata(trimmedUrl);
        if (!title || title.trim().length === 0) {
          title = metadata.title || trimmedUrl;
        }
        if (!description) {
          description = metadata.description || "";
        }
      } catch (err) {
        console.warn('Metadata fetch failed, falling back to defaults:', err.message);
        title = title || trimmedUrl;
      }
    }

    let summary = "";
    // --- 2. AI Analysis if tags are empty ---
    if (tags.length === 0) {
      try {
        const aiResult = await generateAnalysis({ title, url: trimmedUrl, description });
        if (aiResult) {
          tags = aiResult.tags || [];
          summary = aiResult.summary || "";
        }
      } catch (err) {
        console.warn('AI analysis failed, proceeding without tags/summary:', err.message);
      }
    }

    const tagConnections = tags.map((t) => {
      const sanitizedTag = t.trim().toLowerCase().substring(0, 50);
      return {
        where: { name: sanitizedTag },
        create: { name: sanitizedTag },
      };
    });

    const safeTitle = (title || trimmedUrl).trim().substring(0, 255);

    const bookmark = await prisma.bookmark.create({
      data: {
        title: safeTitle,
        url: trimmedUrl,
        description: (description || "").trim(),
        summary: (summary || "").trim(),
        userId,
        tags: { connectOrCreate: tagConnections },
      },
      include: { tags: true },
    });

    res.status(201).json({ success: true, data: bookmark });
  } catch (err) {
    if (err.code === 'P2002') {
      return next(createError('You have already bookmarked this URL.', 409));
    }
    next(err);
  }
};

const updateBookmark = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, url, tags } = req.body;

    if (isNaN(parseInt(id, 10))) return next(createError('Invalid bookmark ID.', 400));

    const updateData = {};
    if (title && title.trim().length > 0) updateData.title = title.trim();
    if (url) {
      const trimmedUrl = url.trim();
      if (!isValidUrl(trimmedUrl)) return next(createError('Invalid URL.', 400));
      updateData.url = trimmedUrl;
    }

    if (Array.isArray(tags)) {
      updateData.tags = {
        set: [],
        connectOrCreate: tags.map((t) => ({
          where: { name: t.trim() },
          create: { name: t.trim() },
        })),
      };
    }

    const bookmark = await prisma.bookmark.update({
      where: { id: parseInt(id, 10), userId },
      data: updateData,
      include: { tags: true },
    });

    res.status(200).json({ success: true, data: bookmark });
  } catch (err) {
    if (err.code === 'P2025') {
      return next(createError('Bookmark not found.', 404));
    }
    if (err.code === 'P2002') {
      return next(createError('You have already bookmarked this URL.', 409));
    }
    next(err);
  }
};

const deleteBookmark = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isNaN(parseInt(id, 10))) return next(createError('Invalid bookmark ID.', 400));

    // verify ownership first just in case? Prisma update/delete handles where with combined unique usually, but for delete we can delete many to simulate compound
    // Actually where: { id } is standard, but must belong to user. A simple approach:
    const target = await prisma.bookmark.findFirst({ where: { id: parseInt(id, 10), userId }});
    if (!target) return next(createError('Bookmark not found.', 404));

    await prisma.bookmark.delete({ where: { id: parseInt(id, 10) } });
    
    res.status(200).json({ success: true, data: target });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBookmarks, createBookmark, updateBookmark, deleteBookmark };
