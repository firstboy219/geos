/// Backend DTOs (BAB 4/5 shapes) with defensive fromJson parsing.
///
/// These are the *wire* models returned by the API. Feature screens may map them
/// onto their richer presentation models; parsing tolerates missing fields so the
/// UI degrades gracefully.
library;

double _d(dynamic v, [double f = 0]) =>
    v is num ? v.toDouble() : (double.tryParse('${v ?? ''}') ?? f);
int _i(dynamic v, [int f = 0]) =>
    v is num ? v.toInt() : (int.tryParse('${v ?? ''}') ?? f);
bool _b(dynamic v) => v == true || v == 'true' || v == 1;
String _s(dynamic v, [String f = '']) => v == null ? f : '$v';

class CrisisDto {
  CrisisDto({
    required this.id,
    required this.title,
    this.region = '',
    this.subRegion = '',
    this.crisisType = '',
    this.status = 'active',
    this.severityLevel = 5,
    this.redlineIndex = 5,
    this.misreadScore = 5,
    this.csiAverage = 5,
    this.rfsAverage = 5,
    this.credibilityScore = 0.8,
    this.grayZone = false,
    this.shockMultiplier = 1.0,
    this.scenarios = const [],
  });

  final String id;
  final String title;
  final String region;
  final String subRegion;
  final String crisisType;
  final String status;
  final int severityLevel;
  final double redlineIndex;
  final double misreadScore;
  final double csiAverage;
  final double rfsAverage;
  final double credibilityScore;
  final bool grayZone;
  final double shockMultiplier;
  final List<ScenarioDto> scenarios;

  factory CrisisDto.fromJson(Map<String, dynamic> j) => CrisisDto(
        id: _s(j['id']),
        title: _s(j['title']),
        region: _s(j['region']),
        subRegion: _s(j['sub_region']),
        crisisType: _s(j['crisis_type']),
        status: _s(j['status'], 'active'),
        severityLevel: _i(j['severity_level'], 5),
        redlineIndex: _d(j['redline_index'], 5),
        misreadScore: _d(j['misread_score'], 5),
        csiAverage: _d(j['csi_average'], 5),
        rfsAverage: _d(j['rfs_average'], 5),
        credibilityScore: _d(j['credibility_score'], 0.8),
        grayZone: _b(j['gray_zone']),
        shockMultiplier: _d(j['shock_multiplier'], 1.0),
        scenarios: ((j['scenarios'] ?? j['current_scenarios']) as List? ?? [])
            .map((e) => ScenarioDto.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

class ScenarioDto {
  ScenarioDto({
    required this.id,
    required this.name,
    this.probability = 0,
    this.rung = 1,
    this.vectorEscalation = '',
    this.narrativeText = '',
    this.confidenceScore = 0,
  });

  final String id;
  final String name;
  final double probability; // 0..1
  final int rung;
  final String vectorEscalation;
  final String narrativeText;
  final double confidenceScore;

  factory ScenarioDto.fromJson(Map<String, dynamic> j) => ScenarioDto(
        id: _s(j['id']),
        name: _s(j['name']),
        probability: _d(j['probability']),
        rung: _i(j['rung'], 1),
        vectorEscalation: _s(j['vector_escalation']),
        narrativeText: _s(j['narrative_text']),
        confidenceScore: _d(j['confidence_score']),
      );
}

class AlertDto {
  AlertDto({
    required this.id,
    this.type = '',
    this.severity = 'info',
    this.title = '',
    this.body = '',
    this.isRead = false,
    this.createdAt,
  });

  final String id;
  final String type;
  final String severity;
  final String title;
  final String body;
  final bool isRead;
  final DateTime? createdAt;

  factory AlertDto.fromJson(Map<String, dynamic> j) => AlertDto(
        id: _s(j['id']),
        type: _s(j['type']),
        severity: _s(j['severity'], 'info'),
        title: _s(j['title']),
        body: _s(j['body']),
        isRead: _b(j['is_read']),
        createdAt: DateTime.tryParse(_s(j['created_at'])),
      );
}

class PortfolioAssetDto {
  PortfolioAssetDto({
    required this.id,
    this.assetType = 'stock',
    this.assetName = '',
    this.ticker = '',
    this.quantity = 0,
    this.purchasePrice = 0,
    this.currentPrice = 0,
    this.currency = 'IDR',
  });

  final String id;
  final String assetType;
  final String assetName;
  final String ticker;
  final double quantity;
  final double purchasePrice;
  final double currentPrice;
  final String currency;

  double get value => quantity * (currentPrice > 0 ? currentPrice : purchasePrice);

  factory PortfolioAssetDto.fromJson(Map<String, dynamic> j) => PortfolioAssetDto(
        id: _s(j['id']),
        assetType: _s(j['asset_type'], 'stock'),
        assetName: _s(j['asset_name']),
        ticker: _s(j['ticker']),
        quantity: _d(j['quantity']),
        purchasePrice: _d(j['purchase_price']),
        currentPrice: _d(j['current_price']),
        currency: _s(j['currency'], 'IDR'),
      );

  Map<String, dynamic> toCreateJson() => {
        'asset_type': assetType,
        'asset_name': assetName,
        'ticker': ticker,
        'quantity': quantity,
        'purchase_price': purchasePrice,
        'currency': currency,
      };
}

class PasarAssetDto {
  PasarAssetDto({
    required this.symbol,
    this.name = '',
    this.category = '',
    this.price = 0,
    this.changePercent = 0,
    this.geoSignalType = '',
    this.geoSignalText = '',
    this.geoSignalDetail = '',
  });

  final String symbol;
  final String name;
  final String category;
  final double price;
  final double changePercent;
  final String geoSignalType;
  final String geoSignalText;
  final String geoSignalDetail;

  factory PasarAssetDto.fromJson(Map<String, dynamic> j) => PasarAssetDto(
        symbol: _s(j['symbol']),
        name: _s(j['name']),
        category: _s(j['category']),
        price: _d(j['price']),
        changePercent: _d(j['change_percent']),
        geoSignalType: _s(j['geo_signal_type']),
        geoSignalText: _s(j['geo_signal_text']),
        geoSignalDetail: _s(j['geo_signal_detail']),
      );
}
