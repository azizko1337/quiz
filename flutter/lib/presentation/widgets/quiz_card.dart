import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:quiz_app/data/lib/models/quiz_model.dart';
import 'package:quiz_app/data/services/quiz_attempt_service.dart';

import '../../data/lib/providers/user_provider.dart';
import '../screens/attempt_screen.dart';

class QuizCard extends StatelessWidget {
  final quizAttemptService = QuizAttemptService();
  final Quiz quiz;

  QuizCard({super.key, required this.quiz});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).user;

    if (user == null) {
      return Card(child: Center(child: CircularProgressIndicator()));
    }

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
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                ElevatedButton.icon(
                  onPressed: () async {
                    final newAttempt = await quizAttemptService
                        .createQuizAttempt(quizId: quiz.id, userId: user.id);

                    if (!context.mounted) {
                      return;
                    }

                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder:
                            (context) => AttemptScreen(
                              quizAttempt: newAttempt,
                              quiz: quiz,
                            ),
                      ),
                    );
                  },
                  label: Text("Start"),
                  icon: Icon(Icons.play_arrow),
                  iconAlignment: IconAlignment.end,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
