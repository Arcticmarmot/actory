import type {
  BlockDraft,
  CharacterDraft,
  HeadingDraft,
  SceneDraft,
  ScriptStyleValue,
} from "@/components/workspace-dashboard";

export type StoredScreenplayBlock = BlockDraft;
export type StoredScreenplayCharacter = CharacterDraft;
export type StoredScreenplayHeading = HeadingDraft;
export type StoredScreenplayScene = SceneDraft;

export type StoredScreenplay = {
  id: string;
  title: string;
  screenplayType: ScriptStyleValue;
  characters: StoredScreenplayCharacter[];
  scenes: StoredScreenplayScene[];
  createdAt: string;
  updatedAt: string;
};

const SCREENPLAY_STORAGE_KEY = "actory:screenplays";
const SCREENPLAY_STORAGE_EVENT = "actory:screenplays-changed";

const canUseStorage = () => typeof window !== "undefined" && window.localStorage;

const normalizeTitle = (title: string) => title.trim().toLowerCase();

const createScreenplayId = () =>
  `screenplay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const emitScreenplayStorageChange = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(SCREENPLAY_STORAGE_EVENT));
};

export const getScreenplayStorageEventName = () => SCREENPLAY_STORAGE_EVENT;

export const readScreenplayStorageSnapshot = () => {
  if (!canUseStorage()) {
    return "[]";
  }

  return window.localStorage.getItem(SCREENPLAY_STORAGE_KEY) ?? "[]";
};

export const parseScreenplayStorageSnapshot = (
  rawValue: string,
): StoredScreenplay[] => {
  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (item): item is StoredScreenplay =>
        typeof item === "object" &&
        item !== null &&
        !Array.isArray(item) &&
        typeof (item as StoredScreenplay).id === "string" &&
        typeof (item as StoredScreenplay).title === "string" &&
        typeof (item as StoredScreenplay).screenplayType === "string" &&
        Array.isArray((item as StoredScreenplay).characters) &&
        Array.isArray((item as StoredScreenplay).scenes),
    );
  } catch {
    return [];
  }
};

export const readScreenplays = (): StoredScreenplay[] =>
  parseScreenplayStorageSnapshot(readScreenplayStorageSnapshot());

export const writeScreenplays = (screenplays: StoredScreenplay[]) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    SCREENPLAY_STORAGE_KEY,
    JSON.stringify(screenplays),
  );
  emitScreenplayStorageChange();
};

export const findScreenplayTitleConflict = (
  title: string,
  ignoredId?: string,
) => {
  const normalizedTitle = normalizeTitle(title);

  return readScreenplays().find(
    (screenplay) =>
      screenplay.id !== ignoredId &&
      normalizeTitle(screenplay.title) === normalizedTitle,
  );
};

export const createStoredScreenplay = ({
  characters,
  scenes,
  screenplayType,
  title,
}: {
  characters: StoredScreenplayCharacter[];
  scenes: StoredScreenplayScene[];
  screenplayType: ScriptStyleValue;
  title: string;
}) => {
  const now = new Date().toISOString();
  const screenplay: StoredScreenplay = {
    id: createScreenplayId(),
    title: title.trim(),
    screenplayType,
    characters,
    scenes,
    createdAt: now,
    updatedAt: now,
  };

  writeScreenplays([screenplay, ...readScreenplays()]);

  return screenplay;
};

export const updateStoredScreenplay = (
  id: string,
  {
    characters,
    scenes,
    screenplayType,
    title,
  }: {
    characters: StoredScreenplayCharacter[];
    scenes: StoredScreenplayScene[];
    screenplayType: ScriptStyleValue;
    title: string;
  },
) => {
  let updatedScreenplay: StoredScreenplay | null = null;
  const screenplays = readScreenplays().map((screenplay) => {
    if (screenplay.id !== id) {
      return screenplay;
    }

    updatedScreenplay = {
      ...screenplay,
      title: title.trim(),
      screenplayType,
      characters,
      scenes,
      updatedAt: new Date().toISOString(),
    };

    return updatedScreenplay;
  });

  writeScreenplays(screenplays);

  return updatedScreenplay;
};

export const deleteStoredScreenplay = (id: string) => {
  writeScreenplays(readScreenplays().filter((screenplay) => screenplay.id !== id));
};
