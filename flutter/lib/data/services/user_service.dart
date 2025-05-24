import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:quiz_app/data/lib/models/user_model.dart'; // Zakładam, że masz model User
import 'auth_service.dart';

class UserService {
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

  Future<UserModel> getUser({required String id}) async {
    final String query = """
      query GetUser(\$id: ID!) {
        user(id: \$id) {
          id
          username
          email
          role
          createdAt
        }
      }
    """;

    final QueryOptions options = QueryOptions(
      document: gql(query),
      variables: {'id': id},
      fetchPolicy: FetchPolicy.networkOnly,
      context: await _getHeadersContext(),
    );

    final QueryResult result = await _client.query(options);

    if (result.hasException) {
      print(result.exception.toString());
      throw Exception('Failed to load user');
    }

    final dynamic userJson = result.data?['user'];
    if (userJson == null) {
      throw Exception('User not found');
    }

    return UserModel.fromMap(userJson);
  }
}
