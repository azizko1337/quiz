import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import '../../data/lib/models/user_model.dart';
import '../../data/lib/providers/user_provider.dart';
import '../../data/services/auth_service.dart';
import '../../data/lib/getUser.dart';
import '../widgets/question_card.dart';

class AttemptCard extends StatefulWidget {
  const AttemptCard({super.key});

  @override
  State<AttemptCard> createState() => _AttemptCardState();
}

class _AttemptCardState extends State<AttemptCard> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {

    return Text("podejściem");
  }
}
