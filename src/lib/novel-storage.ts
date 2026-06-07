export type StoredNovelChapter = {
  id: string;
  title: string;
  content: string;
  locked?: boolean;
};

export type StoredNovel = {
  id: string;
  title: string;
  chapters: StoredNovelChapter[];
  createdAt: string;
  updatedAt: string;
};

const NOVEL_STORAGE_KEY = "actory:novels";
const NOVEL_STORAGE_EVENT = "actory:novels-changed";

const canUseStorage = () => typeof window !== "undefined" && window.localStorage;

const normalizeTitle = (title: string) => title.trim().toLowerCase();

const createNovelId = () =>
  `novel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const emitNovelStorageChange = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(NOVEL_STORAGE_EVENT));
};

export const getNovelStorageEventName = () => NOVEL_STORAGE_EVENT;

export const readNovelStorageSnapshot = () => {
  if (!canUseStorage()) {
    return "[]";
  }

  return window.localStorage.getItem(NOVEL_STORAGE_KEY) ?? "[]";
};

export const parseNovelStorageSnapshot = (rawValue: string): StoredNovel[] => {
  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (item): item is StoredNovel =>
        typeof item === "object" &&
        item !== null &&
        !Array.isArray(item) &&
        typeof (item as StoredNovel).id === "string" &&
        typeof (item as StoredNovel).title === "string" &&
        Array.isArray((item as StoredNovel).chapters),
    );
  } catch {
    return [];
  }
};

export const readNovels = (): StoredNovel[] =>
  parseNovelStorageSnapshot(readNovelStorageSnapshot());

export const writeNovels = (novels: StoredNovel[]) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(NOVEL_STORAGE_KEY, JSON.stringify(novels));
  emitNovelStorageChange();
};

export const findNovelTitleConflict = (title: string, ignoredId?: string) => {
  const normalizedTitle = normalizeTitle(title);

  return readNovels().find(
    (novel) =>
      novel.id !== ignoredId && normalizeTitle(novel.title) === normalizedTitle,
  );
};

export const createStoredNovel = ({
  chapters,
  title,
}: {
  chapters: StoredNovelChapter[];
  title: string;
}) => {
  const now = new Date().toISOString();
  const novel: StoredNovel = {
    id: createNovelId(),
    title: title.trim(),
    chapters,
    createdAt: now,
    updatedAt: now,
  };

  writeNovels([novel, ...readNovels()]);

  return novel;
};

export const updateStoredNovel = (
  id: string,
  {
    chapters,
    title,
  }: {
    chapters: StoredNovelChapter[];
    title: string;
  },
) => {
  let updatedNovel: StoredNovel | null = null;
  const novels = readNovels().map((novel) => {
    if (novel.id !== id) {
      return novel;
    }

    updatedNovel = {
      ...novel,
      title: title.trim(),
      chapters,
      updatedAt: new Date().toISOString(),
    };

    return updatedNovel;
  });

  writeNovels(novels);

  return updatedNovel;
};

export const deleteStoredNovel = (id: string) => {
  writeNovels(readNovels().filter((novel) => novel.id !== id));
};
