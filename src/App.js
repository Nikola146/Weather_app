import React, { useState, useEffect, useContext } from 'react';
import './App.css';
import translations from './translations.json';

// Компонент контекста для управления интерфейсом
const InterfaceContext = React.createContext();

// Обертка для управления настройками интерфейса
function InterfaceManager({ children }) {
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Сохранение настроек интерфейса в localStorage
    localStorage.setItem('language', language);
    localStorage.setItem('theme', theme);
  }, [language, theme]);

  useEffect(() => {
    // Извлечение настроек интерфейса из localStorage при загрузке
    const savedLanguage = localStorage.getItem('language');
    const savedTheme = localStorage.getItem('theme');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const interfaceValues = {
    language,
    setLanguage,
    theme,
    setTheme,
  };

  return (
    <InterfaceContext.Provider value={interfaceValues}>
      {children}
    </InterfaceContext.Provider>
  );
}

// Компонент отображения погоды
function WeatherDisplay({ weatherData }) {
  const { name, temperature, description } = weatherData;
  const interfaceContext = useContext(InterfaceContext);
  const translationsForLanguage = translations[interfaceContext.language];

  // Функция для получения соответствующего смайлика на основе описания погоды
  const getWeatherEmoji = (description) => {
    const weatherEmojis = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Thunderstorm: "⛈️",
      Drizzle: "🌦️",
      Snow: "❄️",
      Mist: "🌫️",
      Smoke: "🌫️",
      Haze: "🌫️",
      Dust: "🌫️",
      Fog: "🌫️",
      Sand: "🌫️",
      Ash: "🌋",
      Squall: "💨",
      Tornado: "🌪️",
    };

    const emoji = weatherEmojis[description] || "❓";
    return emoji;
  };

  const weatherEmoji = getWeatherEmoji(description);

  return (
    <div>
      <h2 className="weather-title">
        {translationsForLanguage.cityLabel}: {name}
      </h2>
      <h2 className="weather-title">{translationsForLanguage.weatherTitle}</h2>
      <p className="temperature">
        {translationsForLanguage.temperatureLabel}: {(temperature - 273.15).toFixed(2)}°C
      </p>
      <p className="description">
        {translationsForLanguage.descriptionLabel}: {weatherEmoji}
      </p>
    </div>
  );
}


// Компонент выбора языка интерфейса
function LanguageSelector() {
  const interfaceContext = useContext(InterfaceContext);
  const translationsForLanguage = translations[interfaceContext.language];

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    interfaceContext.setLanguage(selectedLanguage);
  };

  return (
    <select className="language-selector" onChange={handleLanguageChange} value={interfaceContext.language}>
      <option value="en">{translationsForLanguage.languageOptionEN}</option>
      <option value="ru">{translationsForLanguage.languageOptionRU}</option>
      <option value="et">{translationsForLanguage.languageOptionET}</option>
    </select>
  );
}

// Компонент выбора темы интерфейса
function ThemeSelector() {
  const interfaceContext = useContext(InterfaceContext);
  const translationsForLanguage = translations[interfaceContext.language];

  const handleThemeChange = (e) => {
    const selectedTheme = e.target.value;
    interfaceContext.setTheme(selectedTheme);
  };

  return (
    <select className="theme-selector" onChange={handleThemeChange} value={interfaceContext.theme}>
      <option value="light">{translationsForLanguage.themeOptionLight}</option>
      <option value="dark">{translationsForLanguage.themeOptionDark}</option>
    </select>
  );
}

// Компонент приложения для прогноза погоды
function WeatherApp() {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState('London'); // Состояние для выбранного города
  const interfaceContext = useContext(InterfaceContext);
  const translationsForLanguage = translations[interfaceContext.language];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=73aa94941f78f8dc71a49142e84bfa7d`
        );
        const data = await response.json();
        setWeatherData({
          name: data.name,
          temperature: data.main.temp,
          description: data.weather[0].main,
        });
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchData();
  }, [city]); // Обновлять данные при изменении выбранного города

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  return (
    <div className={`weather-app ${interfaceContext.theme}`}>
      <h1 className="app-title">{translationsForLanguage.appTitle}</h1>
      <div className="settings">
        <LanguageSelector />
        <ThemeSelector />
      </div>
      <div>
        <label htmlFor="cityInput"></label>
        <input
          placeholder={translationsForLanguage.cityLabel}
          type="text"
          id="cityInput"
          value={city}
          onChange={handleCityChange}
        />
      </div>
      {weatherData && <WeatherDisplay weatherData={weatherData} />}
    </div>
  );
}


function App() {
  return (
    <InterfaceManager>
      <WeatherApp />
    </InterfaceManager>
  );
}

export default App;
