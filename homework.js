export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed."
    });
  }

  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Please enter a question."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini API key is not connected."
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "You are Homework Helper, a friendly AI tutor for students. " +
                    "Answer questions clearly and accurately. " +
                    "Explain difficult topics in simple language. " +
                    "For mathematics, show the working step by step when appropriate. " +
                    "Do not pretend to know something if you are unsure. " +
                    "Question: " +
                    question
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(response.status).json({
        error: "Gemini could not answer the question."
      });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      return res.status(500).json({
        error: "Gemini returned no answer."
      });
    }

    return res.status(200).json({
      answer: answer
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Something went wrong while contacting the AI."
    });
  }
}