import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:quiz_app/data/lib/models/question_model.dart';
import 'package:quiz_app/data/lib/models/quiz_attempt_model.dart';
import 'package:quiz_app/data/lib/models/quiz_model.dart';
import 'package:quiz_app/data/services/question_service.dart';
import 'package:quiz_app/data/services/quiz_attempt_service.dart';
import 'package:quiz_app/data/services/quiz_service.dart';
import 'package:quiz_app/presentation/screens/attempt_screen.dart';

import '../../data/lib/providers/user_provider.dart';

typedef LoadQuizAttempts = void Function();

class QuizAttemptCard extends StatefulWidget {
  final QuizAttempt quizAttempt;
  final LoadQuizAttempts? loadQuizAttempts;

  QuizAttemptCard({
    super.key,
    required this.quizAttempt,
    this.loadQuizAttempts,
  });

  @override
  State<QuizAttemptCard> createState() => _QuizAttemptCardState();
}

class _QuizAttemptCardState extends State<QuizAttemptCard> {
  final quizService = QuizService();
  final quizAttemptService = QuizAttemptService();
  final questionService = QuestionService();

  Quiz? _quiz = null;
  List<Question> _questions = [];

  @override
  void initState() {
    super.initState();
    loadQuizAndQuestions();
  }

  void loadQuizAndQuestions() async {
    final quiz = await quizService.getQuiz(widget.quizAttempt.quizId);
    final questions = await questionService.getQuestions(
      quizId: widget.quizAttempt.quizId,
    );

    setState(() {
      _quiz = quiz;
      _questions = questions;
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).user;

    if (_quiz == null || user == null) {
      return Card(child: Center(child: CircularProgressIndicator()));
    }

    final score =
        _questions.length > 0
            ? ((widget.quizAttempt.score ?? 0) * 100 / _questions.length)
                .round()
            : 0;

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
              "Wynik: ${score}%",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Row(
              spacing: 10,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                ElevatedButton.icon(
                  onPressed: () async {
                    final newAttempt = await quizAttemptService
                        .createQuizAttempt(quizId: _quiz!.id, userId: user.id);

                    if (!context.mounted) {
                      return;
                    }

                    await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder:
                            (context) => AttemptScreen(
                              quizAttempt: newAttempt,
                              quiz: _quiz!,
                            ),
                      ),
                    );

                    widget.loadQuizAttempts?.call();
                  },
                  label: Text("Nowe"),
                  icon: Icon(Icons.add),
                  iconAlignment: IconAlignment.end,
                ),
                ElevatedButton.icon(
                  onPressed: () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder:
                            (context) => AttemptScreen(
                              quizAttempt: widget.quizAttempt,
                              quiz: _quiz!,
                            ),
                      ),
                    );
                    widget.loadQuizAttempts?.call();
                  },
                  label: Text("Kontynuuj"),
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
