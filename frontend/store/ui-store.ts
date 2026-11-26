import { create } from "zustand";

export type DockTool = "soql-runner" | "ticket-cleaner" | "warranty-lookup" | "manual-search";
export type DockWidth = "compact" | "wide" | "split";

export interface CaseOwnerSummary {
  id: string;
  name: string;
  ownerId: string;
  isActive: boolean;
}

export function normalizeCaseOwnerRecords(rawOwners: unknown): CaseOwnerSummary[] {
  if (!Array.isArray(rawOwners)) return [];
  const records: CaseOwnerSummary[] = [];

  for (const item of rawOwners) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const id = typeof rec.id === "string" ? rec.id.trim() : "";
    const name = typeof rec.name === "string" ? rec.name.trim() : "";
    const ownerId = typeof rec.ownerId === "string" ? rec.ownerId.trim() : "";
    const isActive = typeof rec.isActive === "boolean" ? rec.isActive : true;

    if (!name || !ownerId) continue;
    records.push({
      id: id || ownerId,
      name,
      ownerId,
      isActive,
    });
  }

  return records.sort((a, b) => a.name.localeCompare(b.name));
}

interface UIState {
  sidebarCollapsed: boolean;
  sidebarHovered: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  setSidebarHovered: (value: boolean) => void;
  onSidebarHoverStart: () => void;
  onSidebarHoverEnd: () => void;
  onMenuButtonMouseLeave: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (value: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (value: boolean) => void;

  // Multi-Tasking Split Dock
  dockOpen: boolean;
  dockTool: DockTool;
  dockWidth: DockWidth;
  toggleDock: (tool?: DockTool) => void;
  setDockOpen: (open: boolean) => void;
  setDockTool: (tool: DockTool) => void;
  setDockWidth: (width: DockWidth) => void;

  // Keyboard Shortcuts Modal
  shortcutsModalOpen: boolean;
  setShortcutsModalOpen: (open: boolean) => void;

  // Wallpaper & Background Atmosphere
  wallpaperId: string;
  wallpaperOpacity: number;
  wallpaperSpeed: "adaptive" | "ultra" | "normal" | "slow" | "paused";
  wallpaperModalOpen: boolean;
  setWallpaperId: (id: string) => void;
  setWallpaperOpacity: (opacity: number) => void;
  setWallpaperSpeed: (speed: "adaptive" | "ultra" | "normal" | "slow" | "paused") => void;
  setWallpaperModalOpen: (open: boolean) => void;

  // Startup Case Owner Identity & Vertical Name Rail (Synced directly with Case Owners master)
  activeUserId: string;
  activeUserName: string;
  activeUserOwnerId: string;
  askNameOnStart: boolean;
  userModalOpen: boolean;
  userIdentityHydrated: boolean;
  caseOwnersList: CaseOwnerSummary[];
  caseOwnersLoadState: "idle" | "loading" | "ready" | "error";
  hydrateUserIdentity: () => void;
  refreshCaseOwners: () => Promise<void>;
  syncCaseOwnersFromTable: (owners: CaseOwnerSummary[]) => void;
  setActiveUser: (user: { id?: string; name: string; ownerId: string }) => void;
  clearActiveUser: () => void;
  setAskNameOnStart: (value: boolean) => void;
  setUserModalOpen: (open: boolean) => void;
  dismissUserModalForSession: () => void;
}

const USER_ID_STORAGE_KEY = "meghdoot_active_user_id";
const USER_NAME_STORAGE_KEY = "meghdoot_active_user_name";
const USER_OWNER_ID_STORAGE_KEY = "meghdoot_active_user_owner_id";
const ASK_NAME_FIRST_STORAGE_KEY = "meghdoot_ask_name_first";
const SESSION_USER_PROMPTED_KEY = "meghdoot_user_prompted_session";

let caseOwnersFetchSeq = 0;

function persistActiveUserStorage(id: string, name: string, ownerId: string) {
  if (typeof window === "undefined") return;
  if (!name) {
    window.localStorage.removeItem(USER_ID_STORAGE_KEY);
    window.localStorage.removeItem(USER_NAME_STORAGE_KEY);
    window.localStorage.removeItem(USER_OWNER_ID_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(USER_ID_STORAGE_KEY, id);
  window.localStorage.setItem(USER_NAME_STORAGE_KEY, name);
  window.localStorage.setItem(USER_OWNER_ID_STORAGE_KEY, ownerId);
}

function resolveSyncedUser(
  owners: CaseOwnerSummary[],
  current: { activeUserId: string; activeUserName: string; activeUserOwnerId: string }
): { activeUserId: string; activeUserName: string; activeUserOwnerId: string; changed: boolean } {
  const { activeUserId, activeUserName, activeUserOwnerId } = current;
  if (!activeUserId && !activeUserOwnerId && !activeUserName) {
    return { activeUserId: "", activeUserName: "", activeUserOwnerId: "", changed: false };
  }

  const activeOwners = owners.filter((owner) => owner.isActive);
  const matched =
    (activeUserId ? activeOwners.find((o) => o.id === activeUserId) : undefined) ||
    (activeUserOwnerId
      ? activeOwners.find((o) => o.ownerId.toLowerCase() === activeUserOwnerId.toLowerCase())
      : undefined) ||
    (!activeUserOwnerId && activeUserName
      ? activeOwners.find((o) => o.name.toLowerCase() === activeUserName.toLowerCase())
      : undefined);

  if (!matched) {
    return { activeUserId: "", activeUserName: "", activeUserOwnerId: "", changed: true };
  }

  const changed =
    matched.id !== activeUserId ||
    matched.name !== activeUserName ||
    matched.ownerId !== activeUserOwnerId;

  return {
    activeUserId: matched.id,
    activeUserName: matched.name,
    activeUserOwnerId: matched.ownerId,
    changed,
  };
}

let hoverCloseTimer: ReturnType<typeof setTimeout> | null = null;
let hoverSuppressedUntilLeave = false;

export const useUIStore = create<UIState>((set, get) => ({
  // Auto-minimized by default as requested
  sidebarCollapsed: true,
  sidebarHovered: false,

  // Click 3 lines (or collapse toggle): lock/pin open ("extract name") or minimize again
  toggleSidebar: () => {
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
      hoverCloseTimer = null;
    }
    set((state) => {
      const nextCollapsed = !state.sidebarCollapsed;
      if (nextCollapsed) {
        hoverSuppressedUntilLeave = true;
      } else {
        hoverSuppressedUntilLeave = false;
      }
      return {
        sidebarCollapsed: nextCollapsed,
        sidebarHovered: false,
      };
    });
  },

  setSidebarCollapsed: (value) => {
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
      hoverCloseTimer = null;
    }
    hoverSuppressedUntilLeave = value;
    set({ sidebarCollapsed: value, sidebarHovered: false });
  },

  setSidebarHovered: (value) => {
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
      hoverCloseTimer = null;
    }
    set({ sidebarHovered: value });
  },

  onSidebarHoverStart: () => {
    if (hoverSuppressedUntilLeave) return;
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
      hoverCloseTimer = null;
    }
    set({ sidebarHovered: true });
  },

  onSidebarHoverEnd: () => {
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
    }
    hoverCloseTimer = setTimeout(() => {
      set({ sidebarHovered: false });
      hoverCloseTimer = null;
    }, 200);
  },

  onMenuButtonMouseLeave: () => {
    hoverSuppressedUntilLeave = false;
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
    }
    hoverCloseTimer = setTimeout(() => {
      set({ sidebarHovered: false });
      hoverCloseTimer = null;
    }, 200);
  },

  mobileSidebarOpen: false,
  setMobileSidebarOpen: (value) => set({ mobileSidebarOpen: value }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (value) => set({ commandPaletteOpen: value }),

  // Multi-Tasking Split Dock
  dockOpen: false,
  dockTool: "soql-runner",
  dockWidth: "compact",
  toggleDock: (tool) => {
    set((state) => {
      if (tool && tool !== state.dockTool) {
        return { dockOpen: true, dockTool: tool };
      }
      return { dockOpen: !state.dockOpen, dockTool: tool || state.dockTool };
    });
  },
  setDockOpen: (open) => set({ dockOpen: open }),
  setDockTool: (tool) => set({ dockTool: tool, dockOpen: true }),
  setDockWidth: (width) => set({ dockWidth: width }),

  // Keyboard Shortcuts Modal
  shortcutsModalOpen: false,
  setShortcutsModalOpen: (open) => set({ shortcutsModalOpen: open }),

  // Wallpaper & Background Atmosphere
  wallpaperId:
    typeof window !== "undefined"
      ? window.localStorage.getItem("meghdoot_wallpaper_id") || "aurora"
      : "aurora",
  wallpaperOpacity:
    typeof window !== "undefined"
      ? parseFloat(window.localStorage.getItem("meghdoot_wallpaper_opacity") || "0.85")
      : 0.85,
  wallpaperSpeed:
    typeof window !== "undefined"
      ? ((window.localStorage.getItem("meghdoot_wallpaper_speed") as any) || "adaptive")
      : "adaptive",
  wallpaperModalOpen: false,

  setWallpaperId: (id: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("meghdoot_wallpaper_id", id);
    }
    set({ wallpaperId: id });
  },

  setWallpaperOpacity: (opacity: number) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("meghdoot_wallpaper_opacity", String(opacity));
    }
    set({ wallpaperOpacity: opacity });
  },

  setWallpaperSpeed: (speed: "adaptive" | "ultra" | "normal" | "slow" | "paused") => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("meghdoot_wallpaper_speed", speed);
    }
    set({ wallpaperSpeed: speed });
  },

  setWallpaperModalOpen: (open: boolean) => set({ wallpaperModalOpen: open }),

  // Startup Case Owner Identity & Vertical Name Rail (SSR-safe defaults, synced with Case Owners DB)
  activeUserId: "",
  activeUserName: "",
  activeUserOwnerId: "",
  askNameOnStart: true,
  userModalOpen: false,
  userIdentityHydrated: false,
  caseOwnersList: [],
  caseOwnersLoadState: "idle",

  hydrateUserIdentity: () => {
    if (typeof window === "undefined" || get().userIdentityHydrated) return;
    const savedId = (window.localStorage.getItem(USER_ID_STORAGE_KEY) || "").trim();
    const savedName = (window.localStorage.getItem(USER_NAME_STORAGE_KEY) || "").trim();
    const savedOwnerId = (window.localStorage.getItem(USER_OWNER_ID_STORAGE_KEY) || "").trim();
    const rawAskFirst = window.localStorage.getItem(ASK_NAME_FIRST_STORAGE_KEY);
    const askFirst = rawAskFirst === null ? true : rawAskFirst === "true";
    const promptedThisSession = window.sessionStorage.getItem(SESSION_USER_PROMPTED_KEY) === "1";

    set({
      activeUserId: savedId,
      activeUserName: savedName,
      activeUserOwnerId: savedOwnerId,
      askNameOnStart: askFirst,
      userIdentityHydrated: true,
      userModalOpen: !promptedThisSession && (askFirst || !savedName),
    });

    void get().refreshCaseOwners();
  },

  refreshCaseOwners: async () => {
    if (typeof window === "undefined") return;
    const seq = ++caseOwnersFetchSeq;
    set({ caseOwnersLoadState: "loading" });

    try {
      const response = await fetch("/api/case-owners", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to fetch Case Owners (${response.status})`);
      }
      const data = (await response.json()) as { owners?: unknown };
      if (seq !== caseOwnersFetchSeq) return;

      const owners = normalizeCaseOwnerRecords(data.owners);
      const state = get();
      const synced = resolveSyncedUser(owners, state);
      if (synced.changed) {
        persistActiveUserStorage(synced.activeUserId, synced.activeUserName, synced.activeUserOwnerId);
      }

      const promptedThisSession = window.sessionStorage.getItem(SESSION_USER_PROMPTED_KEY) === "1";
      const shouldPromptMissing =
        state.userIdentityHydrated && !promptedThisSession && (state.askNameOnStart || !synced.activeUserName);

      set({
        caseOwnersList: owners,
        caseOwnersLoadState: "ready",
        activeUserId: synced.activeUserId,
        activeUserName: synced.activeUserName,
        activeUserOwnerId: synced.activeUserOwnerId,
        ...(shouldPromptMissing ? { userModalOpen: true } : {}),
      });
    } catch {
      if (seq !== caseOwnersFetchSeq) return;
      set({ caseOwnersLoadState: "error" });
    }
  },

  syncCaseOwnersFromTable: (ownersInput: CaseOwnerSummary[]) => {
    caseOwnersFetchSeq += 1;
    const owners = normalizeCaseOwnerRecords(ownersInput);
    const state = get();
    const synced = resolveSyncedUser(owners, state);
    if (synced.changed) {
      persistActiveUserStorage(synced.activeUserId, synced.activeUserName, synced.activeUserOwnerId);
    }

    set({
      caseOwnersList: owners,
      caseOwnersLoadState: "ready",
      activeUserId: synced.activeUserId,
      activeUserName: synced.activeUserName,
      activeUserOwnerId: synced.activeUserOwnerId,
    });
  },

  setActiveUser: ({ id = "", name, ownerId }) => {
    const cleanId = id.trim();
    const cleanName = name.trim();
    const cleanOwnerId = ownerId.trim();
    persistActiveUserStorage(cleanId, cleanName, cleanOwnerId);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SESSION_USER_PROMPTED_KEY, "1");
    }
    set({
      activeUserId: cleanId,
      activeUserName: cleanName,
      activeUserOwnerId: cleanOwnerId,
      userModalOpen: false,
    });
  },

  clearActiveUser: () => {
    persistActiveUserStorage("", "", "");
    set({ activeUserId: "", activeUserName: "", activeUserOwnerId: "" });
  },

  setAskNameOnStart: (value: boolean) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ASK_NAME_FIRST_STORAGE_KEY, String(value));
    }
    set({ askNameOnStart: value });
  },

  setUserModalOpen: (open: boolean) => set({ userModalOpen: open }),

  dismissUserModalForSession: () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SESSION_USER_PROMPTED_KEY, "1");
    }
    set({ userModalOpen: false });
  },
}));
