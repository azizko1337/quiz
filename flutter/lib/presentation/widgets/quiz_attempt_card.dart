import 'package:flutter/material.dart';
import 'package:quiz_app/data/lib/models/quiz_attempt_model.dart';
import 'package:quiz_app/data/lib/models/quiz_model.dart';
import 'package:quiz_app/data/services/quiz_service.dart';

class QuizAttemptCard extends StatefulWidget {
  final QuizAttempt quizAttempt;

  QuizAttemptCard({super.key, required this.quizAttempt});

  @override
  State<QuizAttemptCard> createState() => _QuizAttemptCardState();
}

class _QuizAttemptCardState extends State<QuizAttemptCard> {
  final quizService = QuizService();

  Quiz? _quiz = null;

  @override
  void initState() {
    super.initState();
    loadQuiz();
  }

  void loadQuiz() async {
    // final quiz = await quizS.getQuizAttempts(userId: userProvider.user!.id);
    final quiz = await quizService.getQuiz(widget.quizAttempt.quizId);
    setState(() {
      _quiz = quiz;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_quiz == null) {
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
            Text(_quiz!.title, style: Theme.of(context).textTheme.titleLarge),
            Text(_quiz!.description ?? "Brak opisu."),
            Text("Rozpoczęto ${widget.quizAttempt.createdAt}"),
            Text(
              "Wynik: ${123}%",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Row(
              spacing: 10,
              children: [
                ElevatedButton(
                  onPressed: () {
                    print(1);
                  },
                  child: Text("Nowe podejście"),
                ),
                ElevatedButton(
                  onPressed: () {
                    print(2);
                  },
                  child: Text("Kontynnuj podejście"),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
