import 'package:flutter/material.dart';
import 'package:quiz_app/data/lib/models/quiz_model.dart';
import '../../data/services/quiz_service.dart';
import '../widgets/quiz_card.dart';

class QuizzesScreen extends StatefulWidget {
  const QuizzesScreen({super.key});

  @override
  State<QuizzesScreen> createState() => _QuizzesScreenState();
}

class _QuizzesScreenState extends State<QuizzesScreen> {
  final quizService = QuizService();

  List<Quiz>? _quizzes;

  @override
  void initState() {
    super.initState();
    loadQuizzes();
  }

  void loadQuizzes() async {
    final quizzes = await quizService.getQuizzes();
    setState(() {
      _quizzes = quizzes;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Quizy")),
      body: ListView.builder(
        itemCount: _quizzes == null ? 0 : _quizzes!.length,
        itemBuilder: (context, index) {
          if (_quizzes != null && _quizzes!.isNotEmpty) {
            final _quiz = _quizzes![index];
            return QuizCard(quiz: _quiz);
          } else {
            return const Center(child: CircularProgressIndicator());
          }
        },
      ),
    );
  }
}
