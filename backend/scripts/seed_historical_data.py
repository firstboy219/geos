"""Seed 50 historical events into Pinecone (Gemini embeddings).

Run on the server (after GEMINI_API_KEY + PINECONE_* are set in /opt/geoscan/.env
and the Pinecone index 'geoscan-historical' exists with dimension 1536, metric cosine):

    docker exec geoscan-backend python scripts/seed_historical_data.py
    docker exec geoscan-backend python scripts/seed_historical_data.py --verify
"""
from __future__ import annotations

import asyncio
import sys

from app.services.ai.historical_matcher import find_similar_events, seed_historical_events


def _ev(id, title, year, region, ctype, desc, outcome, days, nuke=False, sanc=False):
    return {
        "id": id, "title": title, "year": year, "region": region,
        "crisis_type": ctype, "description": desc, "outcome": outcome,
        "resolution_days": days, "nuclear_involved": nuke, "economic_sanctions": sanc,
    }


EVENTS = [
    # ── Cold War 1947–1991 (15) ──
    _ev("cw_berlin_blockade_1948", "Berlin Blockade & Airlift", 1948, "Europe", "military",
        "USSR blockaded West Berlin; Western powers sustained the city by airlift.",
        "De-escalation; blockade lifted after 11 months without direct combat.", 330),
    _ev("cw_korea_1950", "Korean War", 1950, "East Asia", "military",
        "North Korea invaded the South; UN/US and China intervened.",
        "Armistice, frozen conflict at the 38th parallel.", 1127),
    _ev("cw_suez_1956", "Suez Crisis", 1956, "Middle East", "military",
        "UK/France/Israel intervened over the Suez Canal nationalization.",
        "Withdrawal under US/USSR pressure; hegemonic shift.", 90, sanc=True),
    _ev("cw_cuban_missile_1962", "Cuban Missile Crisis", 1962, "Caribbean", "military",
        "Soviet nuclear missiles in Cuba triggered a US naval quarantine.",
        "Negotiated withdrawal; closest approach to nuclear war.", 13, nuke=True),
    _ev("cw_vietnam_1965", "Vietnam War escalation", 1965, "Southeast Asia", "military",
        "US escalated involvement against North Vietnam and the Viet Cong.",
        "US withdrawal 1973; North victory 1975.", 3650),
    _ev("cw_prague_1968", "Prague Spring / Warsaw Pact invasion", 1968, "Europe", "military",
        "Warsaw Pact invaded Czechoslovakia to halt liberalization.",
        "Reassertion of Soviet control; no wider war.", 1),
    _ev("cw_yomkippur_1973", "Yom Kippur War & oil embargo", 1973, "Middle East", "hybrid",
        "Arab states attacked Israel; OPEC oil embargo on the West followed.",
        "Ceasefire; 1970s energy/economic shock.", 19, sanc=True),
    _ev("cw_angola_1975", "Angolan Civil War (proxy)", 1975, "Africa", "military",
        "Cold War proxy war with Cuban and South African involvement.",
        "Prolonged proxy attrition.", 9855),
    _ev("cw_afghan_1979", "Soviet invasion of Afghanistan", 1979, "Central Asia", "military",
        "USSR invaded to support a client government; US backed the mujahideen.",
        "Soviet withdrawal 1989; imperial overstretch.", 3433),
    _ev("cw_iran_hostage_1979", "Iran hostage crisis", 1979, "Middle East", "diplomatic",
        "US embassy staff held hostage after the Iranian Revolution.",
        "Released after 444 days; sanctions imposed.", 444, sanc=True),
    _ev("cw_falklands_1982", "Falklands War", 1982, "South Atlantic", "military",
        "Argentina invaded the Falklands; UK retook them by force.",
        "UK victory; Argentine junta fell.", 74),
    _ev("cw_able_archer_1983", "Able Archer 83 nuclear scare", 1983, "Europe", "military",
        "A NATO exercise was misread by the USSR as war preparation.",
        "Near-miss; no conflict; perception-gap lesson.", 11, nuke=True),
    _ev("cw_iran_iraq_1980", "Iran–Iraq War", 1980, "Middle East", "military",
        "Protracted attritional war between Iran and Iraq.",
        "Stalemate ceasefire 1988.", 2891),
    _ev("cw_grenada_1983", "US invasion of Grenada", 1983, "Caribbean", "military",
        "US intervened after a coup on the island.",
        "Quick US military victory.", 4),
    _ev("cw_chernobyl_1986", "Chernobyl disaster (systemic shock)", 1986, "Europe", "hybrid",
        "Nuclear plant disaster strained the Soviet system and trust.",
        "Long-term contribution to Soviet decline.", 1),
    # ── Post Cold War 1991–2010 (15) ──
    _ev("pcw_gulf_1991", "Gulf War", 1991, "Middle East", "military",
        "US-led coalition expelled Iraq from Kuwait.",
        "Decisive coalition victory; sanctions on Iraq.", 42, sanc=True),
    _ev("pcw_yugoslavia_1992", "Bosnian War", 1992, "Europe", "military",
        "Ethnic war amid Yugoslavia's breakup.",
        "Dayton Accords 1995.", 1335),
    _ev("pcw_somalia_1993", "Somalia intervention (Black Hawk Down)", 1993, "Africa", "military",
        "US/UN humanitarian intervention turned to urban combat.",
        "US withdrawal; cautionary precedent.", 600),
    _ev("pcw_rwanda_1994", "Rwandan genocide", 1994, "Africa", "military",
        "Mass atrocity amid civil war and international inaction.",
        "RPF victory; regional spillover.", 100),
    _ev("pcw_taiwan_1996", "Third Taiwan Strait Crisis", 1996, "East Asia", "military",
        "PLA missile tests near Taiwan; US carriers deployed.",
        "De-escalation; status quo held.", 250, nuke=True),
    _ev("pcw_asianfin_1997", "Asian Financial Crisis", 1997, "Southeast Asia", "economic",
        "Currency/debt crisis spread across Asian economies.",
        "IMF programs; regimes fell (Indonesia 1998).", 540, sanc=False),
    _ev("pcw_kosovo_1999", "Kosovo War / NATO intervention", 1999, "Europe", "military",
        "NATO air campaign over Kosovo without UNSC mandate.",
        "Serbian withdrawal; precedent debate.", 78),
    _ev("pcw_911_2001", "9/11 attacks", 2001, "North America", "military",
        "Non-state mass-casualty attack reshaped global security.",
        "Global War on Terror; Afghanistan war.", 1),
    _ev("pcw_afghanistan_2001", "US invasion of Afghanistan", 2001, "Central Asia", "military",
        "US-led removal of the Taliban after 9/11.",
        "Two-decade occupation; 2021 withdrawal.", 7300),
    _ev("pcw_iraq_2003", "Iraq War", 2003, "Middle East", "military",
        "US-led invasion of Iraq on WMD claims.",
        "Regime change; long insurgency.", 3000, sanc=True),
    _ev("pcw_orange_2004", "Ukraine Orange Revolution", 2004, "Europe", "diplomatic",
        "Mass protests overturned a disputed election.",
        "Re-run election; pro-Western shift.", 60),
    _ev("pcw_lebanon_2006", "Israel–Hezbollah War", 2006, "Middle East", "military",
        "34-day war between Israel and Hezbollah.",
        "Ceasefire; non-state actor resilience.", 34),
    _ev("pcw_georgia_2008", "Russo-Georgian War", 2008, "Caucasus", "military",
        "Short war over South Ossetia/Abkhazia.",
        "Russian recognition of breakaway regions.", 12),
    _ev("pcw_gfc_2008", "Global Financial Crisis", 2008, "Global", "economic",
        "Banking collapse triggered a global recession.",
        "Coordinated stimulus; lasting instability.", 540),
    _ev("pcw_mumbai_2008", "Mumbai attacks (India–Pakistan tension)", 2008, "South Asia", "military",
        "Non-state attack raised India–Pakistan nuclear tension.",
        "De-escalation; no war.", 4, nuke=True),
    # ── Modern hybrid warfare 2010–2024 (10) ──
    _ev("mh_arabspring_2011", "Arab Spring", 2011, "Middle East", "hybrid",
        "Wave of uprisings driven by social media and economic grievance.",
        "Mixed: reforms, civil wars, restorations.", 700),
    _ev("mh_crimea_2014", "Russian annexation of Crimea", 2014, "Europe", "hybrid",
        "Little green men + referendum annexed Crimea; gray-zone playbook.",
        "Annexation; sanctions; frozen conflict.", 30, sanc=True),
    _ev("mh_isis_2014", "Rise of ISIS", 2014, "Middle East", "military",
        "Non-state caliphate seized territory across Iraq/Syria.",
        "Territorial defeat by 2019; insurgency persists.", 1800),
    _ev("mh_scs_2016", "South China Sea arbitration", 2016, "Southeast Asia", "diplomatic",
        "PCA ruled against China's nine-dash line; China rejected it.",
        "Gray-zone persistence; militarized features.", 1, sanc=False),
    _ev("mh_doklam_2017", "Doklam standoff (India–China)", 2017, "South Asia", "military",
        "Border standoff over a Himalayan plateau.",
        "Negotiated disengagement.", 73, nuke=True),
    _ev("mh_venezuela_2019", "Venezuela crisis & sanctions", 2019, "South America", "economic",
        "Dual-power crisis with heavy US sanctions.",
        "Stalemate; humanitarian collapse.", 1000, sanc=True),
    _ev("mh_galwan_2020", "Galwan Valley clash (India–China)", 2020, "South Asia", "military",
        "Deadly hand-to-hand border clash in Ladakh.",
        "Tense disengagement; persistent friction.", 200, nuke=True),
    _ev("mh_ukraine_2022", "Russian full-scale invasion of Ukraine", 2022, "Europe", "military",
        "Conventional war + massive sanctions + information war.",
        "Protracted attrition; energy/food shock.", 1000, nuke=True, sanc=True),
    _ev("mh_pelosi_taiwan_2022", "Pelosi Taiwan visit & PLA drills", 2022, "East Asia", "military",
        "Large PLA exercises encircling Taiwan after a US visit.",
        "De-escalation; new normal of pressure.", 10, nuke=True),
    _ev("mh_redsea_2023", "Houthi Red Sea shipping attacks", 2023, "Middle East", "hybrid",
        "Non-state attacks on shipping disrupted global trade routes.",
        "Coalition response; persistent disruption.", 365),
    # ── Economic / trade conflicts (10) ──
    _ev("ec_plaza_1985", "Plaza Accord", 1985, "Global", "economic",
        "Coordinated currency intervention to weaken the US dollar.",
        "Managed realignment; Japan asset bubble seeds.", 1, sanc=False),
    _ev("ec_japan_us_1980s", "US–Japan trade war (1980s)", 1987, "Global", "economic",
        "Tariffs/quotas over autos and semiconductors.",
        "Voluntary export restraints; managed trade.", 1500, sanc=True),
    _ev("ec_nafta_1994", "NAFTA integration shock", 1994, "North America", "economic",
        "Trade integration reshaped supply chains and labor.",
        "Deeper integration; distributional friction.", 1, sanc=False),
    _ev("ec_wto_china_2001", "China joins the WTO", 2001, "Global", "economic",
        "China's accession reshaped global manufacturing.",
        "China-centric supply chains; later backlash.", 1, sanc=False),
    _ev("ec_rare_earth_2010", "China rare-earth embargo on Japan", 2010, "East Asia", "economic",
        "China curbed rare-earth exports amid a maritime dispute.",
        "Diversification push; weaponized supply chain.", 60, sanc=True),
    _ev("ec_russia_sanctions_2014", "Western sanctions on Russia (2014)", 2014, "Europe", "economic",
        "Sanctions after Crimea targeted finance/energy.",
        "Partial decoupling; import substitution.", 2000, sanc=True),
    _ev("ec_us_china_tariffs_2018", "US–China trade war (tariffs)", 2018, "Global", "economic",
        "Escalating tariffs and tech restrictions between the US and China.",
        "Phase-one deal; structural decoupling continues.", 700, sanc=True),
    _ev("ec_huawei_2019", "Huawei / semiconductor export controls", 2019, "Global", "cyber",
        "US restricted chip and equipment exports to Chinese firms.",
        "Tech bifurcation; supply-chain reshoring.", 1500, sanc=True),
    _ev("ec_chip_controls_2022", "US advanced-chip export controls", 2022, "Global", "cyber",
        "Sweeping curbs on advanced chips/tools to China.",
        "Accelerated localization and friend-shoring.", 700, sanc=True),
    _ev("ec_nickel_indonesia_2020", "Indonesia nickel export ban", 2020, "Southeast Asia", "economic",
        "Indonesia banned raw nickel exports to build downstream industry.",
        "EV supply-chain leverage; WTO dispute.", 1, sanc=True),
]


async def _seed():
    assert len(EVENTS) >= 50, f"expected >=50 events, got {len(EVENTS)}"
    print(f"[seed-hist] embedding + upserting {len(EVENTS)} events to Pinecone...")
    res = await seed_historical_events(EVENTS)
    print(f"[seed-hist] done: success={res['success']} failed={res['failed']}")


async def _verify():
    print("[verify] querying: 'Chinese coast guard intrusion in disputed maritime EEZ'")
    matches = await find_similar_events(
        "Chinese coast guard vessels intruding into a neighbor's maritime EEZ in a gray-zone dispute",
        top_k=5,
        min_score=0.0,
    )
    if not matches:
        print("[verify] NO matches — check index dimension (1536) and that seed ran.")
        return
    for m in matches:
        print(f"  {m['similarity_score']:.3f}  {m['title']} ({m['year']})")


if __name__ == "__main__":
    if "--verify" in sys.argv:
        asyncio.run(_verify())
    else:
        asyncio.run(_seed())
