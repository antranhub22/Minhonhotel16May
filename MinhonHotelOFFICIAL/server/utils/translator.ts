import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function translateToVietnamese(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional translator. Translate the following text to Vietnamese. Keep the translation natural and fluent."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3
    });

    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text');
  }
} 