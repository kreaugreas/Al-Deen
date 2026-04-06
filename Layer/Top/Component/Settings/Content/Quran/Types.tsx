export interface PreviewWordProps {
  arabic: string;
  translation: string;
  showTranslation: boolean;
  showTooltip: boolean;
  showInline: boolean;
  recitationEnabled: boolean;
  fontClass: string;
  fontSize: string;
}

export interface SelectorBarProps<T extends string = string> {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onSelect: (id: T) => void;
}

export interface SizeControlProps {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
}