import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:quiz_app/presentation/screens/attempts_screen.dart';
import 'package:quiz_app/presentation/screens/profile_screen.dart';
import 'package:quiz_app/presentation/screens/quizzes_screen.dart';
import 'presentation/screens/login_screen.dart';
import 'data/services/auth_service.dart';
import 'package:provider/provider.dart';
import 'package:quiz_app/data/lib/providers/user_provider.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // AuthService().initClient("http://192.168.0.103:4000");
  AuthService().initClient("https://apiquiz.azalupka.cc");

  runApp(
    MultiProvider(
      providers: [ChangeNotifierProvider(create: (_) => UserProvider())],
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

  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).user;
    final List<dynamic> screens = [
      QuizzesScreen(),
      AttemptsScreen(),
      ProfileScreen(),
    ];

    return MaterialApp(
      title: 'quiz.azalupka.cc',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      localizationsDelegates: [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: AppLocalizations.supportedLocales,
      home:
          user == null
              ? Builder(
                builder: (context) {
                  return Scaffold(
                    body: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Image(
                          image: AssetImage('assets/logo.png'),
                          width: 200,
                        ),
                        const SizedBox(height: 64),
                        Center(
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => LoginScreen(),
                                ),
                              );
                            },
                            child: Text(AppLocalizations.of(context)?.login ?? ''),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              )
              : Builder(
                builder: (context) {
                  return Scaffold(
                    body: screens[_selectedIndex],
                    bottomNavigationBar: BottomNavigationBar(
                      currentIndex: _selectedIndex,
                      onTap: (index) {
                        setState(() {
                          _selectedIndex = index;
                        });
                      },
                      items: [
                        BottomNavigationBarItem(
                          icon: Icon(Icons.quiz),
                          label: AppLocalizations.of(context)?.navQuizzes ?? '',
                        ),
                        BottomNavigationBarItem(
                          icon: Icon(Icons.play_arrow_rounded),
                          label:
                              AppLocalizations.of(context)?.navAttempts ?? '',
                        ),
                        BottomNavigationBarItem(
                          icon: Icon(Icons.person),
                          label: AppLocalizations.of(context)?.navProfile ?? '',
                        ),
                      ],
                    ),
                  );
                },
              ),
    );
  }
}
