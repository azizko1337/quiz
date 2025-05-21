class Question {
  final String id;
  final String quizId;
  final String question;
  final String? image;
  final String createdAt;

  Question({
    required this.id,
    required this.quizId,
    required this.question,
    this.image,
    required this.createdAt,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'],
      quizId: json['quizId'],
      question: json['question'],
      image: json['image'],
      createdAt: json['createdAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'quizId': quizId,
      'question': question,
      'image': image,
      'createdAt': createdAt,
    };
  }
}
