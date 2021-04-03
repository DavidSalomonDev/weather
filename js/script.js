'use strict'

// Selecting all the elements from the DOM
const searchInput = document.querySelector('.weather__search')
const city = document.querySelector('.weather__city')
const day = document.querySelector('.weather__day')
const humidity = document.querySelector('.weather__indicator--humidity>.value')
const wind = document.querySelector('.weather__indicator--wind>.value')
const pressure = document.querySelector('.weather__indicator--pressure>.value')
const image = document.querySelector('.weather__image')
const temperature = document.querySelector('.weather__temperature>.value')
const forecastBlock = document.querySelector('.weather__forecast')
const datalist = document.getElementById('suggestions')

// Weather images

const weatherImages = [{
        url: 'images/clear-sky.png',
        ids: [800]
    },
    {
        url: 'images/broken-clouds.png',
        ids: [803, 804]
    },
    {
        url: 'images/few-clouds.png',
        ids: [801]
    },
    {
        url: 'images/mist.png',
        ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781]
    },
    {
        url: 'images/rain.png',
        ids: [500, 501, 502, 503, 504]
    },
    {
        url: 'images/scattered-clouds.png',
        ids: [802]
    },
    {
        url: 'images/shower-rain.png',
        ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321]
    },
    {
        url: 'images/snow.png',
        ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622]
    },
    {
        url: 'images/thunderstorm.png',
        ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232]
    }
]

// Getting API key
const weatherAPIKey = 'dd4949cb452401f2ce21e5d04f7f7d49'
const weatherBaseEndpoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + weatherAPIKey
const forecastBaseEndpoint = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + weatherAPIKey
const geocodingBaseEndpoint = `http://api.openweathermap.org/geo/1.0/direct?&limit=5&appid=${weatherAPIKey}&q=`

// Fetching data from API
const getWeatherByCityName = async city => {
    let endpoint = weatherBaseEndpoint + '&q=' + city
    let response = await fetch(endpoint)
    let weather = await response.json();
    return weather
}

// Getting city ID for forecast
const getForecastByCityID = async id => {
    const endpoint = `${forecastBaseEndpoint}&id=${id}`
    const result = await fetch(endpoint)
    const forecast = await result.json()
    const forecastList = forecast.list
    const daily = []

    forecastList.forEach(day => {
        let date = new Date(day.dt_txt.replace(' ', 'T'))
        let hours = date.getHours()
        if (hours === 12) {
            daily.push(day)
        }
    })
    return daily
}

// Seach for City
const weatherForCity = async city => {
    let weather = await getWeatherByCityName(city)
    if(weather.cod === '404'){
        return
    }
    let cityID = weather.id
    updateCurrentWeather(weather)
    let forecast = await getForecastByCityID(cityID)
    updateForecast(forecast)

}

// Getting city info from the search bar
searchInput.addEventListener('keydown', async e => {
    if (e.keyCode === 13) {
        weatherForCity(searchInput.value)
    }
})

// Show options for multiple cities
searchInput.addEventListener('input', async () => {
    if (searchInput.value.length <= 2) {
        return
    }
    const endpoint = geocodingBaseEndpoint + searchInput.value
    const result = await (await fetch(endpoint)).json()
    datalist.innerHTML = ''
    result.forEach(city => {
        const option = document.createElement('option')
        option.value = `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`
        datalist.appendChild(option)
    })

})

// Update weather information
const updateCurrentWeather = (data) => {
    city.textContent = `${data.name}, ${data.sys.country}`
    day.textContent = dayOfWeek()
    humidity.textContent = data.main.humidity
    temperature.textContent = data.main.temp > 0 ? `+${Math.round(data.main.temp)}` : Math.round(data.main.temp)
    pressure.textContent = data.main.pressure
    let windDirection
    let deg = data.wind.deg
    if (deg > 45 && deg <= 135) {
        windDirection = 'East'
    } else if (deg > 135 && deg <= 225) {
        windDirection = 'South'
    } else if (deg > 225 && deg <= 315) {
        windDirection = 'West'
    } else {
        windDirection = 'North'
    }
    wind.textContent = `${windDirection}, ${data.wind.speed}`
    const imgID = data.weather[0].id
    weatherImages.forEach(obj => {
        if (obj.ids.includes(imgID)) {
            image.src = obj.url
        }
    })
}
// Forecast
const updateForecast = (forecast) => {
    forecastBlock.innerHTML = ''
    forecast.forEach(day => {
        const iconURL = `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`
        const dayName = dayOfWeek(day.dt * 1000)
        const temperature = day.main.temp > 0 ? `+${Math.round(day.main.temp)}` : Math.round(day.main.temp)
        const forecastItem = `
            <article class="weather__forecast__item">
                <img src="${iconURL}" alt="${day.weather[0].description}" class="weather__forecast__icon">
                <h3 class="weather__forecast__day">${dayName}</h3>
                <p class="weather__forecast__temperature"><span class="value">${temperature}</span> &deg;C</p>
            </article>
        `
        forecastBlock.insertAdjacentHTML('beforeend', forecastItem)
    })
}

// Setting current day
const dayOfWeek = (dt = new Date().getTime()) => {
    return new Date(dt).toLocaleDateString('en-EN', {
        'weekday': 'long'
    })
}

// Initial city displayed
const init = async () =>{
    await weatherForCity('San Salvador')
    document.body.style.filter = 'blur(0)'
}
init()