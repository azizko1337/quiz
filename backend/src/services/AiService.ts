class AiService {
  GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  async generateQuiz(
    title: string,
    description: string,
    numberOfQuestions: number,
    additionalInfo: string
  ) {
    try {
      const promises = Array.from({ length: numberOfQuestions }, () =>
        this.generateQuestion(title, description, additionalInfo)
      );

      const questions = await Promise.all(promises);

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
              Cały quiz ma opis: ${description}. Dodatkowe informacje od użytkownika: ${additionalInfo}. Jako odpowiedź podaj tylko format JSON, bez dodatkowych informacji. Przykład formatu JSON:
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

    let question: any = {};
    do {
      let promptAnswer = await this.generateContent(prompt);
      if (promptAnswer.startsWith("```json")) {
        promptAnswer = promptAnswer
          .replace("```json", "")
          .replace("```", "")
          .trim();
      }
      try {
        question = JSON.parse(promptAnswer);
      } catch (error) {
        question = {};
      }
    } while (
      !question.question ||
      !question.answers ||
      question.answers.length < 2
    );

    return question;
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
