# Geoscan — ProGuard/R8 rules for release builds.

# Flutter engine
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Firebase / FCM
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# flutter_local_notifications
-keep class com.dexterous.** { *; }

# Keep annotations & generic signatures
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes SourceFile,LineNumberTable

# Suppress common reflection warnings
-dontwarn javax.annotation.**
