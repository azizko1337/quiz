import 'user_model.dart'; // Assuming user_model.dart exists

class Quiz {
  final String id;
  final String authorId;
  final String title;
  final String? description;
  final String createdAt;
  final bool isPublic;
  final UserModel? author; // Optional: Include if you fetch author details

  Quiz({
    required this.id,
    required this.authorId,
    required this.title,
    this.description,
    required this.createdAt,
    required this.isPublic,
    this.author,
  });

  factory Quiz.fromJson(Map<String, dynamic> json) {
    return Quiz(
      id: json['id'],
      authorId: json['authorId'],
      title: json['title'],
      description: json['description'],
      createdAt: json['createdAt'],
      isPublic: json['isPublic'],
      // Assuming author data might be nested or fetched separately
      author: json['author'] != null ? UserModel.fromMap(json['author']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'authorId': authorId,
      'title': title,
      'description': description,
      'createdAt': createdAt,
      'isPublic': isPublic,
      'author': author?.toMap(), // Assuming User model has toMap
    };
  }
}
