export type ReciterId = 'alafasy' | 'minshawi' | 'husary';

export interface ReciterInfo {
  id: ReciterId;
  name: string;
  nameArabic: string;
  baseUrl: string;
}

export const RECITERS: Record<ReciterId, ReciterInfo> = {
  alafasy: {
    id: 'alafasy',
    name: 'Mishary Alafasy',
    nameArabic: 'مشاري العفاسي',
    baseUrl: 'https://everyayah.com/data/Alafasy_128kbps'
  },
  minshawi: {
    id: 'minshawi',
    name: 'Mohamed Siddiq Al-Minshawi',
    nameArabic: 'محمد صديق المنشاوي',
    baseUrl: 'https://everyayah.com/data/Minshawy_Murattal_128kbps'
  },
  husary: {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    nameArabic: 'محمود خليل الحصري (معلم)',
    baseUrl: 'https://everyayah.com/data/Husary_128kbps'
  }
};

class AudioRecitationService {
  private currentAudio: HTMLAudioElement | null = null;
  public isPlaying: boolean = false;
  private onPlayStateChangeCallback: ((playing: boolean) => void) | null = null;

  getAyahAudioUrl(surahNumber: number, ayahNumber: number, reciter: ReciterId = 'alafasy'): string {
    const surahStr = String(surahNumber).padStart(3, '0');
    const ayahStr = String(ayahNumber).padStart(3, '0');
    const reciterInfo = RECITERS[reciter] || RECITERS.alafasy;
    return `${reciterInfo.baseUrl}/${surahStr}${ayahStr}.mp3`;
  }

  playAyah(
    surahNumber: number,
    ayahNumber: number,
    reciter: ReciterId = 'alafasy',
    onStateChange?: (playing: boolean) => void
  ): Promise<void> {
    this.stop();
    this.onPlayStateChangeCallback = onStateChange || null;

    const url = this.getAyahAudioUrl(surahNumber, ayahNumber, reciter);
    const audio = new Audio(url);
    this.currentAudio = audio;
    this.isPlaying = true;
    this.onPlayStateChangeCallback?.(true);

    return new Promise((resolve) => {
      audio.onended = () => {
        this.isPlaying = false;
        this.onPlayStateChangeCallback?.(false);
        resolve();
      };
      audio.onerror = () => {
        this.isPlaying = false;
        this.onPlayStateChangeCallback?.(false);
        resolve();
      };
      audio.play().catch(() => {
        this.isPlaying = false;
        this.onPlayStateChangeCallback?.(false);
        resolve();
      });
    });
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlaying = false;
    this.onPlayStateChangeCallback?.(false);
  }

  speakArabicText(text: string, onStateChange?: (playing: boolean) => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85;

    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    this.isPlaying = true;
    onStateChange?.(true);

    utterance.onend = () => {
      this.isPlaying = false;
      onStateChange?.(false);
    };
    utterance.onerror = () => {
      this.isPlaying = false;
      onStateChange?.(false);
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const recitationService = new AudioRecitationService();
