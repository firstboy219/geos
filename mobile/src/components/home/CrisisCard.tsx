import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { RiskPill, TooltipChip } from '@/components';
import {
  toneFor,
  type ActorModel,
  type CrisisLayerChipData,
  type CrisisModel,
  type PerceptionRead,
  type PivotWatch,
} from '@/data/home';
import { colors } from '@/theme';

import { MetricBarRow, MicroLabel, ToneTag } from './primitives';
import { ScenarioDetail } from './ScenarioDetail';
import { toneClasses } from './tone';

/**
 * A full crisis / situation card: a collapsed preview (header, info integrity,
 * status, layer chips, summary + N×N perception grid, actors, pivot watch,
 * probability bars) plus an expandable list of detailed scenarios.
 */
export function CrisisCard({ crisis }: { crisis: CrisisModel }) {
  const [expanded, setExpanded] = useState(false);
  const c = crisis;

  return (
    <View className="mb-[10px] overflow-hidden rounded-card border-[0.5px] border-border bg-surface">
      <View className="px-[14px] pt-[13px]">
        <Header crisis={c} />
        <View className="mt-2">
          <InfoIntegrityRow crisis={c} />
        </View>
        <View className="mt-[7px]">
          <StatusLine crisis={c} />
        </View>
        <LayerChips chips={c.layerChips} />
        <SummaryBlurb crisis={c} />
        {c.actors.length > 0 && <ActorSection actors={c.actors} />}
        {c.pivotWatches.length > 0 && <PivotWatchSection items={c.pivotWatches} />}

        <Text className="mt-2 text-[12px] text-textSecondary">
          Apa yang paling mungkin terjadi:
        </Text>
        <View className="mt-[7px]">
          {c.probabilityBars.map((b) => (
            <MetricBarRow key={b.label} label={b.label} percent={b.percent} tone={b.tone} />
          ))}
        </View>

        {c.scenarios.length > 0 && (
          <Pressable
            onPress={() => setExpanded((v) => !v)}
            className="flex-row items-center py-[5px]"
          >
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.accent}
            />
            <Text className="ml-[3px] flex-1 text-[12px] text-accent">
              {expanded
                ? 'Tutup detail'
                : 'Lihat semua skenario + bukti pendukung + dampak industri'}
            </Text>
          </Pressable>
        )}
        <View className="h-2" />
      </View>

      {expanded && c.scenarios.length > 0 && (
        <View className="border-t-[0.5px] border-borderSubtle">
          {c.scenarios.map((s, i) => (
            <ScenarioDetail
              key={s.name}
              scenario={s}
              showDivider={i !== c.scenarios.length - 1}
            />
          ))}
        </View>
      )}

      <Footer />
    </View>
  );
}

function Header({ crisis }: { crisis: CrisisModel }) {
  const c = crisis;
  return (
    <View className="flex-row items-start">
      <Text className="text-[18px]">{c.flag}</Text>
      <View className="ml-[7px] flex-1">
        <Text className="text-[14px] font-medium text-textPrimary">{c.title}</Text>
        <Text className="mt-[2px] text-[11px] text-textMuted">{c.location}</Text>
      </View>
      <View className="ml-2 items-end">
        <RiskPill level={c.riskLevel} label={c.riskLabel} />
        {c.grayZone && (
          <View className="mt-1">
            <ToneTag label="⟷ Gray Zone aktif" tone="special" />
          </View>
        )}
      </View>
    </View>
  );
}

function InfoIntegrityRow({ crisis }: { crisis: CrisisModel }) {
  const c = crisis;
  const ok = c.credibilityScore >= 80;
  const tone = ok ? 'positive' : c.credibilityScore >= 70 ? 'warning' : 'special';
  const t = toneClasses(tone);
  return (
    <View className="flex-row items-start rounded-[7px] bg-surfaceAlt px-2 py-[5px]">
      <View className={`mt-1 h-[6px] w-[6px] rounded-full ${t.dot}`} />
      <Text className="ml-[6px] flex-1 text-[12px] text-[#C9D1D9]">
        <Text className="font-medium">Credibility Score {c.credibilityScore}%</Text>
        <Text className="text-textSecondary"> — {c.credibilityNote}</Text>
      </Text>
      <View className="ml-[6px]">
        <ToneTag label={ok ? 'L ✓' : 'L ⚠'} tone={tone} rounded="rounded-[6px]" />
      </View>
    </View>
  );
}

function StatusLine({ crisis }: { crisis: CrisisModel }) {
  const c = crisis;
  const t = toneClasses(c.statusTone);
  return (
    <View className={`flex-row items-start rounded-chip px-[10px] py-2 ${t.bg}`}>
      <View className={`mt-[3px] h-2 w-2 rounded-full ${t.dot}`} />
      <Text className={`ml-[6px] flex-1 text-[12px] leading-[17px] ${t.fg}`}>
        {c.statusText}
      </Text>
    </View>
  );
}

function LayerChips({ chips }: { chips: CrisisLayerChipData[] }) {
  return (
    <View className="mt-2 flex-row flex-wrap gap-[3px]">
      {chips.map((c) => (
        <TooltipChip
          key={c.code}
          label={`${c.code} · ${c.label}`}
          tooltip={c.tooltip}
          tone={toneFor(c.tone)}
        />
      ))}
    </View>
  );
}

function SummaryBlurb({ crisis }: { crisis: CrisisModel }) {
  const c = crisis;
  return (
    <View className="mt-2 rounded-inner bg-surfaceAlt px-[11px] py-[9px]">
      <MicroLabel text="Ringkasan situasi" trailing="· Lapisan H — N×N Perception Matrix" />
      <Text className="mt-[5px] text-[12px] leading-[19px] text-[#C9D1D9]">
        {c.summaryText}
      </Text>

      {c.perceptions.length > 0 && (
        <>
          <Text className="mt-2 text-[12px] font-medium text-textSecondary">
            Bagaimana setiap pihak membaca situasi ini (sumber utama
            kesalahpahaman):
          </Text>
          <View className="mt-[5px]">
            <PerceptionGrid reads={c.perceptions} />
          </View>
        </>
      )}

      <View className="mt-[6px] rounded-[6px] bg-dangerDark px-2 py-[5px]">
        <Text className="text-[11px] leading-[16px] text-danger">⚠ {c.cascadeNote}</Text>
      </View>
    </View>
  );
}

function PerceptionGrid({ reads }: { reads: PerceptionRead[] }) {
  return (
    <View className="flex-row flex-wrap justify-between">
      {reads.map((r) => (
        <View
          key={r.actor}
          className="mb-1 w-[49%] rounded-[7px] bg-surface px-2 py-[6px]"
        >
          <Text className="text-[11px] text-textMuted">{r.actor}</Text>
          <Text className="mt-[2px] text-[11px] leading-[15px] text-[#C9D1D9]">
            {r.reading}
          </Text>
          <Text className={`mt-[3px] text-[11px] font-medium ${toneClasses(r.tone).fg}`}>
            {r.verdict}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ActorSection({ actors }: { actors: ActorModel[] }) {
  return (
    <View className="mt-2 rounded-inner bg-surfaceAlt px-[10px] py-2">
      <Text className="text-[10px] font-medium tracking-[0.4px] text-textSecondary">
        PROFIL AKTOR KUNCI — LAPISAN K (COGNITIVE STRESS) + O (REGIME FRAGILITY)
      </Text>
      <View className="mt-[7px]">
        {actors.map((a, i) => (
          <View key={a.name} className={i < actors.length - 1 ? 'mb-[6px]' : ''}>
            <ActorRow actor={a} />
          </View>
        ))}
      </View>
    </View>
  );
}

function ActorRow({ actor }: { actor: ActorModel }) {
  const a = actor;
  const stressFill = toneClasses(a.stressTone).dot;
  return (
    <View className="flex-row items-start">
      <View
        className="h-7 w-7 items-center justify-center rounded-full"
        style={{ backgroundColor: '#1A2740' }}
      >
        <Text className="text-[11px] font-medium text-accent">{a.initials}</Text>
      </View>
      <View className="ml-[7px] flex-1">
        <Text className="text-[12px] font-medium text-textPrimary">{a.name}</Text>
        <View className="mt-[3px] flex-row flex-wrap gap-[3px]">
          {a.scores.map((s) => (
            <TooltipChip
              key={s.label}
              label={s.label}
              tooltip={s.tooltip}
              tone={toneFor(s.tone)}
            />
          ))}
        </View>
        <View className="mt-1 flex-row items-center">
          <Text className="text-[11px] text-textMuted">Tekanan domestik:</Text>
          <View className="ml-[5px] flex-row">
            {Array.from({ length: 5 }).map((_, i) => (
              <View
                key={i}
                className={`mr-[2px] h-[6px] w-[6px] rounded-full ${
                  i < a.stressLevel ? stressFill : 'bg-border'
                }`}
              />
            ))}
          </View>
          <Text className={`ml-[3px] flex-1 text-[11px] ${toneClasses(a.stressTone).fg}`}>
            {a.stressLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

function PivotWatchSection({ items }: { items: PivotWatch[] }) {
  return (
    <View className="mt-2 rounded-inner border-[0.5px] border-border bg-surfaceAlt px-[10px] py-2">
      <View className="flex-row items-center">
        <Ionicons name="flag-outline" size={12} color={colors.danger} />
        <Text className="ml-[5px] flex-1 text-[10px] font-medium tracking-[0.4px] text-textSecondary">
          PIVOT WATCH LIST (LAPISAN D)
        </Text>
      </View>
      <View className="mt-[6px]">
        {items.map((p, i) => {
          const t = toneClasses(p.tone);
          return (
            <View
              key={p.text}
              className={`flex-row items-start py-[5px] ${
                i < items.length - 1 ? 'border-b-[0.5px] border-borderSubtle' : ''
              }`}
            >
              <View className={`h-5 w-5 items-center justify-center rounded-[5px] ${t.bg}`}>
                <Ionicons
                  name={p.icon as keyof typeof Ionicons.glyphMap}
                  size={11}
                  color={toneFor(p.tone).fg}
                />
              </View>
              <Text className="ml-[7px] flex-1 text-[11px] leading-[15px] text-[#C9D1D9]">
                {p.text}
              </Text>
              <View className="ml-[6px]">
                <ToneTag label={p.badge} tone={p.tone} rounded="rounded-[7px]" />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Footer() {
  return (
    <View className="flex-row items-center justify-between border-t-[0.5px] border-borderSubtle px-[14px] py-[9px]">
      <Text className="text-[12px] font-medium text-accent">
        Lihat impact vector lengkap →
      </Text>
      <Text className="text-[11px] text-textMuted">Live · 16 lapisan aktif</Text>
    </View>
  );
}
