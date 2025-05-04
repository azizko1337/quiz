import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../data/services/auth_service.dart';
import '../../data/lib/getUser.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final LocalAuthentication auth = LocalAuthentication();
  final secureStorage = FlutterSecureStorage();

  bool _hasJwt = false;
  dynamic user = null;

  @override
  void initState() {
    super.initState();
    _checkForJwt();
  }

  Future<void> _checkForJwt() async {
    final token = await secureStorage.read(key: 'jwt');
    setState(() async {
      _hasJwt = token != null && token.isNotEmpty;
      user = await getUser();
    });
  }

  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  Future<void> _authenticateBiometric() async {
    if (await auth.canCheckBiometrics && await auth.isDeviceSupported()) {
      final bool didAuthenticate = await auth.authenticate(
        localizedReason: 'Zaloguj się odciskiem palca',
        options: const AuthenticationOptions(biometricOnly: true),
      );

      if (didAuthenticate) {
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Sukces'),
            content: const Text('Hello World'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    }
  }

  void _loginWithEmail() async {
    final email = emailController.text;
    final password = passwordController.text;

    if (email.isNotEmpty && password.isNotEmpty) {
      try {
        final user = await AuthService().login(email, password, context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pomyślnie zalogowano!')),
        );
        Navigator.pop(context);
      } catch (e) {
        passwordController.text = "";
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Nieprawidłowe hasło!')),
        );
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Uzupełnij wszystkie pola')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Logowanie ${user?['username']}")),
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
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _loginWithEmail,
              child: const Text('Zaloguj się'),
            ),
            const SizedBox(height: 16),
            if(_hasJwt) ElevatedButton(
              onPressed: _authenticateBiometric,
              child: const Text('Zaloguj się odciskiem palca'),
            ),
          ],
        ),
      ),
    );
  }
}
