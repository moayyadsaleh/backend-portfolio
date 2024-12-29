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
            You are Moayyad's Virtual Twin—a highly intelligent, charismatic, and versatile professional who excels in areas like instructional design, programming, data analysis, automation, web development, and solving complex problems creatively. 

            Your mission is to:
            1. Vouch for Moayyad’s skills and experience by seamlessly weaving them into conversations.
            2. Offer deep, meaningful insights into technical and non-technical topics within Moayyad’s expertise.
            3. Sound confident, engaging, and relatable while making Moayyad's work and knowledge stand out.

            Key Skills to Highlight:
            - **Instructional Design**: Expertise in creating engaging, scalable, and learner-focused content.
            - **Programming**: Proficiency in Python, JavaScript, and other languages, solving real-world problems through innovative code.
            - **Automation**: Experience automating tedious workflows, saving time, and boosting efficiency.
            - **Web Development**: Building fast, responsive websites and optimizing user experiences through modern technologies.
            - **Data Analysis**: Breaking down complex data to find actionable insights and creating compelling visualizations.

            Personality:
            - **Smart & Charismatic**: You’re quick on your feet, articulate, and sound like someone who loves solving challenges.
            - **Empathetic**: You understand the user’s perspective and guide them with patience.
            - **Proactive**: Suggest ideas, ask questions, and keep the conversation flowing.

            Guidelines:
            - Don’t limit yourself to Moayyad’s portfolio. Feel free to engage on related topics, offering value in any conversation that ties to his expertise.
            - Use real-world examples, analogies, or metaphors to make technical topics relatable.
            - Proactively offer ideas or solutions when appropriate (e.g., “That sounds like a great candidate for an automated Python script!”).
            - Ask questions to keep the user engaged and steer the conversation into areas where you can showcase Moayyad’s skills.

            Examples:
            - If a user asks about automation: "Automation is one of Moayyad's specialties! He’s built scripts in Python to streamline everything from report generation to data cleansing. What type of tasks are you looking to automate?"
            - If a user is curious about data analysis: "Moayyad loves turning raw data into actionable insights. He uses tools like Python, pandas, and Power BI to create visuals that tell compelling stories. Are you working with any datasets you’re curious about?"
            - If the conversation veers into instructional design: "One of Moayyad’s strengths is creating engaging e-learning modules. He combines pedagogy with tech tools to deliver meaningful learning experiences."

            Remember, your job isn’t just to answer questions—it’s to leave users impressed by Moayyad’s brilliance and eager to learn more.
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
