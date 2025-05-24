import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:quiz_app/data/services/user_service.dart';
import '../lib/models/quiz_model.dart';
import 'auth_service.dart';

class QuizService {
  final UserService userService = UserService();
  final GraphQLClient _client =
      AuthService().client; // Get client from AuthService
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

  Future<List<Quiz>> getQuizzes({String? authorId}) async {
    final String query = """
      query GetQuizzes(\$authorId: ID) {
        quizzes(authorId: \$authorId) {
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
      variables: {'authorId': authorId},
      fetchPolicy: FetchPolicy.networkOnly, // Or cache policies as needed
      context: await _getHeadersContext(), // Add context with token
    );

    final QueryResult result = await _client.query(options);

    if (result.hasException) {
      print(result.exception.toString());
      throw Exception('Failed to load quizzes');
    }

    final List<dynamic> quizzesJson = result.data?['quizzes'] ?? [];
    for (var quizJson in quizzesJson) {
      quizJson["author"] = await userService.getUser(id: quizJson["authorId"]);
    }
    return quizzesJson.map((json) => Quiz.fromJson(json)).toList();
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
