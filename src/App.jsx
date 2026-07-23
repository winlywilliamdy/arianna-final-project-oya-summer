import { useState } from "react";
import AuthView from "./components/auth/AuthView";
import Sidebar from "./components/layout/Sidebar";
import HomeView from "./components/home/HomeView";
import TasksView from "./components/tasks/TasksView";
import DeletedView from "./components/deleted/DeletedView";
import SettingsView from "./components/settings/SettingsView";
import RoutineView from "./components/routine/RoutineView";
import EventsView from "./components/events/EventsView";
import { NameSetupModal, NameTipModal } from "./components/modals/NameModals";
import { useJakartaClock, useWeather } from "./hooks/useJakartaClock";
import { useSettings } from "./hooks/useSettings";
import { useTasks } from "./hooks/useTasks";
import { useEvents, useGoals, useMoods, useSleep } from "./hooks/useRoutine";
import { useAuth } from "./lib/AuthProvider";
import { useData } from "./lib/DataProvider";

export default function App() {
  const { status: authStatus, isAuthenticated, user, logout } = useAuth();
  const [view, setView] = useState("home");
  const { status, error } = useData();
  const { clock, date, now } = useJakartaClock();
  const { weatherText, uvText } = useWeather();
  const settings = useSettings();
  const tasksApi = useTasks();
  const moodsApi = useMoods();
  const goalsApi = useGoals();
  const sleepApi = useSleep();
  const eventsApi = useEvents();

  if (authStatus === "loading") {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-brand">Planner</div>
          <p className="auth-subtitle">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <>
      <Sidebar view={view} onNavigate={setView} accountName={user?.username} onLogout={logout} />
      <main className="app-main">
        {status !== "ready" && status !== "idle" ? (
          <div
            style={{
              position: "fixed",
              right: 16,
              bottom: 16,
              zIndex: 50,
              background: status === "error" || status === "offline" ? "#ffe0e0" : "#eef6ff",
              border: "1px solid #d0d8e0",
              borderRadius: 12,
              padding: "8px 12px",
              fontSize: 12,
              color: "#333",
              maxWidth: 280,
            }}
          >
            {status === "loading" && "Syncing your account…"}
            {status === "offline" && (error || "Offline — local cache only")}
            {status === "error" && (error || "Save failed")}
          </div>
        ) : null}
        {view === "home" ? (
          <HomeView
            wallpaper={settings.wallpaper}
            userName={settings.userName}
            clock={clock}
            date={date}
            now={now}
            weatherText={weatherText}
            uvText={uvText}
          />
        ) : null}

        {view === "tasks" ? (
          <TasksView
            tasks={tasksApi.tasks}
            deletedCount={tasksApi.deletedTasks.length}
            onNavigateDeleted={() => setView("deleted")}
            upsertTask={tasksApi.upsertTask}
            patchTask={tasksApi.patchTask}
            toggleComplete={tasksApi.toggleComplete}
            toggleCancelled={tasksApi.toggleCancelled}
            toggleMissing={tasksApi.toggleMissing}
            deleteTask={tasksApi.deleteTask}
            clock={clock}
            date={date}
          />
        ) : null}

        {view === "deleted" ? (
          <DeletedView
            deletedTasks={tasksApi.deletedTasks}
            onRestore={tasksApi.restoreTask}
            onPermanentDelete={tasksApi.permanentlyDeleteTask}
            onBack={() => setView("tasks")}
          />
        ) : null}

        {view === "settings" ? (
          <SettingsView
            userName={settings.userName}
            setUserName={settings.setUserName}
            wallpaper={settings.wallpaper}
            setWallpaper={settings.setWallpaper}
            theme={settings.theme}
            setTheme={settings.setTheme}
            accent={settings.accent}
            setAccent={settings.setAccent}
            font={settings.font}
            setFont={settings.setFont}
            accountUsername={user?.username}
            accountEmail={user?.email}
            onLogout={logout}
          />
        ) : null}

        {view === "routine" ? (
          <RoutineView
            moods={moodsApi.moods}
            setMoods={moodsApi.setMoods}
            entries={moodsApi.entries}
            setTodayMood={moodsApi.setTodayMood}
            goals={goalsApi.goals}
            updateGoal={goalsApi.updateGoal}
            addGoal={goalsApi.addGoal}
            removeGoal={goalsApi.removeGoal}
            sleep={sleepApi.sleep}
            addAlarm={sleepApi.addAlarm}
            toggleAlarm={sleepApi.toggleAlarm}
            removeAlarm={sleepApi.removeAlarm}
            saveNight={sleepApi.saveNight}
            setTimer={sleepApi.setTimer}
          />
        ) : null}

        {view === "events" ? (
          <EventsView
            events={eventsApi.events}
            addEvent={eventsApi.addEvent}
            updateEvent={eventsApi.updateEvent}
            removeEvent={eventsApi.removeEvent}
          />
        ) : null}
      </main>

      <NameSetupModal
        open={settings.showNameSetup}
        onFinalize={(name) => {
          settings.setUserName(name);
          settings.setShowNameSetup(false);
          settings.setShowNameTip(true);
        }}
      />
      <NameTipModal open={settings.showNameTip} onDismiss={() => settings.setShowNameTip(false)} />
    </>
  );
}
