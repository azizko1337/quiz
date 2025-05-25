import { GoogleGenAI, Type } from "@google/genai";

class AiService {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  async generateQuiz(
    title: string,
    description: string,
    numberOfQuestions: number,
    additionalInfo: string
  ) {
    return await this.generateQuestions(
      title,
      description,
      numberOfQuestions,
      additionalInfo
    );
  }

  async explainQuestion() {}

  private async generateQuestions(
    title,
    description,
    numberOfQuestions,
    additionalInfo
  ) {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Wygeneruj pytania z odpowiedziami do quizu na temat ${title} w podanym niżej formacie JSON. Możesz znaleźć na internecie jakieś linki do obrazka dla pytania. Zwróć tylko gotowy JSON. Cały quiz ma opis: ${description}. Dodatkowe informacje od użytkownika: ${additionalInfo}.`,
      config: {
        temperature: 1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          minItems: numberOfQuestions,
          maxItems: numberOfQuestions,
          items: {
            type: Type.OBJECT,
            required: ["question", "answers"],
            properties: {
              question: {
                type: Type.STRING,
              },
              image: {
                type: Type.STRING,
                nullable: true,
                description:
                  "Bezpośredni link do obrazka pytania, może być null. Obrazek musisz znaleźć w internecie.",
              },
              answers: {
                type: Type.ARRAY,
                maxItems: 5,
                minItems: 2,
                items: {
                  type: Type.OBJECT,
                  required: ["answer", "isCorrect"],
                  properties: {
                    answer: {
                      type: Type.STRING,
                    },
                    image: {
                      type: Type.STRING,
                      nullable: true,
                      description:
                        "Bezpośredni link do obrazka odpowiedzi, może być null. Obrazek musisz znaleźć w internecie.",
                    },
                    isCorrect: {
                      type: Type.BOOLEAN,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return JSON.parse(response.text);
  }
}

export default AiService;
