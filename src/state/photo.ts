import { create } from 'zustand';

// The user's photo lives only in memory: it is never written to storage.
interface PhotoState {
  url: string | null;
  file: File | null;
  width: number;
  height: number;
  set: (file: File) => void;
  clear: () => void;
}

export const usePhoto = create<PhotoState>((set, get) => ({
  url: null,
  file: null,
  width: 4,
  height: 3,
  set: (file) => {
    const previous = get().url;
    if (previous) URL.revokeObjectURL(previous);
    const url = URL.createObjectURL(file);
    set({ url, file, width: 4, height: 3 });
    const image = new Image();
    image.onload = () => {
      if (get().url === url) set({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.src = url;
  },
  clear: () => {
    const previous = get().url;
    if (previous) URL.revokeObjectURL(previous);
    set({ url: null, file: null });
  },
}));
