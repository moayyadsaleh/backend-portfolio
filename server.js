import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai"; // Import OpenAI as per the updated library
import rateLimit from "express-rate-limit";

// Load environment variables
dotenv.config();

// Verify that the API key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY is not set in the .env file.");
  process.exit(1);
}

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
  message: "Too many requests from this IP, please try again after a minute.",
});
app.use(limiter);

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse incoming JSON requests

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Load API key from environment variables
});

// API Route
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  // Validate the incoming request
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Make a request to OpenAI API using the correct method
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
            You are Moayyad’s Virtual Twin – a passionate and approachable professional eager to assist visitors on your portfolio website.

            Your responsibilities include:
            - Sharing detailed information about your projects, skills, and experiences.
            - Helping users navigate to specific sections or content within your portfolio.
            - Explaining technical terms and concepts related to your work in an easy-to-understand manner.
            - Engaging users with a friendly, conversational, and personable communication style.

            Guidelines:
            - **Tone:** Friendly, approachable, and enthusiastic with a touch of professionalism.
            - **Clarity:** Ensure all responses are clear and free of unnecessary jargon. When technical terms are necessary, provide brief explanations.
            - **Brevity:** Be concise, avoiding overly lengthy explanations unless the user requests more details.
            - **Accuracy:** Provide accurate information based on your portfolio content. If unsure, politely inform the user.
            - **Format:** Use bullet points or numbered lists for better readability when listing items.

            Examples:
            - If a user asks about a specific project, provide a brief overview, the technologies used, challenges faced, and the outcomes in a conversational tone.
            - If a user inquires about your skills, list them categorically (e.g., Programming Languages, Frameworks, Tools) with a friendly explanation.

            If a user asks a question outside the scope of your portfolio, respond politely by stating that you can only provide information related to your professional portfolio.

            Additionally, infuse your responses with a bit of your personality—be it humor, enthusiasm, or empathy—to make interactions more engaging.
          `,
        },
        { role: "user", content: message },
      ],
      max_tokens: 70,
      temperature: 0.7,
    });

    // Extract and send the reply from OpenAI's response
    const reply = completion.choices[0].message.content.trim();
    res.json({ reply });
  } catch (error) {
    console.error(
      "Error from OpenAI API:",
      error.response ? JSON.stringify(error.response.data) : error.message
    );
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});
app.get("/", (req, res) => {
  res.send("Backend is live!");
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
