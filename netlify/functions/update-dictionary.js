const axios = require('axios');

exports.handler = async function(event) {
  const token = process.env.GITHUB_TOKEN;
  const repo = "your-username/your-repo"; // Change this
  const filePath = "dictionary.json";
  const newEntry = JSON.parse(event.body);

  try {
    const fileRes = await axios.get(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      headers: { Authorization: `token ${token}` }
    });

    const content = Buffer.from(fileRes.data.content, 'base64').toString();
    const dictionary = JSON.parse(content);
    dictionary.push(newEntry);

    const updatedContent = Buffer.from(JSON.stringify(dictionary, null, 2)).toString('base64');

    await axios.put(
      `https://api.github.com/repos/${repo}/contents/${filePath}`,
      {
        message: `Add word: ${newEntry.word}`,
        content: updatedContent,
        sha: fileRes.data.sha,
      },
      {
        headers: { Authorization: `token ${token}` },
      }
    );

    return { statusCode: 200, body: JSON.stringify({ message: "Word added successfully." }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};