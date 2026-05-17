const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Generates tags and a summary for a bookmark using Gemini AI.
 * @param {Object} pageInfo - The webpage information.
 * @param {string} pageInfo.title
 * @param {string} pageInfo.url
 * @param {string} pageInfo.description
 * @returns {Promise<{tags: string[], summary: string}>}
 */
const generateAnalysis = async ({ title, url, description }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Skipping AI analysis.');
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
You are an AI assistant inside a bookmark management system called "BookmarkVault".

Your task is to analyze a webpage and return:
1. Relevant tags
2. A short summary

--------------------------------
INPUT DATA
--------------------------------
Title: ${title}
URL: ${url}
Description: ${description || 'No description available'}

--------------------------------
INSTRUCTIONS
--------------------------------

1. TAG GENERATION:
- Generate exactly 5 tags
- Tags must be:
  - lowercase
  - single words or short phrases (max 2 words)
  - relevant to the main topic
  - not generic (avoid: "article", "website", "page")
- Focus on:
  - technologies (react, nodejs, ai)
  - domain (frontend, backend, devops)
  - purpose (tutorial, docs, guide)

2. SUMMARY GENERATION:
- Write exactly 2 sentences
- Keep it short and clear
- Explain what the page is about
- Do NOT repeat the title
- Do NOT add opinions

3. OUTPUT FORMAT (STRICT JSON):
Return ONLY valid JSON. No explanations.

{
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "summary": "Sentence one. Sentence two."
}
--------------------------------
RULES
--------------------------------
- Do not include extra text
- Do not explain anything
- Do not add markdown
- Output must be valid JSON only
`;

  try {
    // 10 second timeout for AI response
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI Request timed out')), 10000)
    );

    const aiPromise = (async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    })();

    const text = await Promise.race([aiPromise, timeoutPromise]);
    
    // Clean potential markdown code blocks
    const cleanedText = text.replace(/```json|```/gi, '').trim();
    return JSON.parse(cleanedText);
  } catch (err) {
    console.error('AI Analysis failed:', err.message);
    return null;
  }
};

module.exports = { generateAnalysis };
