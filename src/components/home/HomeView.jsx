import { greetingText } from "../modals/NameModals";

export default function HomeView({ wallpaper, userName, clock, date, now, weatherText, uvText }) {
  const greeting = greetingText(userName, now);

  return (
    <section className="view home-view">
      <div
        className="home-wallpaper"
        style={wallpaper ? { backgroundImage: `url("${wallpaper}")` } : undefined}
      />
      <div className="home-overlay" />
      <div className="home-center">
        {greeting ? <div className="home-greeting">{greeting}</div> : null}
        <div className="place-name">Jakarta, Indonesia</div>
        <div className="live-clock">{clock}</div>
        <div className="live-date">{date}</div>
        <div className="weather-row">
          <div className="weather-chip">
            <span>Weather</span> {weatherText}
          </div>
          <div className="weather-chip">
            <span>UV</span> {uvText}
          </div>
        </div>
      </div>
    </section>
  );
}
