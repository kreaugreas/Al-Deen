// Component/Settings/Content/Quran/Constant.tsx
export const KFGQPC_VARIANTS = [
  { id: "uthmani" as const,    label: "Uthmani Hafs" },
  { id: "uthmani_v1" as const, label: "V1" },
  { id: "uthmani_v2" as const, label: "V2" },
  { id: "uthmani_v4" as const, label: "V4" },
];

export const PREVIEW_WORDS = [
  { arabic: "بِسْمِ",       translation: "In the name of"    },
  { arabic: "اللَّهِ",      translation: "Allah"             },
  { arabic: "الرَّحْمَٰنِ", translation: "the Most Gracious" },
  { arabic: "الرَّحِيمِ",   translation: "the Most Merciful" },
];

export const RECITERS = [
  { id: "Mishary_Rashid_Alafasy",  label: "Mishari Rashid al-Afasy"      },
  { id: "Abdul-Basit-Abdus-Samad-Murattal",   label: "Abdul Basit Abdus-Samad Murattal"        },
  { id: "Abdul-Basit-Abdus-Samad-Mujawwad",   label: "Abdul-Basit-Abdus-Samad-Mujawwad"      },
];

export const TRANSLATORS = [
  { id: "None", label: "None" },
  { id: "Direct", label: "Direct" },
  { id: "Saheeh-International", label: "Saheeh International" },
];

export const TRANSLITERATORS = [
  { id: "None", label: "None" },
  { id: "Standard", label: "Standard" },
  { id: "KBK", label: "KBK" },
];