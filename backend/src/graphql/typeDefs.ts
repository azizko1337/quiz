export const typeDefs = `#graphql
  enum Role {
    ADMIN
    USER
  }

  type User {
    id: ID!
    username: String!
    email: String
    role: Role
    createdAt: String
  }

  type Quiz {
    id: ID!
    authorId: ID!
    title: String!
    description: String
    createdAt: String!
    isPublic: Boolean!
  }

  type Question {
    id: ID!
    quizId: ID!
    question: String!
    image: String
    createdAt: String!
  }

  type Answer {
    id: ID!
    questionId: ID!
    answer: String!
    isCorrect: Boolean!
    image: String
    createdAt: String!
  }

  type QuizAttempt {
    id: ID!
    quizId: ID!
    userId: ID!
    score: Int
    createdAt: String!
  }

  type QuestionAttempt {
    id: ID!
    questionId: ID!
    quizAttemptId: ID!
    answerId: ID
    answerBody: Boolean
    createdAt: String!
  }

  type Query {
    user(id: ID!): User
    getMe: User
    users: [User!]!
    quiz(id: ID!): Quiz
    quizzes(authorId: ID): [Quiz!]!
    question(id: ID!): Question
    questions(quizId: ID!): [Question!]!
    answer(id: ID!): Answer
    answers(questionId: ID!): [Answer!]!
    quizAttempt(id: ID!): QuizAttempt
    quizAttempts(userId: ID!): [QuizAttempt!]!
    questionAttempt(id: ID!): QuestionAttempt
    questionAttempts(quizAttemptId: ID!): [QuestionAttempt!]!
  }

  type Mutation {
    createUser(username: String!, email: String!, password: String!, role: Role): User!
    updateUser(
      id: ID!
      username: String
      email: String
      password: String
      role: Role
    ): User!
    deleteUser(id: ID!): Boolean!

    createQuiz(authorId: ID!, title: String!, isPublic: Boolean, description: String): Quiz!
    updateQuiz(id: ID!, title: String, description: String): Quiz!
    deleteQuiz(id: ID!): Boolean!

    createQuestion(quizId: ID!, question: String!, image: String): Question!
    updateQuestion(id: ID!, question: String, image: String): Question!
    deleteQuestion(id: ID!): Boolean!

    createAnswer(
      questionId: ID!
      answer: String!
      isCorrect: Boolean!
      image: String
    ): Answer!
    updateAnswer(
      id: ID!
      answer: String
      isCorrect: Boolean
      image: String
    ): Answer!
    deleteAnswer(id: ID!): Boolean!

    createQuizAttempt(quizId: ID!, userId: ID!): QuizAttempt!
    persistQuizAttempt(quizId: ID!, userId: ID!, score: Int): QuizAttempt!
    deleteQuizAttempt(id: ID!): Boolean!

    persistQuestionAttempt(
      questionId: ID!
      quizAttemptId: ID!
      answerId: ID
      answerBody: Boolean
    ): QuestionAttempt!

    login(email: String!, password: String!): User!
    logout: Boolean!

    generateQuiz(title: String!, description: String!, isPublic: Boolean!, numberOfQuestions: Int!, additionalInfo: String): Quiz
  }
`;
