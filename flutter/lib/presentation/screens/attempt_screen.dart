import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import 'package:quiz_app/data/services/question_attempt_service.dart';
import 'package:quiz_app/data/services/question_service.dart';
import 'package:quiz_app/data/services/quiz_attempt_service.dart';
import '../../data/lib/models/answer_model.dart';
import '../../data/lib/models/question_model.dart';
import '../../data/lib/models/quiz_attempt_model.dart';
import '../../data/lib/models/quiz_model.dart';
import '../../data/lib/models/user_model.dart';
import '../../data/lib/providers/user_provider.dart';
import '../../data/services/auth_service.dart';
import '../../data/lib/getUser.dart';
import '../widgets/quiz_attempt_card.dart';
import '../widgets/question_card.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class AttemptScreen extends StatefulWidget {
  const AttemptScreen({super.key, required this.quizAttempt, this.quiz});

  final QuizAttempt quizAttempt;
  final Quiz? quiz;

  @override
  State<AttemptScreen> createState() => _AttemptScreenState();
}

class _AttemptScreenState extends State<AttemptScreen> {
  final questionService = QuestionService();
  final quizAttemptService = QuizAttemptService();
  final questionAttemptService = QuestionAttemptService();

  QuizAttempt? _quizAttempt;
  List<Question> _questions = [];

  @override
  void initState() {
    _quizAttempt = widget.quizAttempt;
    super.initState();
    loadQuestions();
  }

  loadQuestions() async {
    final questions = await questionService.getQuestions(
      quizId: widget.quizAttempt.quizId,
    );

    setState(() {
      _questions = questions;
    });
  }

  refreshQuizAttempt() async {
    final quizAttempt = await quizAttemptService.getQuizAttempt(
      id: widget.quizAttempt.id,
    );

    setState(() {
      _quizAttempt = quizAttempt;
    });
  }

  onSelectionChanged(
    String questionId,
    List<Answer> selected,
    List<Answer> notSelected,
  ) async {
    if (_quizAttempt == null) {
      return;
    }

    for (final a in selected) {
      await questionAttemptService.persistQuestionAttempt(
        questionId: questionId,
        quizAttemptId: _quizAttempt!.id,
        answerId: a.id,
        answerBody: true,
      );
    }

    for (final a in notSelected) {
      await questionAttemptService.persistQuestionAttempt(
        questionId: questionId,
        quizAttemptId: _quizAttempt!.id,
        answerId: a.id,
        answerBody: false,
      );
    }

    await refreshQuizAttempt();
  }

  @override
  Widget build(BuildContext context) {
    final score =
        _questions.isNotEmpty
            ? ((_quizAttempt?.score ?? 0) * 100 / _questions.length).round()
            : 0;

    return Scaffold(
      appBar: AppBar(title: Text("Quiz ${widget.quiz?.title ?? ''}")),
      body: ListView.builder(
        itemCount: _questions.length + 1,
        itemBuilder: (context, index) {
          if (index == _questions.length) {
            return const SizedBox(height: 100);
          }

          if (_questions.isNotEmpty) {
            final question = _questions[index];
            return QuestionCard(
              question: question,
              quizAttempt: widget.quizAttempt,
              onSelectionChanged: onSelectionChanged,
            );
          } else {
            return Text(AppLocalizations.of(context)!.noQuestions);
          }
        },
      ),
      bottomSheet: Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).primaryColor,
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          boxShadow: [
            BoxShadow(
              color: Colors.black26,
              blurRadius: 8,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              "Twój wynik",
              style: TextStyle(color: Colors.white70, fontSize: 14),
            ),
            SizedBox(height: 8),
            LinearProgressIndicator(
              value: score / 100,
              backgroundColor: Colors.white24,
              valueColor: AlwaysStoppedAnimation(Colors.white),
            ),
            SizedBox(height: 8),
            Text(
              "$score%",
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
