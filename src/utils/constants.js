export const STORAGE_KEYS = {
  SEEN_WELCOME: "sidekick_seen_welcome",
  DARK_MODE: "sidekick_dark_mode",
  FORMAT_PRESETS: "sidekick_format_presets",
  conversations: (uid) => `sidekick_conversations_${uid}`,
  apiKey: (uid) => `sidekick_apikey_${uid}`,
};
