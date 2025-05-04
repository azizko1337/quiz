import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import '../../data/lib/models/user_model.dart';
import '../../data/lib/providers/user_provider.dart';
import '../../data/services/auth_service.dart';
import '../../data/lib/getUser.dart';
import '../widgets/question_card.dart';

class QuizzesScreen extends StatefulWidget {
  const QuizzesScreen({super.key});

  @override
  State<QuizzesScreen> createState() => _QuizzesScreenState();
}

class _QuizzesScreenState extends State<QuizzesScreen> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    List<String> items = ['Jabłko', 'Banan', 'Gruszka'];

    return Scaffold(
      appBar: AppBar(title: const Text("Quizy")),
      body: ListView.builder(
        itemCount: items.length,
        itemBuilder: (context, index) {
          return QuestionCard(question:"bla");
        },
      ),
    );
  }
}
