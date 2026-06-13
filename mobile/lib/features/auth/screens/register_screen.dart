import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/geo_logo.dart';
import '../providers/auth_provider.dart';

/// Register screen (Prompt 1-B): full name, email, password, confirm password
/// with validation (email format, password >= 8, password match), DAFTAR button.
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _obscure = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final t = AppStrings.of(context);
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthProvider>();
    final ok = await auth.register(
      _nameController.text,
      _emailController.text,
      _passwordController.text,
    );
    if (!mounted) return;

    if (ok) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(
            content: Text(
              'Account created. Please sign in.',
              style: AppTextStyles.body,
            ),
            backgroundColor: AppColors.successDark,
            behavior: SnackBarBehavior.floating,
          ),
        );
      context.go('/login');
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
      appBar: AppBar(backgroundColor: AppColors.background, elevation: 0),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.xxl,
              vertical: AppSpacing.lg,
            ),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Center(child: GeoLogo(scale: 1.8)),
                  const SizedBox(height: AppSpacing.xxxl),
                  TextFormField(
                    controller: _nameController,
                    textInputAction: TextInputAction.next,
                    enabled: !isLoading,
                    style: AppTextStyles.body,
                    decoration: InputDecoration(
                      hintText: t.t('full_name'),
                      prefixIcon: const Icon(Icons.person_outline),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty)
                        ? t.t('err_name_required')
                        : null,
                  ),
                  const SizedBox(height: AppSpacing.lg),
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
                    textInputAction: TextInputAction.next,
                    enabled: !isLoading,
                    style: AppTextStyles.body,
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
                      if (v.length < 8) return t.t('err_password_short');
                      return null;
                    },
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  TextFormField(
                    controller: _confirmController,
                    obscureText: _obscureConfirm,
                    textInputAction: TextInputAction.done,
                    enabled: !isLoading,
                    style: AppTextStyles.body,
                    onFieldSubmitted: (_) => _submit(),
                    decoration: InputDecoration(
                      hintText: t.t('confirm_password'),
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscureConfirm
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                        ),
                        onPressed: () =>
                            setState(() => _obscureConfirm = !_obscureConfirm),
                      ),
                    ),
                    validator: (v) {
                      if (v == null || v.isEmpty) {
                        return t.t('err_password_required');
                      }
                      if (v != _passwordController.text) {
                        return t.t('err_password_mismatch');
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
                        : Text(t.t('register_button')),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  TextButton(
                    onPressed: isLoading ? null : () => context.go('/login'),
                    child: Text(t.t('have_account')),
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
