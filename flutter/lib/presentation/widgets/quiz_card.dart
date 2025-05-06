import 'package:flutter/material.dart';
import 'package:quiz_app/data/lib/models/quiz_model.dart';

class QuizCard extends StatelessWidget {
  final Quiz quiz;

  QuizCard({super.key, required this.quiz});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 3,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(quiz.title, style: Theme.of(context).textTheme.titleLarge),
            Text(quiz.description ?? "Brak opisu."),
            Badge(label: Text(quiz.isPublic ? "Publiczny" : "Niepubliczny")),
            Text("Utworzono ${quiz.createdAt}"),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                print(1);
              },
              child: Text("Start"),
            ),
          ],
        ),
      ),
    );
  }
}
