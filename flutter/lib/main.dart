import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'presentation/screens/login_screen.dart';
import 'data/services/auth_service.dart';
import 'package:provider/provider.dart';
import 'data/lib/providers/user_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  AuthService().initClient("http://192.168.0.103:4000");

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => UserProvider()),
      ],
      child: MyApp(),
    ),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final secureStorage = FlutterSecureStorage();

  bool _hasJwt = false;
  @override
  void initState() {
    super.initState();
    _checkForJwt();
  }
  Future<void> _checkForJwt() async {
    final token = await secureStorage.read(key: 'jwt');
    setState(() {
      _hasJwt = token != null && token.isNotEmpty;
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).user;

    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: Builder(
        builder: (context) {
          return Scaffold(
            body: Center(
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => LoginScreen()),
                  );
                },
                child: Text('Zaloguj się ${user?.username}'),
              ),
            ),
          );
        },
      ),
    );
  }
}