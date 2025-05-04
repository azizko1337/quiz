import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

Future<Map<String, dynamic>?> getUser() async {
  final secureStorage = const FlutterSecureStorage();

  final userString = await secureStorage.read(key: 'user');
  if (userString != null) {
    return Map<String, dynamic>.from(jsonDecode(userString));
  }
  return null;
}