import { useEffect, useRef, useState } from 'react'
import {
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  MapPin,
  Search,
  Sun,
  Wind,
} from 'lucide-react'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

function describeWeather(code) {
  if (code === 0) return { label: 'Clear sky', Icon: Sun }
  if (code === 1) return { label: 'Mainly clear', Icon: Sun }
  if (code === 2) return { label: 'Partly cloudy', Icon: CloudSun }
  if (code === 3) return { label: 'Overcast', Icon: Cloud }
  if ([45, 48].includes(code)) return { label: 'Foggy', Icon: Cloud }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Rain', Icon: CloudRain }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Snow', Icon: CloudSnow }
  if ([95, 96, 99].includes(code)) return { label: 'Thunderstorms', Icon: CloudLightning }
  return { label: 'Current conditions', Icon: CloudSun }
}

async function fetchWeather(city, signal) {
  const geocodingUrl = new URL(GEOCODING_URL)
  geocodingUrl.search = new URLSearchParams({ name: city, count: '1', language: 'en', format: 'json' })
  const geocodingResponse = await fetch(geocodingUrl, { signal })
  if (!geocodingResponse.ok) throw new Error('City search is temporarily unavailable. Try again in a moment.')

  const geocodingData = await geocodingResponse.json()
  const place = geocodingData.results?.[0]
  if (!place) throw new Error(`We couldn't find “${city}”. Try another city or check the spelling.`)

  const forecastUrl = new URL(FORECAST_URL)
  forecastUrl.search = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current_weather: 'true',
    timezone: 'auto',
  })
  const forecastResponse = await fetch(forecastUrl, { signal })
  if (!forecastResponse.ok) throw new Error('Current weather is temporarily unavailable. Try again in a moment.')

  const forecastData = await forecastResponse.json()
  if (!forecastData.current_weather) throw new Error('We couldn’t retrieve current conditions for that city. Please try again.')

  return {
    city: place.name,
    region: [place.admin1, place.country].filter((part) => part && part !== place.name).join(', '),
    temperature: forecastData.current_weather.temperature,
    windSpeed: forecastData.current_weather.windspeed,
    windUnit: forecastData.current_weather_units?.windspeed || 'km/h',
    code: forecastData.current_weather.weathercode,
  }
}

function LoadingSkeleton() {
  return (
    <div className="weather-skeleton" role="status" aria-label="Loading current weather">
      <span className="weather-skeleton-icon" />
      <span className="weather-skeleton-temp" />
      <span className="weather-skeleton-line" />
      <span className="weather-skeleton-wind" />
      <span className="visually-hidden">Finding current weather...</span>
    </div>
  )
}

export default function WeatherCard() {
  const [cityInput, setCityInput] = useState('')
  const [requestedCity, setRequestedCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const requestController = useRef(null)

  useEffect(() => {
    return () => requestController.current?.abort()
  }, [])

  async function loadCity(city) {
    requestController.current?.abort()
    const controller = new AbortController()
    requestController.current = controller
    setLoading(true)
    setError('')
    setWeather(null)

    try {
      const result = await fetchWeather(city, controller.signal)
      if (!controller.signal.aborted) setWeather(result)
    } catch (requestError) {
      if (!controller.signal.aborted) setError(requestError.message || 'Something went wrong. Please try again.')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  function search(event) {
    event.preventDefault()
    const city = cityInput.trim()
    if (!city) {
      requestController.current?.abort()
      requestController.current = null
      setRequestedCity('')
      setWeather(null)
      setError('')
      setLoading(false)
      return
    }
    setRequestedCity(city)
    loadCity(city)
  }

  return (
    <section className="panel weather-panel" aria-labelledby="weather-title">
      <div className="weather-heading">
        <div>
          <span className="eyebrow">A LITTLE OUTSIDE</span>
          <h2 id="weather-title">Weather check</h2>
          <p className="panel-subtitle">A quick look at what’s happening out there</p>
        </div>
        <span className="weather-heading-icon" aria-hidden="true"><CloudSun size={19} strokeWidth={1.7} /></span>
      </div>

      <form className="weather-search" onSubmit={search} role="search">
        <label className="visually-hidden" htmlFor="weather-city">Search a city for current weather</label>
        <MapPin size={16} aria-hidden="true" />
        <input
          id="weather-city"
          type="search"
          autoComplete="off"
          maxLength={80}
          placeholder="Search a city..."
          value={cityInput}
          onChange={(event) => setCityInput(event.target.value)}
        />
        <button type="submit" aria-label="Search city" disabled={!cityInput.trim()}><Search size={16} /></button>
      </form>

      <div className="weather-content" aria-live="polite" aria-atomic="true">
        {loading && <LoadingSkeleton />}

        {!loading && error && (
          <div className="weather-message weather-error" role="alert">
            <Cloud size={23} aria-hidden="true" />
            <p>{error}</p>
            <button type="button" className="weather-retry" onClick={() => loadCity(requestedCity)}>Retry</button>
          </div>
        )}

        {!loading && !error && weather && (() => {
          const { label, Icon } = describeWeather(weather.code)
          return (
            <div className="weather-result">
              <div className="weather-city"><span>{weather.city}</span>{weather.region && <small>{weather.region}</small>}</div>
              <div className="weather-current">
                <span className="weather-condition-icon"><Icon size={38} strokeWidth={1.45} aria-hidden="true" /></span>
                <strong className="weather-temperature">{Math.round(weather.temperature)}<span>°</span></strong>
                <span className="weather-condition">{label}</span>
              </div>
              <div className="weather-wind"><Wind size={16} aria-hidden="true" /><span>Wind</span><strong>{weather.windSpeed} {weather.windUnit}</strong></div>
            </div>
          )
        })()}

        {!loading && !error && !weather && (
          <div className="weather-message weather-empty">
            <span className="weather-empty-icon"><MapPin size={20} aria-hidden="true" /></span>
            <strong>Pick a place to begin</strong>
            <p>Search any city to see its current temperature and wind.</p>
          </div>
        )}
      </div>
      <div className="weather-attribution">Current conditions from Open-Meteo</div>
    </section>
  )
}
