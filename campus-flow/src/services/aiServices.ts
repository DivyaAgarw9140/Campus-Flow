const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

export const getFoodRecommendation = async (userQuery: string, waitTime: number) => {
  const query = userQuery.toLowerCase();

  // --- LAYER 3: LOCAL DETERMINISTIC ENGINE (Never Offline) ---
  const getLocalSuggestion = () => {
    if (query.includes('sleepy') || query.includes('tired') || query.includes('caffeine')) 
      return "Since you're feeling tired, a Cold Coffee (₹40) is the perfect fuel. It's ready in minutes!";
    if (query.includes('cheap') || query.includes('budget') || query.includes('money')) 
      return "On a budget? Grab our Samosa (₹15). It's tasty, filling, and pocket-friendly!";
    if (waitTime > 30) 
      return "The canteen is busy right now. I recommend a Samosa - it's our fastest-serving item!";
    return "I recommend a hot plate of Maggi (₹30). It's a student favorite and perfect for right now!";
  };

  // --- LAYER 1: TRY GROQ (High Performance AI) ---
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: `You are a Canteen AI. Wait time: ${waitTime}m. Suggest 1 item (Samosa, Maggi, Coffee) for query: "${userQuery}". 1 short sentence.` }],
        timeout: 4000 // Agar 4 sec mein reply nahi aaya toh skip
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) return data.choices[0].message.content;
    
    throw new Error("Groq empty response");

  } catch (error) {
    console.warn("AI Cloud Offline, switching to Local Deterministic Engine...");
    // --- FINAL FALLBACK (Hamesha kaam karega) ---
    return getLocalSuggestion();
  }
};