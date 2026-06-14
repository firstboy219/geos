import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/geo_logo.dart';
import '../providers/auth_provider.dart';

/// Login screen (Prompt 1-B): GEOSCAN logo, tagline, email + password,
/// MASUK button (loading → spinner), red SnackBar on error.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final t = AppStrings.of(context);
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthProvider>();
    final ok = await auth.login(
      _emailController.text,
      _passwordController.text,
    );
    if (!mounted) return;

    if (ok) {
      context.go('/home');
    } else {
      _showError(auth.error ?? t.t('err_generic'));
      auth.clearError();
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message, style: AppTextStyles.body),
          backgroundColor: AppColors.dangerDark,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadii.inner),
            side: const BorderSide(color: AppColors.dangerBorder),
          ),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final t = AppStrings.of(context);
    final isLoading = context.select<AuthProvider, bool>((a) => a.isLoading);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.xxl,
              vertical: AppSpacing.xxxl,
            ),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Center(child: GeoLogo(scale: 2.4)),
                  const SizedBox(height: AppSpacing.md),
                  Center(
                    child: Text(
                      t.t('tagline'),
                      style: AppTextStyles.bodySm,
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xxxl),
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    enabled: !isLoading,
                    style: AppTextStyles.body,
                    decoration: InputDecoration(
                      hintText: t.t('email'),
                      prefixIcon: const Icon(Icons.email_outlined),
                    ),
                    validator: (v) => _validateEmail(v, t),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscure,
                    textInputAction: TextInputAction.done,
                    enabled: !isLoading,
                    style: AppTextStyles.body,
                    onFieldSubmitted: (_) => _submit(),
                    decoration: InputDecoration(
                      hintText: t.t('password'),
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscure
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                        ),
                        onPressed: () => setState(() => _obscure = !_obscure),
                      ),
                    ),
                    validator: (v) {
                      if (v == null || v.isEmpty) {
                        return t.t('err_password_required');
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  ElevatedButton(
                    onPressed: isLoading ? null : _submit,
                    child: isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.textPrimary,
                            ),
                          )
                        : Text(t.t('login_button')),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  TextButton(
                    onPressed: isLoading ? null : () => context.go('/register'),
                    child: Text(t.t('no_account')),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  String? _validateEmail(String? v, AppStrings t) {
    if (v == null || v.trim().isEmpty) return t.t('err_email_required');
    final re = RegExp(r'^[\w.\-+]+@([\w-]+\.)+[\w-]{2,}$');
    if (!re.hasMatch(v.trim())) return t.t('err_email_invalid');
    return null;
  }
}
