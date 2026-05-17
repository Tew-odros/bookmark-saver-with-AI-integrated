require('dotenv').config({ path: './.env' });
const { generateAnalysis } = require('./src/services/aiService');

const testAI = async () => {
  console.log("Testing AI Service...");
  const result = await generateAnalysis({
    title: "React",
    url: "https://react.dev",
    description: "React is the library for web and native user interfaces."
  });
  console.log("AI Result:");
  console.log(JSON.stringify(result, null, 2));
};

testAI();
