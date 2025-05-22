class QuestionAttempt {
  final String id;
  final String questionId;
  final String quizAttemptId;
  final String? answerId;
  final bool? answerBody;
  final String createdAt;

  QuestionAttempt({
    required this.id,
    required this.questionId,
    required this.quizAttemptId,
    this.answerId,
    this.answerBody,
    required this.createdAt,
  });

  factory QuestionAttempt.fromJson(Map<String, dynamic> json) {
    return QuestionAttempt(
      id: json['id'],
      questionId: json['questionId'],
      quizAttemptId: json['quizAttemptId'],
      answerId: json['answerId'],
      answerBody: json['answerBody'],
      createdAt: json['createdAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questionId': questionId,
      'quizAttemptId': quizAttemptId,
      'answerId': answerId,
      'answerBody': answerBody,
      'createdAt': createdAt,
    };
  }
}
