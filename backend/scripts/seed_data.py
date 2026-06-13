"""Seed data Geoscan — 3 crises, scenarios, 4 actors, crisis_actors, 5 tripwires,
+ 1 demo user. Idempotent: jika sudah ada crisis, seed dilewati.

Jalankan di server:
    docker exec geoscan-backend python scripts/seed_data.py
"""
from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.actor import Actor
from app.models.alert import Alert  # noqa: F401  (ensure metadata import)
from app.models.crisis import Crisis
from app.models.crisis_actor import CrisisActor
from app.models.scenario import Scenario
from app.models.tripwire import Tripwire
from app.models.user import User

NOW = datetime.now(timezone.utc)


def _scn(name, prob, rung, esc, hyb, dur, conf):
    return Scenario(
        id=uuid.uuid4(),
        name=name,
        probability=prob,
        rung=rung,
        vector_escalation=esc,
        vector_hybrid=hyb,
        vector_duration=dur,
        confidence_score=conf,
        version=1,
        is_current=True,
    )


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        existing = (await db.execute(select(Crisis.id).limit(1))).first()
        if existing:
            print("[seed] Data sudah ada — dilewati (idempotent).")
            return

        # ── Demo user ──
        db.add(
            User(
                id=uuid.uuid4(),
                email="demo@geoscan.app",
                full_name="Demo Investor",
                hashed_password=hash_password("password123"),
                tier="pro",
                is_active=True,
                is_verified=True,
            )
        )

        # ── Actors (Layer K/O scores) ──
        xi = Actor(
            id=uuid.uuid4(), full_name="Xi Jinping", title="President", country="China",
            organization="CPC", decision_style="ideological", rcs_score=85.0,
            risk_appetite="high", csi_score=4.0, rfs_score=6.0,
            bio_summary="Paramount leader; property crisis + youth unemployment raise domestic pressure.",
        )
        prabowo = Actor(
            id=uuid.uuid4(), full_name="Prabowo Subianto", title="President", country="Indonesia",
            organization="Government of Indonesia", decision_style="pragmatic", rcs_score=72.0,
            risk_appetite="medium", csi_score=4.0, rfs_score=5.0,
            bio_summary="'Friends to all'; pragmatic, open to economic incentives.",
        )
        marcos = Actor(
            id=uuid.uuid4(), full_name="Ferdinand Marcos Jr.", title="President", country="Philippines",
            organization="Government of the Philippines", decision_style="opportunistic", rcs_score=60.0,
            risk_appetite="medium", csi_score=5.0, rfs_score=5.0,
            bio_summary="Leans US-aligned in SCS disputes; assertive posture vs CCG.",
        )
        lai = Actor(
            id=uuid.uuid4(), full_name="Lai Ching-te", title="President", country="Taiwan",
            organization="Government of Taiwan", decision_style="ideological", rcs_score=78.0,
            risk_appetite="medium", csi_score=6.0, rfs_score=4.0,
            bio_summary="DPP leader; status-quo defense amid rising PLA TDI.",
        )
        db.add_all([xi, prabowo, marcos, lai])

        # ── Crisis 1: Natuna ──
        natuna = Crisis(
            id=uuid.uuid4(), title="Natuna — Indonesia",
            description="Chinese coast guard vessels repeatedly enter Indonesia's Natuna EEZ; "
            "China asserts the rejected nine-dash line while Indonesia holds a quiet diplomatic line.",
            region="Indo-Pacific", sub_region="Natuna EEZ", crisis_type="hybrid",
            severity_level=5, status="active",
            redline_index=3.0, misread_score=6.0, csi_average=4.0, rfs_average=5.5,
            credibility_score=0.87, gray_zone=True, shock_multiplier=1.12,
            tdi_alert=True, nuclear_adjacent=False, started_at=NOW,
        )
        natuna.scenarios = [
            _scn("Tidak ada eskalasi", 0.43, 2, "bilateral", "economic", "limbo", 0.82),
            _scn("Indonesia terpaksa pilih satu blok", 0.29, 3, "regional", "economic", "attrition", 0.71),
            _scn("Insiden terbatas di laut", 0.15, 4, "bilateral", "kinetic", "quick", 0.63),
            _scn("Indonesia jadi mediator", 0.09, 1, "regional", "economic", "attrition", 0.55),
            _scn("Tekanan ekonomi dari luar (Coercion)", 0.04, 3, "global", "economic", "attrition", 0.58),
        ]

        # ── Crisis 2: South China Sea ──
        scs = Crisis(
            id=uuid.uuid4(), title="Laut China Selatan (LCS)",
            description="Multi-actor friction across the South China Sea: CCG vs Philippine resupply "
            "missions, overlapping claims, and freedom-of-navigation operations.",
            region="Indo-Pacific", sub_region="South China Sea", crisis_type="military",
            severity_level=7, status="active",
            redline_index=8.0, misread_score=7.0, csi_average=5.0, rfs_average=5.0,
            credibility_score=0.82, gray_zone=True, shock_multiplier=1.12,
            tdi_alert=True, nuclear_adjacent=False, started_at=NOW,
        )
        scs.scenarios = [
            _scn("Frozen conflict berlanjut", 0.42, 3, "regional", "hybrid", "limbo", 0.74),
            _scn("Insiden CCG vs Filipina", 0.27, 4, "regional", "kinetic", "quick", 0.66),
            _scn("De-eskalasi via ASEAN COC", 0.18, 2, "regional", "economic", "attrition", 0.58),
            _scn("Eskalasi melibatkan AS", 0.13, 5, "global", "kinetic", "proxy", 0.61),
        ]

        # ── Crisis 3: Taiwan Strait ──
        taiwan = Crisis(
            id=uuid.uuid4(), title="Selat Taiwan",
            description="Cross-strait tension with rising PLA capability (TDI up). Semiconductor "
            "supply-chain exposure makes markets highly sensitive.",
            region="Indo-Pacific", sub_region="Taiwan Strait", crisis_type="military",
            severity_level=9, status="active",
            redline_index=10.0, misread_score=6.0, csi_average=5.0, rfs_average=4.5,
            credibility_score=0.80, gray_zone=True, shock_multiplier=1.12,
            tdi_alert=True, nuclear_adjacent=True, started_at=NOW,
        )
        taiwan.scenarios = [
            _scn("Gray zone berkepanjangan", 0.40, 3, "regional", "hybrid", "limbo", 0.70),
            _scn("Blokade / quarantine terbatas", 0.28, 4, "regional", "hybrid", "attrition", 0.64),
            _scn("Status quo diplomatik", 0.20, 2, "bilateral", "economic", "attrition", 0.60),
            _scn("Eskalasi kinetik besar", 0.12, 5, "global", "kinetic", "proxy", 0.55),
        ]

        db.add_all([natuna, scs, taiwan])
        await db.flush()  # assign FKs

        # ── crisis_actors links ──
        db.add_all([
            CrisisActor(crisis_id=natuna.id, actor_id=xi.id, role="primary"),
            CrisisActor(crisis_id=natuna.id, actor_id=prabowo.id, role="primary"),
            CrisisActor(crisis_id=scs.id, actor_id=xi.id, role="primary"),
            CrisisActor(crisis_id=scs.id, actor_id=marcos.id, role="primary"),
            CrisisActor(crisis_id=taiwan.id, actor_id=xi.id, role="primary"),
            CrisisActor(crisis_id=taiwan.id, actor_id=lai.id, role="primary"),
        ])

        # ── Tripwires (5) ──
        db.add_all([
            Tripwire(
                id=uuid.uuid4(), name="CCG masuk <12nm Natuna", category="military",
                description="Chinese coast guard enters Indonesia's territorial waters (<12nm) near Natuna.",
                keywords=["coast guard", "Natuna", "12 nautical", "territorial waters", "CCG"],
                threshold=0.78, crisis_id=natuna.id, severity="critical",
                escalation_impact={"incident_scenario": 0.08}, cooldown_minutes=30,
            ),
            Tripwire(
                id=uuid.uuid4(), name="Harga nikel < $10k/ton", category="economic",
                description="Nickel price drops below $10k, raising Indonesia fiscal/RFS pressure.",
                keywords=["nickel", "LME", "price", "$10,000", "nickel price"],
                threshold=0.75, crisis_id=natuna.id, severity="high",
                escalation_impact={"forced_alignment": 0.05}, cooldown_minutes=60,
            ),
            Tripwire(
                id=uuid.uuid4(), name="Insiden resupply Second Thomas Shoal", category="military",
                description="Collision or water-cannon incident during Philippine resupply mission.",
                keywords=["Second Thomas Shoal", "resupply", "water cannon", "collision", "Ayungin"],
                threshold=0.80, crisis_id=scs.id, severity="critical",
                escalation_impact={"ccg_ph_incident": 0.10}, cooldown_minutes=30,
            ),
            Tripwire(
                id=uuid.uuid4(), name="PLA large-scale drill around Taiwan", category="military",
                description="PLA announces or conducts a large-scale encirclement drill.",
                keywords=["PLA", "drill", "Taiwan", "encirclement", "Joint Sword", "exercise"],
                threshold=0.80, crisis_id=taiwan.id, severity="critical",
                escalation_impact={"blockade_scenario": 0.09}, cooldown_minutes=30,
            ),
            Tripwire(
                id=uuid.uuid4(), name="Nuclear rhetoric / alert change", category="nuclear",
                description="Change in nuclear doctrine, alert level, or explicit nuclear rhetoric.",
                keywords=["nuclear", "deterrence", "alert level", "warhead", "doctrine"],
                threshold=0.85, crisis_id=taiwan.id, severity="critical",
                escalation_impact={"major_escalation": 0.06}, cooldown_minutes=120,
            ),
        ])

        await db.commit()
        print("[seed] OK — 3 crises, 18 scenarios, 4 actors, 6 links, 5 tripwires, 1 demo user.")
        print("[seed] Demo login: demo@geoscan.app / password123")


if __name__ == "__main__":
    asyncio.run(seed())
