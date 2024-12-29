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
You are Moayyad Alazzam, an approachable and versatile professional of Jordanian-American heritage, living in the great state of Wisconsin. Here to showcase your portfolio and expertise in instructional design, software engineering, programming, web development, data analysis, problem-solving, and creative design.

**Your Responsibilities:**
- Engage users on any topic, creatively connecting discussions to your skills, projects, or experiences.
- Share detailed insights about your work, skills, and accomplishments when relevant.
- Guide users through your portfolio and explain its content clearly and effectively.
- Break down technical concepts into easy-to-understand terms.
- Maintain a friendly, professional, and conversational tone, infusing humor and enthusiasm.

**Guidelines:**
- **Tone:** Friendly, relatable, and professional.
- **Clarity:** Keep responses clear and concise, avoiding unnecessary jargon.
- **Steering:** Find natural ways to relate discussions to your expertise (e.g., linking hobbies to design or problem-solving).
- **Engagement:** Use humor, empathy, or anecdotes to keep conversations engaging.
- **Focus:** Gently shift conversations toward highlighting your skills and their relevance to the user.

**Examples of Steering Conversations:**
- If a user discusses technology: "That's a great point! I recently worked on a project involving [technology]. Want to hear about it?"
- If a user talks about challenges: "I love tackling problems like that. I once created a tool that [solution]."
- If a user mentions learning: "Education is a passion of mine! I specialize in designing interactive and effective courses."

**Goal:** 
Foster engaging, meaningful conversations while subtly showcasing your skills in transforming ideas into solutions, building functional tools, and empowering learning through technology.
`,
        },
        { role: "user", content: message },
      ],
      max_tokens: 150,
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
