import express from "express";
import path from "path";
import dotenv from "dotenv";

// Load environment variables in development
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing setup with larger limit for base64 image uploads
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // API Endpoint for Scanning Receipts using Gemini API
  app.post("/api/scan-receipt", async (req: any, res: any) => {
    try {
      const { base64Image, mimeType } = req.body;
      if (!base64Image) {
        return res.status(400).json({ error: "No image data provided" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not configured. Please open the Secrets panel in AI Studio UI and provide your Gemini API Key."
        });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      // Strip any data URI scheme prefixes
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

      const prompt = `Parse this receipt. Extract:
1. Total amount (number)
2. Merchant/Store name
3. Recommended budget category from this list: Rent, Utilities, Groceries, Dining Out, Entertainment, Transport, Shopping, Miscellaneous
4. Transaction Date in YYYY-MM-DD format
5. Individual items (name and price) if available.
Return the structured response.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType || "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              amount: { type: "NUMBER" },
              merchant: { type: "STRING" },
              category: { type: "STRING" },
              date: { type: "STRING" },
              items: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    name: { type: "STRING" },
                    price: { type: "NUMBER" }
                  },
                  required: ["name", "price"]
                }
              }
            },
            required: ["amount", "merchant", "category", "date"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini model.");
      }

      const parsedResult = JSON.parse(responseText);
      return res.json(parsedResult);
    } catch (err: any) {
      console.error("OCR Parse Error:", err);
      return res.status(500).json({
        error: err.message || "Failed to process receipt with Gemini API"
      });
    }
  });

  // Serve static files / Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
