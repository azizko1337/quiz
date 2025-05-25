<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { quizService, type Quiz } from "@/services/quizService";
import { questionService, type Question } from "@/services/questionService";
import { answerService, type Answer } from "@/services/answerService";
import { useUserStore } from "@/stores/userStore";
import JsonEditorVue from "json-editor-vue";
import type { JSONEditorMode } from "json-editor-vue";
import { toast } from "vue-sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const quiz = ref<Quiz | null>(null);
const questions = ref<Question[]>([]);
const answers = ref<Answer[]>([]); // Store all answers for all questions in this quiz
const isLoading = ref(true);
const error = ref<string | null>(null);

const isEditingQuiz = ref(false);

const jsonEditorModel = ref<string>("[]"); // Initialize with empty array JSON
const jsonEditorMode = ref<JSONEditorMode>("text"); // Add state for editor mode
const editorKey = ref(0); // Add a key for forcing re-render

const editedTitle = ref("");
const editedDescription = ref("");

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
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Wystąpił błąd podczas ładowania danych do edycji quizu.";
    error.value = errorMessage;
    toast.error(`Błąd ładowania: ${errorMessage}`); // Add toast on fetch error
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
    toast.info("Dodano szablon nowego pytania do edytora."); // Add toast on success
  } catch (e) {
    const errorMessage =
      "Nie można dodać pytania: Nieprawidłowy format JSON w edytorze.";
    error.value = errorMessage;
    toast.error(errorMessage); // Add toast on error
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
    const errorMessage = "Nieprawidłowy format JSON.";
    error.value = errorMessage;
    toast.error(errorMessage); // Add toast on JSON parse error
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
      let isNewQuestion = false; // Flag to track if it's a new question

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
        toast.success(`Zaktualizowano pytanie: ${updatedQuestion.question}`);
      } else {
        // Create new question
        isNewQuestion = true;
        const result = await questionService.createQuestion(
          quizId,
          updatedQuestion.question,
          updatedQuestion.image
        );
        questionId = result.id;
        processedQuestionIds.add(questionId); // Also mark new ones as processed relative to the *updated* list
        toast.success(`Utworzono nowe pytanie: ${updatedQuestion.question}`);
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
            toast.success(`Zaktualizowano odpowiedź: ${updatedAnswer.answer}`);
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
            toast.success(`Utworzono nową odpowiedź: ${updatedAnswer.answer}`);
          }
        }
      }

      // Schedule deletion of removed answers for this question (only if the question itself wasn't new)
      if (!isNewQuestion) {
        originalAnswerIds.forEach((originalAnswerId) => {
          if (!processedAnswerIds.has(originalAnswerId)) {
            toast.info(
              `Planowanie usunięcia odpowiedzi ID: ${originalAnswerId}`
            );
            deletePromises.push(answerService.deleteAnswer(originalAnswerId));
          }
        });
      }
    }

    // --- Schedule Deletion of Removed Questions ---
    originalQuestionIds.forEach((originalQuestionId) => {
      if (!processedQuestionIds.has(originalQuestionId)) {
        toast.info(
          `Planowanie usunięcia pytania ID: ${originalQuestionId} (i jego odpowiedzi)`
        );
        // Deleting a question should ideally cascade delete its answers in the backend,
        // but we explicitly delete answers above anyway.
        deletePromises.push(questionService.deleteQuestion(originalQuestionId));
      }
    });

    // --- Execute all deletions ---
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      toast.success(`Pomyślnie usunięto ${deletePromises.length} elementów.`);
    }

    // --- Refresh data ---
    await fetchQuizData(); // Reload data to reflect changes
    editorKey.value++; // Increment key to force re-render of the editor
    jsonEditorMode.value = "text"; // Switch back to text mode after save if needed
    toast.success("Wszystkie zmiany zostały pomyślnie zapisane!"); // Overall success toast
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Wystąpił błąd podczas zapisywania zmian.";
    error.value = errorMessage;
    toast.error(`Błąd zapisu: ${errorMessage}`); // Add toast on save error
    console.error(err);
    // Optionally re-fetch data even on error to revert editor? Or leave as is?
    // Leaving as is for now, user can see the error.
  } finally {
    isLoading.value = false;
  }
}

async function editTitle() {
  if (quiz.value) {
    editedTitle.value = quiz.value.title;
    editedDescription.value = quiz.value.description || "";
    isEditingQuiz.value = true;
  }
}

async function submitEditTitle() {
  if (!quiz.value) return;
  try {
    isLoading.value = true;
    error.value = null;
    await quizService.updateQuiz(
      quiz.value.id,
      editedTitle.value,
      editedDescription.value
    );
    toast.success("Zaktualizowano tytuł i opis quizu.");
    await fetchQuizData();
    isEditingQuiz.value = false;
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Wystąpił błąd podczas zapisywania tytułu/ opisu.";
    error.value = errorMessage;
    toast.error(errorMessage);
  } finally {
    isLoading.value = false;
  }
}

// --- USUWANIE QUIZU ---
async function deleteQuiz() {
  if (!quiz.value) return;
  try {
    isLoading.value = true;
    error.value = null;
    await quizService.deleteQuiz(quiz.value.id);
    toast.success("Quiz został usunięty.");
    router.push("/");
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Wystąpił błąd podczas usuwania quizu.";
    error.value = errorMessage;
    toast.error(errorMessage);
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
    <div v-else-if="quiz" class="flex flex-col gap-4">
      <form @submit.prevent="submitEditTitle" class="flex flex-col gap-2">
        <h1 class="text-3xl flex gap-2">
          <p class="whitespace-nowrap">Edycja quizu</p>
          <b v-if="!isEditingQuiz" class="cursor-alias" @click="editTitle">{{
            quiz.title
          }}</b>
          <Input
            v-else
            v-model="editedTitle"
            class="p-2 border-1 w-full max-w-[400px] text-2xl! font-bold!"
          />
        </h1>
        <p v-if="!isEditingQuiz">
          {{ quiz.description || "Brak opisu quizu." }}
        </p>
        <Textarea
          v-else
          v-model="editedDescription"
          class="p-2 w-full max-w-[500px] border-1"
        ></Textarea>
        <div v-if="isEditingQuiz" class="flex gap-2">
          <Button class="border-1" type="submit" :disabled="isLoading"
            >Zapisz</Button
          >
          <Button
            class="border-1"
            type="button"
            @click="isEditingQuiz = false"
            variant="secondary"
            >Anuluj</Button
          >
        </div>
      </form>
      <Alert class="max-w-xl">
        <AlertTitle>Podpowiedź</AlertTitle>
        <AlertDescription>
          Edytuj pytania i odpowiedzi poniżej w formacie JSON. Pamiętaj o
          zachowaniu poprawnej struktury. Możesz dodawać nowe pytania (pomijając
          pole "id") i odpowiedzi (pomijając pole "id"). Usunięcie pytania lub
          odpowiedzi z JSON spowoduje ich usunięcie z bazy danych po zapisaniu.
        </AlertDescription>
      </Alert>
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
      <div class="mt-4 flex gap-2 justify-end">
        <Button
          @click="deleteQuiz"
          :disabled="isLoading"
          class="border-1 bg-red-500 text-white transition-color hover:bg-red-600!"
          variant="destructive"
        >
          Usuń quiz
        </Button>
        <div class="grow"></div>
        <Button @click="addNewQuestion" :disabled="isLoading" class="border-1">
          Dodaj nowe pytanie
        </Button>
        <Button @click="pushQuestions" :disabled="isLoading" class="border-1">
          {{ isLoading ? "Zapisywanie..." : "Zapisz zmiany" }}
        </Button>
      </div>
    </div>
    <div v-else>Nie udało się załadować danych quizu.</div>
  </div>
</template>
