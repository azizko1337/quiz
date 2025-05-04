import 'package:flutter/material.dart';
import '../widgets/quiz_card.dart';

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
          return QuizCard(question:"bla");
        },
      ),
    );
  }
}
