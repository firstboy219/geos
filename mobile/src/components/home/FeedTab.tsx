import { ScrollView, Text, View } from 'react-native';

import {
  DUMMY_NEWS,
  DUMMY_SOCIAL,
  FEED_INTEGRITY_NOTE,
  type NewsArticle,
  type SocialPost,
} from '@/data/home';

import { ToneTag } from './primitives';
import { toneClasses } from './tone';

/** The "Berita & Umpan" (News & Feed) tab content. */
export function FeedTab() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <IntegrityNote />
      <View className="h-[10px]" />
      {DUMMY_NEWS.map((a) => (
        <View key={a.headline} className="mb-2">
          <NewsCard article={a} />
        </View>
      ))}
      <View className="h-1" />
      {DUMMY_SOCIAL.map((p) => (
        <View key={p.headline} className="mb-2">
          <SocialCard post={p} />
        </View>
      ))}
    </ScrollView>
  );
}

function IntegrityNote() {
  return (
    <View className="rounded-inner border-[0.5px] border-border bg-surface px-[11px] py-[9px]">
      <Text className="text-[12px] font-medium text-textPrimary">
        {FEED_INTEGRITY_NOTE.title}
      </Text>
      <Text className="mt-[3px] text-[12px] leading-[18px]" style={{ color: '#8B9FB8' }}>
        {FEED_INTEGRITY_NOTE.body}
      </Text>
    </View>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  const a = article;
  const srcFill = toneClasses(a.sourceTone).dot;
  return (
    <View className="rounded-card border-[0.5px] border-border bg-surface p-[14px]">
      <View className="flex-row items-center">
        <View className={`h-[6px] w-[6px] rounded-full ${srcFill}`} />
        <Text className="ml-[5px] text-[11px] font-medium text-textMuted">{a.source}</Text>
        <Text className="ml-[5px] text-[11px] text-textMuted">· {a.time}</Text>
        <View className="flex-1" />
        <ToneTag label={a.credibilityLabel} tone={a.credibilityTone} rounded="rounded-[7px]" />
      </View>
      <Text className="mt-[7px] text-[14px] font-medium leading-[20px] text-textPrimary">
        {a.headline}
      </Text>
      <View className="mt-[5px] flex-row items-center">
        <Text className="flex-1 text-[11px] text-textMuted">{a.category}</Text>
        {a.tripwire != null && (
          <ToneTag label={a.tripwire} tone="danger" rounded="rounded-[7px]" />
        )}
      </View>
    </View>
  );
}

function SocialCard({ post }: { post: SocialPost }) {
  const p = post;
  const t = toneClasses(p.tone);
  const srcFill = t.dot;
  return (
    <View
      className={`rounded-card border-[0.5px] bg-surface p-[14px] ${
        p.tone === 'special' ? 'border-purpleDark' : 'border-border'
      }`}
    >
      <View className="flex-row items-center">
        <View className={`h-[6px] w-[6px] rounded-full ${srcFill}`} />
        <Text className="ml-[5px] text-[11px] font-medium text-textMuted">{p.source}</Text>
        <Text className="ml-[5px] text-[11px] text-textMuted">· {p.time}</Text>
        <View className="flex-1" />
        <ToneTag label={p.badge} tone={p.tone} rounded="rounded-[7px]" />
      </View>
      <Text className="mt-[7px] text-[14px] font-medium leading-[20px] text-textPrimary">
        {p.headline}
      </Text>
      <Text className={`mt-[5px] text-[12px] leading-[17px] ${t.fg}`}>{p.note}</Text>
    </View>
  );
}
