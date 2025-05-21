import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import '../lib/models/quiz_attempt_model.dart';
import '../lib/models/quiz_model.dart';
import 'auth_service.dart';

class QuizAttemptService {
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

  Future<QuizAttempt?> getQuizAttempt(String id) async {
    final String query = """
      query GetQuizAttempt(\$id: ID!) {
        quizAttempt(id: \$id) {
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
      variables: {'id': id},
      fetchPolicy: FetchPolicy.networkOnly,
      context: await _getHeadersContext(), // Add context with token
    );

    final QueryResult result = await _client.query(options);

    if (result.hasException) {
      print(result.exception.toString());
      throw Exception('Failed to load quiz attempt');
    }

    if (result.data?['quizAttempt'] == null) {
      return null;
    }

    return QuizAttempt.fromJson(result.data!['quizAttempt']);
  }

  Future<QuizAttempt> createQuizAttempt({
    required String quizId,
    required String userId,
  }) async {
    final String mutation = """
    mutation CreateQuizAttempt(\$quizId: ID!, \$userId: ID!) {
      createQuizAttempt(quizId: \$quizId, userId: \$userId) {
        id
        quizId
        userId
        score
        createdAt
      }
    }
  """;

    final MutationOptions options = MutationOptions(
      document: gql(mutation),
      variables: {'quizId': quizId, 'userId': userId},
      context: await _getHeadersContext(),
    );

    final QueryResult result = await _client.mutate(options);

    if (result.hasException) {
      print(result.exception.toString());
      throw Exception('Failed to create quiz attempt');
    }

    final data = result.data?['createQuizAttempt'];
    if (data == null) {
      throw Exception('No data returned for createQuizAttempt');
    }

    return QuizAttempt.fromJson(data);
  }
}
