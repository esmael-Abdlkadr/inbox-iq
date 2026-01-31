'use client';

import dynamic from 'next/dynamic';
import data from '@emoji-mart/data';

const Picker = dynamic(
  () => import('@emoji-mart/react').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <div className="w-[352px] h-[435px] bg-secondary rounded-lg flex items-center justify-center">Loading...</div>
  }
);

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  return (
    <Picker
      data={data}
      onEmojiSelect={(emoji: any) => onEmojiSelect(emoji.native)}
      theme="dark"
      previewPosition="none"
      skinTonePosition="none"
      maxFrequentRows={2}
    />
  );
}
