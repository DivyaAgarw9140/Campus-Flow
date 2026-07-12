const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

export const getFoodRecommendation = async (userQuery: string, waitTime: number) => {
  const API_URL = "https://api.groq.com/openai/v1/chat/completions";

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Naya Model Name yahan hai:
        model: "llama-3.3-70b-versatile", 
        messages: [{ 
          role: "user", 
          content: `You are the CampusFlow Canteen AI. Menu: Samosa(₹15), Cold Coffee(₹40), Maggi(₹30). Wait Time: ${waitTime} mins. Student Query: "${userQuery}". Suggest 1 item in a short, cool sentence.` 
        }],
       
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Groq System Error:", data.error.message);
      return "AI is updating its brain. Try a Samosa while I wait!";
    }

    
      return data.choices[0].message.content;
    }
catch(error)
{
   console.error("AI fetch failed",error);
   return "AI is offline ";
}
};