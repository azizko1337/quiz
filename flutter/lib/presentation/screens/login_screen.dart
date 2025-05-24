import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import '../../data/lib/models/user_model.dart';
import '../../data/lib/providers/user_provider.dart';
import '../../data/services/auth_service.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
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
      localizedReason: AppLocalizations.of(context)!.loginViaBiometric,
      options: const AuthenticationOptions(biometricOnly: true),
    );

    if (didAuthenticate) {
      final userData = await secureStorage.read(key: 'user');
      final userProvider = Provider.of<UserProvider>(context, listen: false);
      userProvider.setUser(UserModel.fromMap(jsonDecode(userData!)));

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppLocalizations.of(context)!.successfulLogin)),
      );
      Navigator.pop(context);
    }
  }

  void _loginWithEmail() async {
    final email = emailController.text;
    final password = passwordController.text;

    if (email.isNotEmpty && password.isNotEmpty) {
      try {
        final user = await AuthService().login(email, password, context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(AppLocalizations.of(context)!.successfulLogin)),
        );
        Navigator.pop(context);
      } catch (e) {
        passwordController.text = "";
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(AppLocalizations.of(context)!.wrongPassword)),
        );
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
         SnackBar(content: Text(AppLocalizations.of(context)!.fillAllInputs)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(AppLocalizations.of(context)!.logging)),
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
              decoration: InputDecoration(labelText: AppLocalizations.of(context)!.password),
              obscureText: true,
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _loginWithEmail,
              child: Text(AppLocalizations.of(context)!.login),
            ),
            const SizedBox(height: 16),
            if(_hasJwt && _canBiometric) ElevatedButton(
              onPressed: _authenticateBiometric,
              child: Text('${AppLocalizations.of(context)!.loginViaBiometricAs} ${_userFromStorage?.username}'),
            ),
          ],
        ),
      ),
    );
  }
}
