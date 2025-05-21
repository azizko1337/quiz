import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import 'package:quiz_app/data/services/quiz_attempt_service.dart';
import '../../data/lib/models/quiz_attempt_model.dart';
import '../../data/lib/models/user_model.dart';
import '../../data/lib/providers/user_provider.dart';
import '../../data/services/auth_service.dart';
import '../../data/lib/getUser.dart';
import '../widgets/quiz_attempt_card.dart';
import '../widgets/question_card.dart';

class AttemptsScreen extends StatefulWidget {
  const AttemptsScreen({super.key});

  @override
  State<AttemptsScreen> createState() => _AttemptsScreenState();
}

class _AttemptsScreenState extends State<AttemptsScreen> {
  final quizAttemptService = QuizAttemptService();

  List<QuizAttempt>? _quizAttempts;

  @override
  void initState() {
    super.initState();
    loadQuizAttempts();
  }

  void loadQuizAttempts() async {
    final userProvider = Provider.of<UserProvider>(context, listen: false);

    print("loading");
    if(userProvider.user?.id != null){
      final quizAttempts = await quizAttemptService.getQuizAttempts(userId: userProvider.user!.id);
      setState(() {
        _quizAttempts = quizAttempts;
      });
      print("pobrano");
    }else{
      await AuthService().logout(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Moje podejścia")),
      body: ListView.builder(
        itemCount: _quizAttempts == null ? 0 : _quizAttempts!.length,
        itemBuilder: (context, index) {
          if (_quizAttempts != null && _quizAttempts!.isNotEmpty) {
            final _quizAttempt = _quizAttempts![index];
            return QuizAttemptCard(quizAttempt: _quizAttempt);
          } else {
            return const Center(child: CircularProgressIndicator());
          }
        },
      ),
    );
  }
}
