import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import '../lib/models/answer_model.dart';
import 'auth_service.dart';

class AnswerService {
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

  Future<List<Answer>> getAnswers({required String questionId}) async {
    final String query = """
      query GetAnswers(\$questionId: ID!) {
        answers(questionId: \$questionId) {
          id
          questionId
          answer
          isCorrect
          image
          createdAt
        }
      }
    """;

    final QueryOptions options = QueryOptions(
      document: gql(query),
      variables: {'questionId': questionId},
      fetchPolicy: FetchPolicy.networkOnly,
      context: await _getHeadersContext(),
    );

    final QueryResult result = await _client.query(options);

    if (result.hasException) {
      print(result.exception.toString());
      throw Exception('Failed to load answers');
    }

    final List<dynamic> answersJson = result.data?['answers'] ?? [];
    return answersJson.map((json) => Answer.fromJson(json)).toList();
  }
}
