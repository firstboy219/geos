import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { TooltipChip } from '@/components';
import {
  toneFor,
  type DominoEffect,
  type FinancialWeapon,
  type IndustryImpact,
  type NuclearIndicator,
  type ScenarioModel,
  type ToneKey,
} from '@/data/home';
import { colors } from '@/theme';

import { ToneBar, ToneTag } from './primitives';
import { toneClasses } from './tone';

/**
 * Full expandable scenario block: header + probability bar + tooltip tags +
 * hint + optional financial-warfare / nuclear sub-cards + evidence accordion +
 * confidence bar + 2nd/3rd-order domino chips + industry-impact chips.
 */
export function ScenarioDetail({
  scenario,
  showDivider = true,
}: {
  scenario: ScenarioModel;
  showDivider?: boolean;
}) {
  const s = scenario;
  return (
    <View
      className={`px-[14px] py-[11px] ${
        showDivider ? 'border-b-[0.5px] border-borderSubtle' : ''
      }`}
    >
      <View className="flex-row items-center">
        <Text className="flex-1 text-[12px] font-medium text-[#C9D1D9]">{s.name}</Text>
        <Text className={`text-[15px] font-medium ${toneClasses(s.tone).fg}`}>
          {s.probability}%
        </Text>
      </View>

      <View className="mt-1">
        <ToneBar percent={s.probability} tone={s.tone} height={6} />
      </View>

      {s.tags.length > 0 && (
        <View className="mt-2 flex-row flex-wrap gap-[3px]">
          {s.tags.map((t) => (
            <TooltipChip
              key={t.label}
              label={t.label}
              tooltip={t.tooltip}
              tone={toneFor(t.tone)}
            />
          ))}
        </View>
      )}

      <Text className="mt-2 text-[11px] leading-[15px] text-textMuted">{s.hint}</Text>

      {s.financialWeapons.length > 0 && (
        <FinancialWarfareCard weapons={s.financialWeapons} />
      )}
      {s.nuclearIndicators.length > 0 && <NuclearCard indicators={s.nuclearIndicators} />}
      {s.evidences.length > 0 && <EvidenceAccordion scenario={s} />}

      <ConfidenceBar score={s.confidenceScore} formula={s.confidenceFormula} tone={s.tone} />

      {s.dominoEffects.length > 0 && <DominoSection effects={s.dominoEffects} />}
      {s.industryImpacts.length > 0 && <IndustrySection impacts={s.industryImpacts} />}
    </View>
  );
}

function FinancialWarfareCard({ weapons }: { weapons: FinancialWeapon[] }) {
  return (
    <View
      className="mt-2 rounded-chip border-[0.5px] px-[10px] py-2"
      style={{ backgroundColor: '#1A1208', borderColor: '#7A4800' }}
    >
      <View className="flex-row items-center">
        <Ionicons name="hammer-outline" size={12} color={colors.warning} />
        <Text className="ml-[5px] flex-1 text-[12px] font-medium text-warning">
          Financial Warfare Inventory (Lapisan J)
          <Text className="text-[10px] font-normal" style={{ color: '#8B9FB8' }}>
            {' '}
            — senjata ekonomi yang bisa ditembakkan
          </Text>
        </Text>
      </View>
      <View className="mt-[5px]">
        {weapons.map((w) => (
          <View key={w.text} className="mb-[5px] flex-row items-start">
            <Text className="text-[12px]">{w.flag}</Text>
            <View className="ml-[6px] flex-1">
              <Text className="text-[12px] text-[#C9D1D9]">{w.text}</Text>
              <Text className={`mt-[2px] text-[11px] ${toneClasses(w.tone).fg}`}>
                {w.asymmetry}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function NuclearCard({ indicators }: { indicators: NuclearIndicator[] }) {
  return (
    <View
      className="mt-2 rounded-chip border-[0.5px] border-purpleBorder px-[10px] py-2"
      style={{ backgroundColor: '#1A0820' }}
    >
      <View className="flex-row items-center">
        <Ionicons name="warning-outline" size={12} color={colors.purple} />
        <Text className="ml-[5px] text-[11px] font-medium text-purple">
          Nuclear Threshold (Lapisan I)
        </Text>
      </View>
      <View className="mt-[5px]">
        {indicators.map((i) => (
          <View key={i.label} className="mb-1 flex-row items-center">
            <View className="h-[6px] w-[6px] rounded-full bg-purple" />
            <Text className="ml-[6px] flex-1 text-[12px] text-[#C9D1D9]">{i.label}</Text>
            <Text className={`text-[12px] font-medium ${toneClasses(i.tone).fg}`}>
              {i.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EvidenceAccordion({ scenario }: { scenario: ScenarioModel }) {
  const [open, setOpen] = useState(false);
  const s = scenario;
  const tone = toneClasses(s.tone);
  return (
    <View className="mt-2 overflow-hidden rounded-[9px] border-[0.5px] border-borderSubtle">
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="flex-row items-center bg-surfaceAlt px-[10px] py-[7px]"
      >
        <Ionicons name="server-outline" size={13} color={toneFor(s.tone).fg} />
        <Text className="ml-[6px] flex-1 text-[12px] font-medium text-textSecondary">
          Mengapa {s.probability}%? — Faktor pendukung & bukti nyata
        </Text>
        <ToneTag label={`${s.evidences.length} bukti`} tone={s.tone} rounded="rounded-[10px]" />
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.textSecondary}
          style={{ marginLeft: 4 }}
        />
      </Pressable>
      {open && (
        <View className="bg-surfaceAlt">
          {s.evidences.map((e, i) => {
            const et = toneClasses(e.tone);
            return (
              <View
                key={e.text}
                className={`flex-row items-start px-[10px] py-[7px] ${
                  i < s.evidences.length - 1 ? 'border-b-[0.5px] border-surface' : ''
                }`}
              >
                <View
                  className={`h-[22px] w-[22px] items-center justify-center rounded-[5px] ${et.bg}`}
                >
                  <Ionicons
                    name={e.icon as keyof typeof Ionicons.glyphMap}
                    size={11}
                    color={toneFor(e.tone).fg}
                  />
                </View>
                <View className="ml-[7px] flex-1">
                  <Text className="text-[12px] leading-[18px] text-[#C9D1D9]">{e.text}</Text>
                  <Text className={`mt-[2px] text-[11px] ${et.fg}`}>{e.source}</Text>
                  <View className="mt-[3px]">
                    <ToneTag label={e.tag} tone={e.tone} rounded="rounded-[6px]" />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function ConfidenceBar({
  score,
  formula,
  tone,
}: {
  score: number;
  formula: string;
  tone: ScenarioModel['tone'];
}) {
  return (
    <View className="mt-[5px] flex-row items-center rounded-[7px] bg-surfaceAlt px-[9px] py-[6px]">
      <View className="flex-1">
        <Text className="text-[12px] text-textSecondary">
          Tingkat kepercayaan AI (Confidence Score)
        </Text>
        <Text className="mt-[1px] text-[11px] text-textMuted">{formula}</Text>
      </View>
      <View className="ml-2 w-[60px]">
        <ToneBar percent={score} tone={tone} height={4} />
      </View>
      <Text className={`w-[30px] text-right text-[12px] font-medium ${toneClasses(tone).fg}`}>
        {score}%
      </Text>
    </View>
  );
}

function DominoSection({ effects }: { effects: DominoEffect[] }) {
  return (
    <View className="mt-[5px] rounded-chip bg-surfaceAlt px-[9px] py-[7px]">
      <Text className="text-[10px] font-medium tracking-[0.4px] text-textSecondary">
        EFEK DOMINO (2ND & 3RD ORDER — LAPISAN E)
      </Text>
      <View className="mt-[5px] flex-row flex-wrap gap-[3px]">
        {effects.map((e) => (
          <ToneTag key={e.label} label={e.label} tone={e.tone} rounded="rounded-[10px]" />
        ))}
      </View>
    </View>
  );
}

const IMPACT_STYLE: Record<
  IndustryImpact['direction'],
  { prefix: string; tone: ToneKey }
> = {
  up: { prefix: '↑ ', tone: 'positive' },
  down: { prefix: '↓ ', tone: 'danger' },
  neutral: { prefix: '→ ', tone: 'neutral' },
  watch: { prefix: '! ', tone: 'warning' },
};

function IndustrySection({ impacts }: { impacts: IndustryImpact[] }) {
  return (
    <View className="mt-[3px] rounded-chip bg-surfaceAlt px-[9px] py-[6px]">
      <Text className="text-[10px] font-medium tracking-[0.4px] text-textSecondary">
        DAMPAK KE INDUSTRI
      </Text>
      <View className="mt-[5px] flex-row flex-wrap gap-[3px]">
        {impacts.map((i) => {
          const st = IMPACT_STYLE[i.direction];
          return (
            <ToneTag
              key={i.label}
              label={`${st.prefix}${i.label}`}
              tone={st.tone}
              rounded="rounded-[14px]"
            />
          );
        })}
      </View>
    </View>
  );
}
