import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import '../lib/models/quiz_attempt_model.dart';
import '../lib/models/quiz_model.dart';
import 'auth_service.dart';

class QuizAttemptService {
  final GraphQLClient _client =
      AuthService().client;
  final secureStorage = const FlutterSecureStorage();

  Future<Context?> _getHeadersContext() async {
    final String? token = await secureStorage.read(
      key: "jwt",
    );

    if (token != null && token.isNotEmpty) {
      return Context.fromList([
        HttpLinkHeaders(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      ]);
    }
    return null;
  }

  Future<List<QuizAttempt>> getQuizAttempts({required String userId}) async {
    final String query = """
      query GetQuizAttempts(\$userId: ID!) {
        quizAttempts(userId: \$userId) {
          id
          quizId
          userId
          score
          createdAt
        }
      }
    """;

    final QueryOptions options = QueryOptions(
      document: gql(query),
      variables: {'userId': userId},
      fetchPolicy: FetchPolicy.networkOnly,
      context: await _getHeadersContext(), //token!!!
    );

    final QueryResult result = await _client.query(options);

    if (result.hasException) {
      print(result.exception.toString());
      throw Exception('Failed to load quiz attempts');
    }

    final List<dynamic> quizAttemptsJson = result.data?['quizAttempts'] ?? [];
    return quizAttemptsJson.map((json) => QuizAttempt.fromJson(json)).toList();
  }

  Future<Quiz?> getQuiz(String id) async {
    final String query = """
      query GetQuiz(\$id: ID!) {
        quiz(id: \$id) {
          id
          authorId
          title
          description
          createdAt
          isPublic
        }
      }
    """;

    final QueryOptions options = QueryOptions(
      document: gql(query),
      variables: {'id': id},
      fetchPolicy: FetchPolicy.networkOnly,
      context: await _getHeadersContext(), // Add context with token
    );

    final QueryResult result = await _client.query(options);

    if (result.hasException) {
      print(result.exception.toString());
      // Handle specific errors, e.g., not found vs. network error
      throw Exception('Failed to load quiz');
    }

    if (result.data?['quiz'] == null) {
      return null; // Quiz not found
    }

    return Quiz.fromJson(result.data!['quiz']);
  }
}
