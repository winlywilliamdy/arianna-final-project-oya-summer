export const DUE_LABELS = ["immediate", "tmrw", "urgent", "none"];
export const ALL_LABELS = DUE_LABELS;

export const LABEL_DISPLAY = {
  immediate: "Immediate",
  tmrw: "Tomorrow",
  urgent: "Urgent",
  none: "No date",
};

export const TYPE_LABELS = [
  { key: "missing", label: "MISSING", icon: "!" },
  { key: "homework", label: "HOMEWORK", icon: "📖" },
  { key: "classwork", label: "CLASSWORK", icon: "🏫" },
  { key: "project", label: "PROJECT", icon: "👥" },
  { key: "summative", label: "SUMMATIVE", icon: "💡" },
  { key: "formative", label: "FORMATIVE", icon: "📄" },
  { key: "meeting", label: "MEETING", icon: "💻" },
  { key: "daily", label: "DAILY", icon: "👨‍👩‍👧‍👦" },
];

export const TASK_PROMPTS = [
  "What's next on your list?",
  "Anything you want to remember?",
  "What would help you feel on track?",
  "What's one thing worth doing today?",
  "Got something to jot down?",
  "What needs a little attention?",
  "What's calling for your focus?",
  "Anything on your mind right now?",
  "What small step could you take?",
  "What's worth showing up for today?",
];

export const FONT_CLASSES = [
  "font-american-classic",
  "font-sans-serif",
  "font-times",
  "font-playfair",
];

export const DEFAULT_ACCENT = "#9a8ad8";

export const JAKARTA_TZ = "Asia/Jakarta";
export const JAKARTA_LAT = -6.2088;
export const JAKARTA_LON = 106.8456;

export const MONTH_LETTERS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export const DEFAULT_MOODS = [
  { id: "good", label: "Good", emoji: "😊", color: "#c8e6c9" },
  { id: "ok", label: "Ok", emoji: "😐", color: "#f0eeea" },
  { id: "happy", label: "Happy", emoji: "😄", color: "#fff3b0" },
  { id: "motivated", label: "Motivated", emoji: "💪", color: "#c5e8b8" },
  { id: "energetic", label: "Energetic", emoji: "⚡", color: "#f8c8dc" },
  { id: "anxious", label: "Anxious", emoji: "😰", color: "#ffd4a8" },
  { id: "tired", label: "Tired", emoji: "😴", color: "#d4c4f0" },
  { id: "sad", label: "Sad", emoji: "😢", color: "#b8d4f0" },
  { id: "angry", label: "Angry", emoji: "😠", color: "#f5a8a8" },
];

export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const ALARM_SCHEDULES = {
  everyday: "Every day",
  weekdays: "Weekdays",
  weekends: "Weekends",
  tomorrow: "Tomorrow",
  today: "Today only",
};

export const MIN_GOALS = 3;

export const EVENT_PARTS = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
  { id: "night", label: "Night" },
];

export const EVENT_TIME_RANGES = {
  // Hourly slots only — user picks a specific hour in the selected part of day
  morning: { hours: [5, 6, 7, 8, 9, 10, 11] },
  afternoon: { hours: [12, 13, 14, 15, 16, 17, 18] },
  evening: { hours: [18, 19, 20] },
  night: { hours: [21, 22, 23, 0, 1, 2, 3, 4] },
};
