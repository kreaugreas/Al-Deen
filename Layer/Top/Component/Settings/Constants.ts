export const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
];

export const SETTINGS_CATEGORIES = [
  { id: "account" as const,  label: "Account",  icon: "User" },
  { id: "quran" as const,    label: "Quran",    icon: "Type" },
  { id: "language" as const, label: "Language", icon: "Globe" },
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
  { id: "Direct", label: "Direct" },
  { id: "Saheeh-International", label: "Saheeh International" },
];