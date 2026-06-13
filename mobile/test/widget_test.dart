import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:geoscan/core/widgets/geo_logo.dart';
import 'package:geoscan/core/widgets/risk_pill.dart';
import 'package:geoscan/core/theme/app_theme.dart';

void main() {
  testWidgets('GeoLogo renders GEO and SCAN', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark,
        home: const Scaffold(body: Center(child: GeoLogo())),
      ),
    );
    // RichText combines the spans into a single text run.
    expect(find.text('GEOSCAN', findRichText: true), findsOneWidget);
  });

  testWidgets('RiskPill shows the level label', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark,
        home: const Scaffold(body: RiskPill(level: RiskLevel.high)),
      ),
    );
    expect(find.text('High'), findsOneWidget);
  });

  test('RiskPill.levelFrom maps EN/ID strings', () {
    expect(RiskPill.levelFrom('Tinggi'), RiskLevel.high);
    expect(RiskPill.levelFrom('medium'), RiskLevel.medium);
    expect(RiskPill.levelFrom('Rendah'), RiskLevel.low);
  });
}
