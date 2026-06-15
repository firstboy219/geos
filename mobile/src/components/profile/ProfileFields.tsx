import { Pressable, Text, TextInput, View } from "react-native";

import { chronicle } from "@/theme/chronicle";

export interface ProfileFormState {
  profession: string;
  country: string;
  city: string;
  birthYear: string;
  gender: string;
}

export const EMPTY_PROFILE: ProfileFormState = {
  profession: "",
  country: "",
  city: "",
  birthYear: "",
  gender: "",
};

/** True when the minimum fields needed for personal analysis are present. */
export function isProfileComplete(p: ProfileFormState): boolean {
  return Boolean(p.profession.trim() && p.country.trim());
}

/** Shape the PATCH /users/me body from form state. */
export function profilePatch(p: ProfileFormState) {
  return {
    profession: p.profession.trim() || null,
    country: p.country.trim() || null,
    city: p.city.trim() || null,
    gender: p.gender || null,
    birth_year: p.birthYear ? Number(p.birthYear) : null,
  };
}

const GENDERS = ["Pria", "Wanita", "Lainnya"];

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: "default" | "number-pad";
}) {
  return (
    <View className="mb-3">
      <Text className="font-inter-medium text-[12px] text-on-surface-variant mb-1">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={chronicle.onSurfaceVariant}
        keyboardType={keyboardType ?? "default"}
        className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-3 font-serif text-[15px] text-on-surface"
      />
    </View>
  );
}

export function ProfileFields({
  value,
  onChange,
}: {
  value: ProfileFormState;
  onChange: (next: ProfileFormState) => void;
}) {
  const set = (patch: Partial<ProfileFormState>) => onChange({ ...value, ...patch });
  return (
    <View>
      <Field
        label="Profesi *"
        value={value.profession}
        onChangeText={(t) => set({ profession: t })}
        placeholder="cth: Guru, Software Engineer"
      />
      <Field
        label="Negara *"
        value={value.country}
        onChangeText={(t) => set({ country: t })}
        placeholder="cth: Indonesia"
      />
      <Field
        label="Kota / Lokasi"
        value={value.city}
        onChangeText={(t) => set({ city: t })}
        placeholder="cth: Surabaya"
      />
      <Field
        label="Tahun Lahir"
        value={value.birthYear}
        onChangeText={(t) => set({ birthYear: t.replace(/[^0-9]/g, "") })}
        placeholder="cth: 1990"
        keyboardType="number-pad"
      />
      <Text className="font-inter-medium text-[12px] text-on-surface-variant mb-1">
        Gender
      </Text>
      <View className="flex-row gap-2">
        {GENDERS.map((g) => (
          <Pressable
            key={g}
            onPress={() => set({ gender: g })}
            className={`px-4 py-2 rounded-full border ${
              value.gender === g
                ? "bg-on-background border-on-background"
                : "border-outline-variant"
            }`}
          >
            <Text
              className={`font-inter-medium text-[13px] ${
                value.gender === g ? "text-on-primary" : "text-on-surface-variant"
              }`}
            >
              {g}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
