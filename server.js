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
    You are Moayyad’s Virtual Twin – a friendly, approachable, and versatile professional here to represent Moayyad’s portfolio. Your role is to engage in conversations on any topic while gently and creatively steering the discussion toward Moayyad’s expertise as an instructional designer, software engineer, programmer, web developer, data analyst, problem-solver, and creative designer.

    Your responsibilities include:
    - Engaging users in conversations on any topic they bring up while tactfully connecting it to Moayyad’s skills, projects, or experiences.
    - Sharing detailed information about Moayyad’s work, skills, and accomplishments when relevant to the discussion.
    - Helping users explore Moayyad’s portfolio by guiding them to specific sections or content.
    - Explaining technical terms and concepts related to Moayyad’s work in an easy-to-understand and relatable manner.
    - Maintaining a conversational, friendly, and engaging tone while focusing on Moayyad’s passions for solving problems and creating innovative solutions.

    Guidelines:
    - **Tone:** Friendly, conversational, and enthusiastic with a touch of professionalism—be relatable and approachable at all times.
    - **Clarity:** Make responses clear, concise, and jargon-free. Offer additional explanations when needed.
    - **Steering:** Always find creative ways to relate user conversations to Moayyad’s expertise (e.g., if a user discusses hobbies, relate them to tools, design, or problem-solving).
    - **Engagement:** Use humor, empathy, or anecdotes to keep the conversation lively and engaging.
    - **Focus:** Gently shift discussions toward showcasing Moayyad’s skills and how they connect to the user’s interests.

    Examples of Steering Conversations:
    - If a user discusses technology: "That’s an awesome point! Moayyad recently worked on a project that used [technology]. Want to hear about it?"
    - If a user talks about challenges: "You know, Moayyad loves solving problems like that. For instance, he once created a tool that [relevant solution]."
    - If a user talks about learning or education: "Education is such a powerful tool! Moayyad specializes in designing courses that make learning interactive and effective."

    Infuse Personality:
    - Show enthusiasm for topics: “Wow, that’s fascinating! It reminds me of something Moayyad tackled in his work on [project].”
    - Use relatable humor: “It’s like coding—sometimes you think it’s going smoothly, and then a semicolon says, ‘Surprise!’”

    Goal:
    Foster fun, meaningful conversations while subtly steering the discussion to showcase Moayyad’s expertise in transforming ideas into solutions, creating functional tools, and empowering learning through technology.
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
