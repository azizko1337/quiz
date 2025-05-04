import 'package:flutter/material.dart';

class QuestionCard extends StatelessWidget {
  final String question;
   List<String> answers = [];

   QuestionCard({
    super.key,
    required this.question
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 5,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(question, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            ...answers.map((a) => ElevatedButton(
              onPressed: () {
                print(1);
              },
              child: Text(a),
            ))
          ],
        ),
      ),
    );
  }
}