<script setup lang="ts">
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Check, Ellipsis } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import type { Question } from "@/services/questionService";
import { answerService } from "@/services/answerService";
import type { Answer } from "@/services/answerService";
import { attemptService } from "@/services/attemptService";
import type { QuizAttempt, QuestionAttempt } from "@/services/attemptService";
import type { Quiz } from "@/services/quizService";
import { useAttemptStore } from "@/stores/attemptStore";

const attemptStore = useAttemptStore();

const isMoreOptionsOpened = ref(false);
const {
  question,
  quiz,
  quizAttempt,
  index,
}: { question: Question; quiz: Quiz; quizAttempt: QuizAttempt; index: number } =
  defineProps({
    question: {
      type: Object as () => Question,
      required: true,
    },
    quiz: {
      type: Object as () => Quiz,
      required: true,
    },
    quizAttempt: {
      type: Object as () => QuizAttempt,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  });

const answers = ref<Answer[]>([]);
const answersInputs = ref<Record<string, boolean>>({});

async function handleAnswerChange(answerId: string, value: boolean) {
  answersInputs.value[answerId] = value;
  const _attempt = await attemptService.persistQuestionAttempt(
    question.id,
    quizAttempt.id,
    answerId,
    value
  );

  attemptStore.update();
}

onMounted(async () => {
  const _answers = await answerService.getAnswers(question.id);
  answers.value = _answers;
  const _questionAttempts: QuestionAttempt[] =
    await attemptService.getQuestionAttempts(quizAttempt.id);
  for (const questionAttempt of _questionAttempts) {
    for (const answer of _answers) {
      if (questionAttempt.answerId === answer.id) {
        answersInputs.value[answer.id] = questionAttempt.answerBody ?? false;
        break;
      }
    }
  }
});
</script>
<template>
  <form
    class="flex flex-col gap-8 justify-between w-full max-w-[700px] rounded-lg px-4 py-3 shadow-2xl border-2"
  >
    <div class="flex gap-4 items-center">
      <span
        class="border-b-3 flex justify-center items-center w-8 h-8 font-sans text-sm"
        >{{ index }}</span
      >
      <h2 class="grow">
        {{ question.question }}
      </h2>
      <Button
        @click.prevent="isMoreOptionsOpened = !isMoreOptionsOpened"
        class="relative"
      >
        <Ellipsis :size="24" />

        <div
          v-if="isMoreOptionsOpened"
          @click.stop.prevent
          class="absolute top-[100%] right-[100%] w-[200px] bg-red-500"
        >
          sadasd
        </div>
      </Button>
    </div>

    <div v-if="question.image" class="w-full max-w-[500px]">
      <img class="w-full" :src="question.image" />
    </div>

    <ul class="flex flex-col gap-4">
      <li
        v-for="answer in answers"
        :key="answer.id"
        class="items-top flex gap-x-2"
      >
        <Checkbox
          :model-value="answersInputs[answer.id]"
          @update:model-value="(value) => handleAnswerChange(answer.id, value as boolean)"
          :id="answer.id"
        />
        <div class="grid gap-1.5 leading-none">
          <label
            :for="answer.id"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {{ answer.answer }}
          </label>
        </div>
      </li>
    </ul>
    <div class="flex justify-end gap-4">
      <Button @click.prevent @dblclick="console.log(1)" class="border-1"
        >Sprawdź odpowiedzi</Button
      >
      <Button class="border-1">
        <Check :size="24" />
      </Button>
    </div>
  </form>
</template>
