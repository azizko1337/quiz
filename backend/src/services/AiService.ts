class AiService {
  GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  async generateQuiz(
    title: string,
    description: string,
    numberOfQuestions: number,
    additionalInfo: string
  ) {
    try {
      const questions: Array<any> = [];
      for (let i = 0; i < numberOfQuestions; i++) {
        const question = await this.generateQuestion(
          title,
          description,
          additionalInfo
        );
        questions.push(question);
      }

      return questions;
    } catch (error) {
      console.error("Error in generateQuiz AI:", error);
      return [];
    }
  }

  async explainQuestion() {}

  private async generateQuestion(title, description, additionalInfo) {
    const prompt = `
              Wygeneruj pytanie z odpowiedziami do quizu na temat ${title} w podanym niżej formacie JSON. Możesz znaleźć na internecie jakieś linki do obrazka dla pytania. Zwróć tylko gotowy JSON.
              Cały quiz ma opis: ${description}. Dodatkowe informacje od użytkownika: ${additionalInfo}.
                {
                    "question": "Nowe pytanie?",
                    "image": null,
                    "answers": [
                      {
                        "answer": "Odpowiedź A",
                        "image": null,
                        "isCorrect": true
                      },
                      {
                        "answer": "Odpowiedź B",
                        "image": null,
                        "isCorrect": false
                      }
                    ]
                  }
              `;
    let promptAnswer = await this.generateContent(prompt);
    if (promptAnswer.startsWith("```json")) {
      promptAnswer = promptAnswer
        .replace("```json", "")
        .replace("```", "")
        .trim();
    }
    return JSON.parse(promptAnswer);
  }

  private async generateContent(prompt: string): Promise<string> {
    const body = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    try {
      const res = await fetch(this.GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      let promptAnswer = data.candidates[0].content.parts
        .map((part) => part.text)
        .join(" ");
      return promptAnswer;
    } catch (error) {
      console.error("Error in prompting AI:", error);
      return "";
    }
  }
}

export default AiService;
