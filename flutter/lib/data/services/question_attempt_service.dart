import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import '../lib/models/question_attempt_model.dart';
import 'auth_service.dart';

class QuestionAttemptService {
  final GraphQLClient _client = AuthService().client;
  final secureStorage = const FlutterSecureStorage();

  Future<Context?> _getHeadersContext() async {
    final String? token = await secureStorage.read(key: "jwt");

    if (token != null && token.isNotEmpty) {
      return Context.fromList([
        HttpLinkHeaders(headers: {'Authorization': 'Bearer $token'}),
      ]);
    }
    return null;
  }

  Future<QuestionAttempt> persistQuestionAttempt({
    required String questionId,
    required String quizAttemptId,
    String? answerId,
    bool? answerBody,
  }) async {
    const String mutation = """
      mutation PersistQuestionAttempt(
        \$questionId: ID!,
        \$quizAttemptId: ID!,
        \$answerId: ID,
        \$answerBody: Boolean
      ) {
        persistQuestionAttempt(
          questionId: \$questionId,
          quizAttemptId: \$quizAttemptId,
          answerId: \$answerId,
          answerBody: \$answerBody
        ) {
          id
          questionId
          quizAttemptId
          answerId
          answerBody
          createdAt
        }
      }
    """;

    final MutationOptions options = MutationOptions(
      document: gql(mutation),
      variables: {
        'questionId': questionId,
        'quizAttemptId': quizAttemptId,
        'answerId': answerId,
        'answerBody': answerBody,
      },
      context: await _getHeadersContext(),
    );

    final QueryResult result = await _client.mutate(options);

    if (result.hasException) {
      print(result.exception.toString());
      throw Exception('Failed to persist question attempt');
    }

    final data = result.data?['persistQuestionAttempt'];
    if (data == null) {
      throw Exception('No data returned for persistQuestionAttempt');
    }

    return QuestionAttempt.fromJson(data);
  }

  Future<List<QuestionAttempt>> getQuestionAttempts({
    required String quizAttemptId,
  }) async {
    const String query = """
      query GetQuestionAttempts(\$quizAttemptId: ID!) {
        questionAttempts(quizAttemptId: \$quizAttemptId) {
          id
          questionId
          quizAttemptId
          answerId
          answerBody
          createdAt
        }
      }
    """;

    final QueryOptions options = QueryOptions(
      document: gql(query),
      variables: {'quizAttemptId': quizAttemptId},
      fetchPolicy: FetchPolicy.networkOnly,
      context: await _getHeadersContext(),
    );

    final QueryResult result = await _client.query(options);

    if (result.hasException) {
      print(result.exception.toString());
      throw Exception('Failed to load question attempts');
    }

    final List<dynamic> attemptsJson = result.data?['questionAttempts'] ?? [];
    return attemptsJson.map((json) => QuestionAttempt.fromJson(json)).toList();
  }
}
