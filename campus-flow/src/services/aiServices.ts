const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

export const getFoodRecommendation = async (userQuery: string, waitTime: number) => {
  const query = userQuery.toLowerCase();

  const getLocalSuggestion = () => {
    if (query.includes('sleepy') || query.includes('tired') || query.includes('caffeine')) 
      return "Since you're feeling tired, a Cold Coffee (₹40) is the perfect fuel. It's ready in minutes!";
    if (query.includes('cheap') || query.includes('budget') || query.includes('money')) 
      return "On a budget? Grab our Samosa (₹15). It's tasty, filling, and pocket-friendly!";
    if (waitTime > 30) 
      return "The canteen is busy right now. I recommend a Samosa - it's our fastest-serving item!";
    return "I recommend a hot plate of Maggi (₹30). It's a student favorite and perfect for right now!";
  };

  // Check if API Key exists
  if (!GROQ_API_KEY) {
    console.error("GROQ API KEY MISSING");
    return getLocalSuggestion();
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY.trim()}`, // Trim spaces
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Stable model
        messages: [
          { 
            role: "system", 
            content: "You are a helpful canteen assistant. Suggest only one food item (Samosa, Maggi, or Coffee) in 1 short sentence." 
          },
          { 
            role: "user", 
            content: `Student says: ${userQuery}. Wait time is ${waitTime} mins.` 
          }
        ],
        max_tokens: 50
      })
    });

    const data = await response.json();

    if (response.status === 200 && data.choices && data.choices[0]) {
      return data.choices[0].message.content;
    }
    
    console.error("Groq Error Response:", data);
    return getLocalSuggestion();

  } catch (error) {
    console.warn("AI Cloud Error, using local engine");
    return getLocalSuggestion();
  }
};