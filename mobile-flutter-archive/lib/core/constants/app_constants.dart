import 'package:flutter/widgets.dart';

/// Layout / motion constants from BAB 7.3 (Component Rules).
///
/// Spacing base unit is 4dp — only use multiples of 4.
abstract final class AppSpacing {
  AppSpacing._();

  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double xxxl = 32;
}

/// Corner radii from BAB 7.3.
abstract final class AppRadii {
  AppRadii._();

  /// Main card radius.
  static const double card = 14;

  /// Small card radius.
  static const double cardSm = 12;

  /// Inner box radius.
  static const double inner = 10;

  /// Pill chip radius.
  static const double pill = 20;

  /// Square chip radius.
  static const double chip = 8;
}

/// Border widths from BAB 7.3.
abstract final class AppBorders {
  AppBorders._();

  /// Default border width for all borders.
  static const double hairline = 0.5;

  /// Emphasis card border width.
  static const double emphasis = 1.5;
}

/// Standard padding values derived from BAB 7.3.
abstract final class AppPadding {
  AppPadding._();

  static const EdgeInsets card = EdgeInsets.all(14);
  static const EdgeInsets cardSm = EdgeInsets.all(12);
  static const EdgeInsets inner = EdgeInsets.all(10);
  static const EdgeInsets screen = EdgeInsets.all(16);
}

/// Animation durations used across the app.
abstract final class AppDurations {
  AppDurations._();

  static const Duration fast = Duration(milliseconds: 150);
  static const Duration normal = Duration(milliseconds: 250);
  static const Duration slow = Duration(milliseconds: 400);
  static const Duration shimmer = Duration(milliseconds: 1200);
}
