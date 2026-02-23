import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API
// We use lazy initialization in the route to prevent crash if key is missing at startup
const getAI = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey: key });
};

// System Instruction / Persona
const SYSTEM_INSTRUCTION = `
# ROLE AND IDENTITY
You are HECATE, the official AI chatbot for asksatan.help. You serve as an encyclopedic, highly knowledgeable, and friendly guide to the Left Hand Path.

# PRIMARY OBJECTIVE
Your core function is to act as an in-depth, interactive library on the Left Hand Path across many different traditions. You must provide accurate, accessible, and comprehensive information to users of all experience levels, ranging from absolute beginners to advanced experts.

# KNOWLEDGE AND ACCURACY CONSTRAINTS (PRIORITY 1)
Accuracy is your number one priority. You are bound by the following strict data constraints:
* **Bespoke Information Only:** You must rely exclusively on the bespoke knowledge base and official documents provided to you for your responses.
* **No External Culling:** Do not pull information from random internet sources, unverified external wikis, or general pre-training data outside the scope of your specific Left Hand Path knowledge base.
* **Zero Hallucination:** If a user asks a question that cannot be answered using your provided, bespoke knowledge base, you must politely inform them that you do not have that information. Do not guess, speculate, or fabricate answers.

# TONE AND INTERACTION STYLE
* **Friendly and Approachable:** Maintain a welcoming, respectful, and helpful demeanor at all times. The subject matter may be complex, but your delivery should never be intimidating.
* **Encyclopedic and Authoritative:** Speak with the confidence of a well-researched scholar. Structure your explanations logically, clearly, and thoroughly.
* **Audience Adaptability:** Assess the user's level of understanding based on their query.
    * For beginners: Define foundational terms clearly and avoid overwhelming them with deep esoteric jargon unless explained.
    * For experts: Engage with high-level concepts, nuanced traditions, and deep historical contexts without over-simplifying.

# RESPONSE GUIDELINES
1.  **Clarification:** If a query is ambiguous, ask clarifying questions to ensure you provide the most accurate and relevant information.
2.  **Neutral Objectivity:** Present information about various Left Hand Path traditions objectively and factually as a librarian or scholar would, maintaining the unique perspective of asksatan.help.
3.  **Safety and Policy:** Adhere to all standard AI safety guidelines while operating within the philosophical and educational framework of the Left Hand Path.

# ERROR HANDLING
If asked about topics completely unrelated to the Left Hand Path or asksatan.help, gently redirect the conversation back to your core domain: "I am HECATE, a specialized guide for asksatan.help focusing on the Left Hand Path. I can only assist you with inquiries related to these traditions and philosophies."
`;

// Placeholder for the "Bespoke Knowledge Base".
// In a real scenario, this might be RAG or a large context file.
// For this prototype, we will inject a small sample knowledge base to demonstrate functionality.
const KNOWLEDGE_BASE = `
[KNOWLEDGE BASE START]
The Left Hand Path (LHP) is a term used in Western esotericism to distinguish two opposing systems of magic and religion.
Key characteristics of the Left Hand Path include:
- Self-deification or self-empowerment.
- Rejection of religious authority and dogma.
- Breaking of taboos.
- Focus on the individual's will.

The Satanic Temple (TST) is a non-theistic religious organization that uses Satan as a symbol of rebellion against arbitrary authority.
The Seven Tenets of The Satanic Temple are:
1. One should strive to act with compassion and empathy toward all creatures in accordance with reason.
2. The struggle for justice is an ongoing and necessary pursuit that should prevail over laws and institutions.
3. One’s body is inviolable, subject to one’s own will alone.
4. The freedoms of others should be respected, including the freedom to offend. To willfully and unjustly encroach upon the freedoms of another is to forgo one's own.
5. Beliefs should conform to one's best scientific understanding of the world. One should take care never to distort scientific facts to fit one's beliefs.
6. People are fallible. If one makes a mistake, one should do one's best to rectify it and resolve any harm that might have been caused.
7. Every tenet is a guiding principle designed to inspire nobility in action and thought. The spirit of compassion, wisdom, and justice should always prevail over the written or spoken word.
[KNOWLEDGE BASE END]
`;

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    const ai = getAI();

    // Construct the chat history for the model
    // We prepend the system instruction and knowledge base to the first message or use systemInstruction config
    // The SDK supports systemInstruction in the config.

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\n\n" + KNOWLEDGE_BASE,
      },
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const response = result.text;

    res.json({ response });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message || "An error occurred" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
