class Answer {
  final String id;
  final String questionId;
  final String answer;
  final bool isCorrect;
  final String? image;
  final String createdAt;

  Answer({
    required this.id,
    required this.questionId,
    required this.answer,
    required this.isCorrect,
    this.image,
    required this.createdAt,
  });

  factory Answer.fromJson(Map<String, dynamic> json) {
    return Answer(
      id: json['id'],
      questionId: json['questionId'],
      answer: json['answer'],
      isCorrect: json['isCorrect'],
      image: json['image'],
      createdAt: json['createdAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questionId': questionId,
      'answer': answer,
      'isCorrect': isCorrect,
      'image': image,
      'createdAt': createdAt,
    };
  }
}
