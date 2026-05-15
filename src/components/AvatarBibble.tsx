import { useState, useEffect } from 'react';
import Image from 'next/image';

interface BibbleAvatarProps {
  status: 'idle' | 'thinking' | 'angry' | 'error' | 'walking';
}

const emotionMap = {
  idle: '/assets/bibble/bibble-idle.png',
  thinking: '/assets/bibble/bibble-thinking.png',
  angry: '/assets/bibble/bibble-angry.png',
  error: '/assets/bibble/bibble-sad.png',
  walking: '/assets/bibble/bibble-walking.png',
};

export default function BibbleAvatar({ status }: BibbleAvatarProps) {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center transition-all duration-500">
      {/* Sombra dinâmica abaixo dele */}
      <div className="absolute bottom-2 w-16 h-4 bg-black/20 blur-xl rounded-full" />
      
      <Image
        key={status} 
        src={emotionMap[status]}
        alt="Bibble"
        width={128}
        height={128}
        className={`object-contain animate-float ${status === 'thinking' ? 'animate-pulse' : ''}`}
      />
    </div>
  );
}