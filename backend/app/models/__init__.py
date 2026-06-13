"""Import semua model agar Alembic autogenerate & metadata melihat tabel."""
from app.models.actor import Actor
from app.models.alert import Alert
from app.models.crisis import Crisis
from app.models.crisis_actor import CrisisActor
from app.models.market_data import MarketData
from app.models.news_article import NewsArticle
from app.models.scenario import Scenario
from app.models.scenario_mutation import ScenarioMutation
from app.models.tripwire import Tripwire
from app.models.tripwire_event import TripwireEvent
from app.models.user import User
from app.models.user_portfolio import UserPortfolio

__all__ = [
    "Actor",
    "Alert",
    "Crisis",
    "CrisisActor",
    "MarketData",
    "NewsArticle",
    "Scenario",
    "ScenarioMutation",
    "Tripwire",
    "TripwireEvent",
    "User",
    "UserPortfolio",
]
