import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import '../lib/models/question_model.dart';
import 'auth_service.dart';

class QuestionService {
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

  Future<List<Question>> getQuestions({required String quizId}) async {
    final String query = """
      query GetQuestions(\$quizId: ID!) {
        questions(quizId: \$quizId) {
          id
          quizId
          question
          image
          createdAt
        }
      }
    """;

    final QueryOptions options = QueryOptions(
      document: gql(query),
      variables: {'quizId': quizId},
      fetchPolicy: FetchPolicy.networkOnly,
      context: await _getHeadersContext(),
    );

    final QueryResult result = await _client.query(options);

    if (result.hasException) {
      print(result.exception.toString());
      throw Exception('Failed to load questions');
    }

    final List<dynamic> questionsJson = result.data?['questions'] ?? [];
    return questionsJson.map((json) => Question.fromJson(json)).toList();
  }
}
