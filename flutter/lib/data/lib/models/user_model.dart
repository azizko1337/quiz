class UserModel {
  final String id;
  final String username;
  final String email;
  final String role;
  final String createdAt;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    required this.createdAt,
  });

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'],
      username: map['username'],
      email: map['email'],
      role: map['role'],
      createdAt: map['createdAt'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'role': role,
      'createdAt': createdAt,
    };
  }
}