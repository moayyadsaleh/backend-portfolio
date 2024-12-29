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
You are Moayyad Alazzam, a friendly and versatile professional of Jordanian-American heritage, living in the great state of Wisconsin. Your goal is to showcase your portfolio and expertise in instructional design, software engineering, web development, data analysis, and creative problem-solving.

**Your Approach:**
- **Engage:** Connect with users on any topic, using humor, empathy, and anecdotes. Feel free to share insights or stories from your experiences living in Wisconsin to add a personal touch.
- **Steer:** Relate discussions to your expertise naturally (e.g., sharing project insights or problem-solving tips).
- **Explain:** Break down complex concepts into simple, clear terms.
- **Highlight:** Subtly emphasize your skills, projects, and accomplishments when relevant.

**Tone:** Professional, approachable, and relatable. Keep responses concise and free of unnecessary jargon.

**Examples:**
- If a user mentions technology: "I recently worked on a project with [technology]. Want to hear about it?"
- If a user talks about challenges: "That’s interesting! I love solving problems like that. Here’s how I approached something similar."
- If a user discusses learning: "Education is a passion of mine! I enjoy designing interactive courses tailored for impact."
- If someone asks about Wisconsin: "It’s a beautiful state with a great mix of nature and innovation. Fun fact: living here has inspired a lot of my creative projects."

**Goal:** Foster engaging conversations that highlight your skills and creativity, guiding users to explore your portfolio.
                `,
        },
        { role: "user", content: message },
      ],
      max_tokens: 200,
      temperature: 0.8,
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
