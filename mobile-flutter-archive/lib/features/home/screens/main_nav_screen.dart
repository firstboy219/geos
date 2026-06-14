import 'package:flutter/material.dart';

import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../account/screens/account_screen.dart';
import '../../pasar/screens/pasar_screen.dart';
import '../../portfolio/screens/portfolio_screen.dart';
import '../../vectors/screens/vector_list_screen.dart';
import 'home_screen.dart';

/// Root authenticated shell (route `/home`).
///
/// Hosts the five feature tabs via an [IndexedStack] (state preserved across
/// tab switches) with a fixed [BottomNavigationBar] (BAB 7.3):
/// Analysis · Pasar · Vectors · Portfolio · Profile.
class MainNavScreen extends StatefulWidget {
  const MainNavScreen({super.key});

  @override
  State<MainNavScreen> createState() => _MainNavScreenState();
}

class _MainNavScreenState extends State<MainNavScreen> {
  int _index = 0;

  static const List<Widget> _tabs = [
    HomeScreen(),
    PasarScreen(),
    VectorListScreen(),
    PortfolioScreen(),
    AccountScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final t = AppStrings.of(context);
    return Scaffold(
      backgroundColor: AppColors.background,
      body: IndexedStack(index: _index, children: _tabs),
      bottomNavigationBar: DecoratedBox(
        decoration: const BoxDecoration(
          border: Border(
            top: BorderSide(color: AppColors.border, width: 0.5),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _index,
          onTap: (i) => setState(() => _index = i),
          items: [
            BottomNavigationBarItem(
              icon: const Icon(Icons.home_outlined),
              activeIcon: const Icon(Icons.home),
              label: t.t('nav_analysis'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.bar_chart_outlined),
              activeIcon: const Icon(Icons.bar_chart),
              label: t.t('nav_pasar'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.radar_outlined),
              activeIcon: const Icon(Icons.radar),
              label: t.t('nav_vectors'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.account_balance_wallet_outlined),
              activeIcon: const Icon(Icons.account_balance_wallet),
              label: t.t('nav_portfolio'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.person_outline),
              activeIcon: const Icon(Icons.person),
              label: t.t('nav_profile'),
            ),
          ],
        ),
      ),
    );
  }
}
