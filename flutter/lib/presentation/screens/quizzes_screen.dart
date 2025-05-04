import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import '../../data/lib/models/user_model.dart';
import '../../data/lib/providers/user_provider.dart';
import '../../data/services/auth_service.dart';
import '../../data/lib/getUser.dart';

class QuizzesScreen extends StatefulWidget {
  const QuizzesScreen({super.key});

  @override
  State<QuizzesScreen> createState() => _QuizzesScreenState();
}

class _QuizzesScreenState extends State<QuizzesScreen> {
  final LocalAuthentication auth = LocalAuthentication();
  final secureStorage = FlutterSecureStorage();

  bool _hasJwt = false;
  UserModel? _userFromStorage;
  bool _canBiometric = false;

  @override
  void initState() {
    super.initState();
    _checkForJwt();
  }

  Future<void> _checkForJwt() async {
    final token = await secureStorage.read(key: 'jwt');
    final userFromStorage = await secureStorage.read(key: 'user') ?? '';
    final canBiometric = await auth.canCheckBiometrics && await auth.isDeviceSupported();

    setState(() {
      _hasJwt = token != null && token.isNotEmpty;
      _userFromStorage = UserModel.fromMap(jsonDecode(userFromStorage));
      _canBiometric = canBiometric;
    });
  }

  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  Future<void> _authenticateBiometric() async {
    final bool didAuthenticate = await auth.authenticate(
      localizedReason: 'Zaloguj się odciskiem palca',
      options: const AuthenticationOptions(biometricOnly: true),
    );

    if (didAuthenticate) {
      final userData = await secureStorage.read(key: 'user');
      final userProvider = Provider.of<UserProvider>(context, listen: false);
      userProvider.setUser(UserModel.fromMap(jsonDecode(userData!)));

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pomyślnie zalogowano!')),
      );
      Navigator.pop(context);
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Logowanie")),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: emailController,
              decoration: const InputDecoration(labelText: 'E-mail'),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: passwordController,
              decoration: const InputDecoration(labelText: 'Hasło'),
              obscureText: true,
            ),
            const SizedBox(height: 16),
            if(_hasJwt && _canBiometric) ElevatedButton(
              onPressed: _authenticateBiometric,
              child: Text('Zaloguj się odciskiem palca jako ${_userFromStorage?.username}'),
            ),
          ],
        ),
      ),
    );
  }
}
