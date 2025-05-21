import 'package:flutter/material.dart';
import 'package:quiz_app/data/lib/models/question_model.dart';
import 'package:quiz_app/data/lib/models/answer_model.dart';
import 'package:quiz_app/data/services/answer_service.dart';

class QuestionCard extends StatefulWidget {
  final Question question;
  final ValueChanged<List<Answer>>? onSelectionChanged;

  const QuestionCard({
    super.key,
    required this.question,
    this.onSelectionChanged,
  });

  @override
  State<QuestionCard> createState() => _QuestionCardState();
}

class _QuestionCardState extends State<QuestionCard> {
  List<Answer> _answers = [];
  Set<String> _selectedAnswerIds = {};
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchAnswers();
  }

  Future<void> _fetchAnswers() async {
    try {
      final answers = await AnswerService().getAnswers(
        questionId: widget.question.id,
      );
      setState(() {
        _answers = answers;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Nie udało się pobrać odpowiedzi.';
        _isLoading = false;
      });
    }
  }

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
            Text(
              widget.question.question,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            if (widget.question.image != null &&
                widget.question.image!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Image.network(
                  widget.question.image!,
                  errorBuilder:
                      (context, error, stackTrace) =>
                          const Text('Błąd wczytywania obrazka'),
                  loadingBuilder: (context, child, progress) {
                    if (progress == null) return child;
                    return const CircularProgressIndicator();
                  },
                ),
              ),
            const SizedBox(height: 16),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (_error != null)
              Text(_error!, style: const TextStyle(color: Colors.red))
            else
              ..._answers
                  .map(
                    (answer) => CheckboxListTile(
                      title: Text(answer.answer),
                      value: _selectedAnswerIds.contains(answer.id.toString()),
                      onChanged: (checked) {
                        setState(() {
                          if (checked == true) {
                            _selectedAnswerIds.add(answer.id.toString());
                          } else {
                            _selectedAnswerIds.remove(answer.id.toString());
                          }
                        });
                        final selected =
                            _answers
                                .where(
                                  (a) => _selectedAnswerIds.contains(
                                    a.id.toString(),
                                  ),
                                )
                                .toList();
                        widget.onSelectionChanged?.call(selected);
                      },
                    ),
                  )
                  .toList(),
          ],
        ),
      ),
    );
  }
}
