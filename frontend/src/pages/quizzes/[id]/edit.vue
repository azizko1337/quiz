<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { quizService, type Quiz } from "@/services/quizService";
import { questionService, type Question } from "@/services/questionService";
import { answerService, type Answer } from "@/services/answerService";
import { useUserStore } from "@/stores/userStore";
import JsonEditorVue from "json-editor-vue";
import type { JSONEditorMode } from "json-editor-vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const quiz = ref<Quiz | null>(null);
const questions = ref<Question[]>([]);
const answers = ref<Answer[]>([]); // Store all answers for all questions in this quiz
const isLoading = ref(true);
const error = ref<string | null>(null);

const jsonEditorModel = ref<string>("[]"); // Initialize with empty array JSON
const jsonEditorMode = ref<JSONEditorMode>("text"); // Add state for editor mode
const editorKey = ref(0); // Add a key for forcing re-render

// Helper function to fetch all data
async function fetchQuizData() {
  const quizId = route.params.id as string;
  if (!quizId || !userStore.user) {
    // Basic checks, more robust checks happen in onMounted/pushQuestions
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;

    const fetchedQuiz = await quizService.getQuiz(quizId);
    if (!fetchedQuiz) {
      throw new Error("Nie znaleziono quizu.");
    }
    quiz.value = fetchedQuiz;

    if (fetchedQuiz.authorId !== userStore.user.id) {
      throw new Error("Nie masz uprawnień do edycji tego quizu.");
    }

    const fetchedQuestions = await questionService.getQuestions(quizId);
    questions.value = fetchedQuestions;

    const allAnswers: Answer[] = [];
    const answerPromises = fetchedQuestions.map(async (question) => {
      const fetchedAnswers = await answerService.getAnswers(question.id);
      allAnswers.push(...fetchedAnswers);
    });
    await Promise.all(answerPromises);
    answers.value = allAnswers;

    // Update JSON editor model after fetching
    jsonEditorModel.value = JSON.stringify(
      questions.value.map((question) => ({
        id: question.id,
        question: question.question,
        image: question.image,
        answers: answers.value
          .filter((answer) => answer.questionId === question.id)
          .map((answer) => ({
            id: answer.id,
            answer: answer.answer,
            image: answer.image,
            isCorrect: answer.isCorrect,
          })),
      })),
      null, // replacer
      2 // space for pretty printing
    );
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : "Wystąpił błąd podczas ładowania danych do edycji quizu.";
    console.error(err);
    // Clear potentially partially loaded data
    jsonEditorModel.value = "[]";
    quiz.value = null;
    questions.value = [];
    answers.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  const quizId = route.params.id as string;

  if (!quizId) {
    error.value = "Nieprawidłowy identyfikator quizu.";
    isLoading.value = false;
    return;
  }

  if (!userStore.user) {
    router.push("/auth/login");
    return;
  }

  await fetchQuizData(); // Call the refactored fetch function
});

// Function to add a new empty question template to the JSON editor
function addNewQuestion() {
  try {
    let currentData = JSON.parse(jsonEditorModel.value || "[]");
    if (!Array.isArray(currentData)) {
      // If current data isn't an array (e.g., empty or invalid), start fresh
      currentData = [];
    }

    const newQuestionTemplate = {
      // No 'id' field for new questions
      question: "Nowe pytanie?",
      image: null, // or ""
      answers: [
        {
          // No 'id' field for new answers
          answer: "Odpowiedź A",
          image: null, // or ""
          isCorrect: true,
        },
        {
          answer: "Odpowiedź B",
          image: null, // or ""
          isCorrect: false,
        },
      ],
    };

    currentData.push(newQuestionTemplate);

    // Update the model with the pretty-printed JSON
    jsonEditorModel.value = JSON.stringify(currentData, null, 2);
  } catch (e) {
    error.value =
      "Nie można dodać pytania: Nieprawidłowy format JSON w edytorze.";
    console.error("Error parsing JSON before adding new question:", e);
    // Optionally reset or handle the error state more gracefully
  }
}

async function pushQuestions() {
  let updatedQuestionsData: any[];
  try {
    updatedQuestionsData = JSON.parse(jsonEditorModel.value);
    if (!Array.isArray(updatedQuestionsData)) {
      throw new Error("JSON data must be an array of questions.");
    }
  } catch (e) {
    error.value = "Nieprawidłowy format JSON.";
    console.error(e);
    return;
  }

  if (!userStore.user) {
    router.push("/auth/login");
    return;
  }

  const quizId = route.params.id as string;
  if (!quizId) {
    error.value = "Nieprawidłowy identyfikator quizu.";
    return;
  }
  // Ensure quiz data is loaded before proceeding
  if (!quiz.value || quiz.value.authorId !== userStore.user.id) {
    error.value = "Nie można zapisać zmian. Brak danych quizu lub uprawnień.";
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;

    // --- Prepare for Deletion Tracking ---
    const originalQuestionIds = new Set(questions.value.map((q) => q.id));
    const originalAnswerIdsByQuestionId = new Map<string, Set<string>>();
    questions.value.forEach((q) => {
      const answerIds = new Set(
        answers.value.filter((a) => a.questionId === q.id).map((a) => a.id)
      );
      originalAnswerIdsByQuestionId.set(q.id, answerIds);
    });

    const processedQuestionIds = new Set<string>();
    const deletePromises: Promise<any>[] = []; // Collect all delete promises

    // --- Process Updated/New Questions and Answers ---
    for (const updatedQuestion of updatedQuestionsData) {
      let questionId: string;

      // Upsert Question
      if (updatedQuestion.id) {
        // Update existing question
        const result = await questionService.updateQuestion(
          updatedQuestion.id,
          updatedQuestion.question,
          updatedQuestion.image
        );
        questionId = result.id;
        processedQuestionIds.add(questionId); // Mark as processed
      } else {
        // Create new question
        const result = await questionService.createQuestion(
          quizId,
          updatedQuestion.question,
          updatedQuestion.image
        );
        questionId = result.id;
        // New questions don't have original answers, so no need to add to originalAnswerIdsByQuestionId
        // Add to processedQuestionIds implicitly by processing it
        processedQuestionIds.add(questionId); // Also mark new ones as processed relative to the *updated* list
      }

      const originalAnswerIds =
        originalAnswerIdsByQuestionId.get(updatedQuestion.id) ||
        new Set<string>(); // Get original answers for *this* question ID if it existed
      const processedAnswerIds = new Set<string>();

      // Upsert Answers for this question
      if (Array.isArray(updatedQuestion.answers)) {
        for (const updatedAnswer of updatedQuestion.answers) {
          let answerId: string;
          if (updatedAnswer.id) {
            // Update existing answer
            const result = await answerService.updateAnswer(
              updatedAnswer.id,
              updatedAnswer.answer,
              updatedAnswer.isCorrect,
              updatedAnswer.image
            );
            answerId = result.id;
            processedAnswerIds.add(answerId); // Mark as processed
          } else {
            // Create new answer
            const result = await answerService.createAnswer(
              questionId, // Use the ID of the (potentially new) question
              updatedAnswer.answer,
              updatedAnswer.isCorrect,
              updatedAnswer.image
            );
            answerId = result.id;
            processedAnswerIds.add(answerId); // Mark new ones as processed
          }
        }
      }

      // Schedule deletion of removed answers for this question
      originalAnswerIds.forEach((originalAnswerId) => {
        if (!processedAnswerIds.has(originalAnswerId)) {
          console.log(`Scheduling deletion of answer: ${originalAnswerId}`);
          deletePromises.push(answerService.deleteAnswer(originalAnswerId));
        }
      });
    }

    // --- Schedule Deletion of Removed Questions ---
    originalQuestionIds.forEach((originalQuestionId) => {
      if (!processedQuestionIds.has(originalQuestionId)) {
        console.log(`Scheduling deletion of question: ${originalQuestionId}`);
        // Deleting a question should ideally cascade delete its answers in the backend,
        // but we explicitly delete answers above anyway.
        deletePromises.push(questionService.deleteQuestion(originalQuestionId));
      }
    });

    // --- Execute all deletions ---
    await Promise.all(deletePromises);

    // --- Refresh data ---
    await fetchQuizData(); // Reload data to reflect changes
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : "Wystąpił błąd podczas zapisywania zmian.";
    console.error(err);
    // Optionally re-fetch data even on error to revert editor? Or leave as is?
    // Leaving as is for now, user can see the error.
  } finally {
    isLoading.value = false;
  }
}
</script>
<template>
  <div>
    <div v-if="isLoading && !quiz">Ładowanie danych edycji...</div>
    <div
      v-else-if="error"
      class="text-destructive p-4 border border-destructive bg-destructive/10 rounded"
    >
      Błąd: {{ error }}
    </div>
    <div v-else-if="quiz">
      <h1>Edycja Quizu: {{ quiz.title }}</h1>
      <p class="text-muted-foreground text-sm mb-4">
        Edytuj pytania i odpowiedzi poniżej w formacie JSON. Pamiętaj o
        zachowaniu poprawnej struktury. Możesz dodawać nowe pytania (pomijając
        pole "id") i odpowiedzi (pomijając pole "id"). Usunięcie pytania lub
        odpowiedzi z JSON spowoduje ich usunięcie z bazy danych po zapisaniu.
      </p>
      <JsonEditorVue
        :key="editorKey"
        v-model="jsonEditorModel"
        v-bind="{
          mode: 'text',
          mainMenuBar: false,
          navigationBar: false,
          readOnly: isLoading,
          indentation: 2,
        }"
        class="text-left h-[60vh] border rounded"
      />
      <div class="mt-4 flex gap-2">
        <button
          @click="addNewQuestion"
          :disabled="isLoading"
          class="px-4 py-2 bg-secondary text-secondary-foreground rounded disabled:opacity-50"
        >
          Dodaj nowe pytanie
        </button>
        <button
          @click="pushQuestions"
          :disabled="isLoading"
          class="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
        >
          {{ isLoading ? "Zapisywanie..." : "Zapisz zmiany" }}
        </button>
      </div>
    </div>
    <div v-else>Nie udało się załadować danych quizu.</div>
  </div>
</template>
