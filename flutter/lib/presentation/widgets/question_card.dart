import 'package:flutter/material.dart';
import 'package:quiz_app/data/lib/models/question_model.dart';
import 'package:quiz_app/data/lib/models/answer_model.dart';
import 'package:quiz_app/data/services/answer_service.dart';

import 'package:quiz_app/data/lib/models/quiz_attempt_model.dart';
import '../../data/services/question_attempt_service.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

typedef OnSelectionChanged = void Function(String questionId, List<Answer> selected, List<Answer> notSelected);

class QuestionCard extends StatefulWidget {
  final Question question;
  final QuizAttempt quizAttempt;
  final OnSelectionChanged? onSelectionChanged;

  QuestionCard({
    super.key,
    required this.question,
    required this.quizAttempt,
    this.onSelectionChanged,
  });

  @override
  State<QuestionCard> createState() => _QuestionCardState();
}

class _QuestionCardState extends State<QuestionCard> {
  final questionAttemptService = QuestionAttemptService();

  List<Answer> _answers = [];
  Set<String> _selectedAnswerIds = {};
  bool _isLoading = true;
  String? _error;
  bool _showCorrectAnswers = false;

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

      Set<String> selectedAnswerIds = {};
      final questionAttempts = await questionAttemptService.getQuestionAttempts(quizAttemptId: widget.quizAttempt.id);
      for (var questionAttempt in questionAttempts) {
        if(questionAttempt.answerBody == true && questionAttempt.answerId != null){
          selectedAnswerIds.add(questionAttempt.answerId!);
        }
      }

      setState(() {
        _answers = answers;
        _selectedAnswerIds = selectedAnswerIds;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = AppLocalizations.of(context)!.errorFetchingQuestions;
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    widget.question.question,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
                IconButton(
                  icon: Icon(
                    _showCorrectAnswers ? Icons.visibility_off : Icons.visibility,
                  ),
                  onPressed: () {
                    setState(() {
                      _showCorrectAnswers = !_showCorrectAnswers;
                    });
                  },
                ),
              ],
            ),
            if (widget.question.image != null &&
                widget.question.image!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Image.network(
                  widget.question.image!,
                  errorBuilder:
                      (context, error, stackTrace) =>
                          Text(AppLocalizations.of(context)!.imageError),
                  loadingBuilder: (context, child, progress) {
                    if (progress == null) return child;
                    return const CircularProgressIndicator();
                  },
                ),
              ),
            const SizedBox(height: 8),
            const SizedBox(height: 16),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (_error != null)
              Text(_error!, style: const TextStyle(color: Colors.red))
            else
              ..._answers.map((answer) => CheckboxListTile(
                 // podświetlenie poprawnych
                 tileColor: _showCorrectAnswers && answer.isCorrect
                     ? Colors.green.withOpacity(0.2)
                     : null,
                 title: Text(answer.answer),
                 value: _selectedAnswerIds.contains(answer.id.toString()),
                 onChanged: _showCorrectAnswers
                     ? null
                     : (checked) {
                        setState(() {
                          if (checked == true) {
                            _selectedAnswerIds.add(answer.id.toString());
                          } else {
                            _selectedAnswerIds.remove(answer.id.toString());
                          }
                        });
                        final selected = _answers
                            .where((a) =>
                                _selectedAnswerIds.contains(a.id.toString()))
                            .toList();
                        final notSelected = _answers
                            .where((a) =>
                                !_selectedAnswerIds.contains(a.id.toString()))
                            .toList();
                        widget.onSelectionChanged
                            ?.call(widget.question.id, selected, notSelected);
                   },
               )).toList(),
          ],
        ),
      ),
    );
  }
}
