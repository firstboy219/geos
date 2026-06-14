/// Authenticated user, as returned by `GET /users/me` and the login response
/// (BAB 5 — `{id, email, full_name, tier, portfolio_count, unread_alerts}`).
class UserModel {
  const UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    required this.tier,
    this.portfolioCount = 0,
    this.unreadAlerts = 0,
  });

  final String id;
  final String email;
  final String fullName;

  /// One of: `free`, `pro`, `enterprise` (BAB 5.2).
  final String tier;
  final int portfolioCount;
  final int unreadAlerts;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      email: json['email'] as String? ?? '',
      fullName: json['full_name'] as String? ?? '',
      tier: json['tier'] as String? ?? 'free',
      portfolioCount: (json['portfolio_count'] as num?)?.toInt() ?? 0,
      unreadAlerts: (json['unread_alerts'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'full_name': fullName,
        'tier': tier,
        'portfolio_count': portfolioCount,
        'unread_alerts': unreadAlerts,
      };

  UserModel copyWith({
    String? id,
    String? email,
    String? fullName,
    String? tier,
    int? portfolioCount,
    int? unreadAlerts,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      tier: tier ?? this.tier,
      portfolioCount: portfolioCount ?? this.portfolioCount,
      unreadAlerts: unreadAlerts ?? this.unreadAlerts,
    );
  }
}
