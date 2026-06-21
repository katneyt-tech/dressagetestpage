const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoBase64, mimeType } = req.body;

    if (!videoBase64) {
      return res.status(400).json({ error: 'Geen video ontvangen' });
    }

    // Initialiseer Google Gemini met jouw AQ. sleutel
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // GEWIJZIGD: We gebruiken nu het up-to-date gemini-2.0-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const videoPart = {
      inlineData: {
        data: videoBase64,
        mimeType: mimeType || "video/mp4"
      },
    };

    const prompt = `
      Analyseer deze dressuurvideo nauwkeurig op basis van de klassieke trainingsleer en de visie van Rien van der Schaft.
      Let specifiek op:
      1. De oprichting en de hals (Loopt het paard niet te kort/geforceerd in de hals? Is de hals het gevolg van de achterhand?).
      2. De balans en correct ruggebruik (Is er sprake van handmatige dwang van voren, of kijkt de AI verder dan een starre loodlijn?).
      3. Loopt het paard echt door het lijf en is de cirkel van energie rond?

      Geef je analyse terug in het Nederlands. Wees constructief en eerlijk. 
      Eindig je analyse met een 'Algemene Biomechanische Score' op een schaal van 1 tot 10 (gebruik hiervoor een realistisch cijfer op basis van de biomechanica).
    `;

    const result = await model.generateContent([prompt, videoPart]);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ analysis: text });

  } catch (error) {
    console.error("Fout tijdens AI analyse:", error);
    return res.status(500).json({ error: "Er ging iets mis tijdens de AI-analyse: " + error.message });
  }
}
