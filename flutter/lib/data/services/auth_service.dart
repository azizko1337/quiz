import 'package:flutter/cupertino.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import '../lib/providers/user_provider.dart';
import '../lib/models/user_model.dart';
import 'package:provider/provider.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final secureStorage = const FlutterSecureStorage();

  late GraphQLClient _client;

  void initClient(String graphqlEndpoint) {
    final httpLink = HttpLink(graphqlEndpoint);

    _client = GraphQLClient(
      link: httpLink,
      cache: GraphQLCache(),
    );
  }

  Future<Map<String, dynamic>?> login(String email, String password, BuildContext context) async {
    const String loginMutation = r'''
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          id
          username
          email
          role
          createdAt
        }
      }
    ''';

    final MutationOptions options = MutationOptions(
      document: gql(loginMutation),
      variables: {
        'email': email,
        'password': password,
      },
    );

    final QueryResult result = await _client.mutate(options);

    if (result.hasException) {
      throw Exception(result.exception.toString());
    }

    final userData = result.data?['login'];

    // Jeżeli token JWT znajduje się w nagłówku odpowiedzi (np. custom header):
    final token = result.context.entry<HttpLinkResponseContext>()?.headers?['authorization'];

    if (token != null) {
      await secureStorage.write(key: 'jwt', value: token);
    }
    await secureStorage.write(key: 'user', value: userData.toString());

    final userProvider = Provider.of<UserProvider>(context, listen: false);
    userProvider.setUser(UserModel.fromMap(userData));

    return userData;
  }

  Future<void> logout() async {
    await secureStorage.delete(key: 'jwt');
  }

  Future<String?> getJwt() async {
    return await secureStorage.read(key: 'jwt');
  }
}
