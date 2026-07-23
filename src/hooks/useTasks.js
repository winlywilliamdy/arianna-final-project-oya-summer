import { useCallback, useMemo } from "react";
import { normalizeTask } from "../lib/normalize";
import { todayISO } from "../lib/dates";
import { useData } from "../lib/DataProvider";

function taskStatus(task) {
  if (task.cancelled) return "cancelled";
  if (task.completed) return "done";
  if (task.missing) return "missing";
  if (task.dueDate && task.dueDate === todayISO()) return "almost";
  return "overdue";
}

export function useTasks() {
  const { bundle, setTasks, setDeletedTasks, updateBundle } = useData();

  const tasks = useMemo(
    () => (Array.isArray(bundle.tasks) ? bundle.tasks.map(normalizeTask) : []),
    [bundle.tasks]
  );

  const deletedTasks = useMemo(
    () => (Array.isArray(bundle.deletedTasks) ? bundle.deletedTasks : []),
    [bundle.deletedTasks]
  );

  const sortedTasks = useMemo(() => {
    const statusOrder = { missing: 0, overdue: 1, almost: 2, done: 3, cancelled: 4 };
    return [...tasks].sort((a, b) => {
      const sa = statusOrder[taskStatus(a)] ?? 5;
      const sb = statusOrder[taskStatus(b)] ?? 5;
      if (sa !== sb) return sa - sb;
      const da = a.dueDate ? a.dueDate : "9999-99-99";
      const db = b.dueDate ? b.dueDate : "9999-99-99";
      if (da !== db) return da.localeCompare(db);
      const ta = a.dueTime || "";
      const tb = b.dueTime || "";
      if (ta !== tb) return ta.localeCompare(tb);
      return a.title.localeCompare(b.title);
    });
  }, [tasks]);

  const upsertTask = useCallback(
    (payload) => {
      setTasks((prev) => {
        const list = (prev || []).map(normalizeTask);
        const existing = list.find((t) => t.id === payload.id);
        if (existing) {
          return list.map((t) => (t.id === payload.id ? normalizeTask({ ...existing, ...payload }) : t));
        }
        return [...list, normalizeTask(payload)];
      });
    },
    [setTasks]
  );

  const patchTask = useCallback(
    (id, patch) => {
      setTasks((prev) => (prev || []).map((t) => (t.id === id ? normalizeTask({ ...t, ...patch }) : t)));
    },
    [setTasks]
  );

  const toggleComplete = useCallback(
    (id) => {
      setTasks((prev) =>
        (prev || []).map((t) =>
          t.id === id
            ? normalizeTask({ ...t, completed: !t.completed, cancelled: false, missing: false })
            : t
        )
      );
    },
    [setTasks]
  );

  const toggleCancelled = useCallback(
    (id) => {
      setTasks((prev) =>
        (prev || []).map((t) =>
          t.id === id
            ? normalizeTask({ ...t, cancelled: !t.cancelled, completed: false, missing: false })
            : t
        )
      );
    },
    [setTasks]
  );

  const toggleMissing = useCallback(
    (id) => {
      setTasks((prev) =>
        (prev || []).map((t) =>
          t.id === id
            ? normalizeTask({ ...t, missing: !t.missing, completed: false, cancelled: false })
            : t
        )
      );
    },
    [setTasks]
  );

  const deleteTask = useCallback(
    (id) => {
      updateBundle((prev) => {
        const list = prev.tasks || [];
        const task = list.find((t) => t.id === id);
        if (!task) return prev;
        return {
          ...prev,
          tasks: list.filter((t) => t.id !== id),
          deletedTasks: [
            { ...normalizeTask(task), deletedAt: new Date().toISOString() },
            ...(prev.deletedTasks || []),
          ],
        };
      });
    },
    [updateBundle]
  );

  const restoreTask = useCallback(
    (id) => {
      updateBundle((prev) => {
        const list = prev.deletedTasks || [];
        const task = list.find((t) => t.id === id);
        if (!task) return prev;
        const { deletedAt, ...rest } = task;
        return {
          ...prev,
          deletedTasks: list.filter((t) => t.id !== id),
          tasks: [normalizeTask(rest), ...(prev.tasks || [])],
        };
      });
    },
    [updateBundle]
  );

  const permanentlyDeleteTask = useCallback(
    (id) => {
      setDeletedTasks((prev) => (prev || []).filter((t) => t.id !== id));
    },
    [setDeletedTasks]
  );

  return {
    tasks: sortedTasks,
    deletedTasks,
    upsertTask,
    patchTask,
    toggleComplete,
    toggleCancelled,
    toggleMissing,
    deleteTask,
    restoreTask,
    permanentlyDeleteTask,
    taskStatus,
  };
}
