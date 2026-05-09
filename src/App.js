import "./App.css";
import Map from "./Map";
import axios from "axios";
import { useState } from "react";

function App() {
  const [location, setLocation] = useState("");
  const [tripText, setTripText] = useState("");
  const [position, setPosition] = useState([22.9734, 78.6569]);
  const [loading, setLoading] = useState(false);
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [placeImages, setPlaceImages] = useState({});
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");

  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalMode, setArrivalMode] = useState("");
  

  const fetchPlaceMarkers = async (tripData) => {

  let allMarkers = [];

  for (const day of tripData) {

    for (const place of day.places) {

      try {

        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${place.name}`
        );

        if (response.data.length > 0) {

          allMarkers.push({
            name: place.name,
            lat: parseFloat(response.data[0].lat),
            lon: parseFloat(response.data[0].lon),
          });

        }

      } catch (err) {
        console.log(err);
      }
    }
  }

  setSelectedMarkers(allMarkers);
};

  const fetchPlaceImages = async (tripData) => {

  let imageObj = {};

  for (const day of tripData) {

    for (const place of day.places) {

      try {
        const PEXELS_KEY = process.env.REACT_APP_PEXELS_API_KEY;

        const response = await axios.get(
          `https://api.pexels.com/v1/search?query=${place.name} ${location} tourist place&per_page=1`,
          {
            headers: {
              Authorization: PEXELS_KEY,
            },
          }
        );

        imageObj[place.name] =
          response.data.photos[0]?.src?.large;

      } catch (err) {
        console.log(err);
      }
    }
  }

  setPlaceImages(imageObj);
};

  const handlePlanTrip = async () => {

    if (loading) return;

    setLoading(true);

    if (
      !location ||
      !arrivalDate ||
      !arrivalTime ||
      !departureDate ||
      !departureTime ||
      !arrivalMode
    ) {
      alert("Please enter location and days");
      return;
    }

    const geoResponse = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${location}`
    );

    if (geoResponse.data.length > 0) {
      const lat = parseFloat(geoResponse.data[0].lat);
      const lon = parseFloat(geoResponse.data[0].lon);

      setPosition([lat, lon]);
    }

    try {

      setLoading(true);

      const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `
                  Create a travel itinerary for ${location}.

                  Arrival:
                  ${arrivalDate} at ${arrivalTime}

                  Departure:
                  ${departureDate} at ${departureTime}

                  Plan the trip according to available time.

                  Return ONLY valid JSON in this format:

                  [
                    {
                      "day": 1,
                      "places": [
                        {
                          "from": "9:00 AM",
                          "to": "11:00 AM",
                          "name": "Place Name",
                          "description": "Short real description",
                          "distance": "1 km from Red Fort"
                        }
                      ]
                    }
                  ]

                  Distance should include previous place name.
                  Example: "1 km from Red Fort"

                  Include approximate distance from previous place.

                  Traveler will arrive via ${arrivalMode}.

                  The first tourist place should be near the arrival location.

                  If Airport, start itinerary from airport nearby attractions.

                  If Railway Station, start from railway station nearby attractions.

                  Only return JSON.
                  `
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
        
      );

      console.log(response.data);

      

      const text =
        response.data.candidates[0].content.parts[0].text;

      console.log(text);

      const cleanText =
        text.replace(/```json/g, "").replace(/```/g, "").trim();

      let parsedData = [];

      try {
        parsedData = JSON.parse(cleanText);
        console.log(parsedData);
        setTripText(parsedData);

        await fetchPlaceImages(parsedData);

        setTimeout(() => {
          document.querySelector(".trip-result")?.scrollIntoView({
            behavior: "smooth",
          });
        }, 500);

        await fetchPlaceMarkers(parsedData);
      } catch (err) {
        console.log("JSON Parse Error:", err);
        console.log(cleanText);
      }

      

      setLoading(false);

    } catch (error) {

      console.log(error);
      setLoading(false);
      alert("AI Error");
    }
  }

  const handleDayClick = async (dayPlan) => {

  const placesWithCoords = [];

  for (const place of dayPlan.places) {

    try {

      const geoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${place.name}, ${location}`
      );

      if (geoResponse.data.length > 0) {

        placesWithCoords.push({
          name: place.name,
          lat: parseFloat(geoResponse.data[0].lat),
          lon: parseFloat(geoResponse.data[0].lon),
        });

      }

    } catch (err) {
      console.log(err);
    }
  }

  setSelectedMarkers(placesWithCoords);

  if (placesWithCoords.length > 0) {

    setPosition([
      placesWithCoords[0].lat,
      placesWithCoords[0].lon,
    ]);

  }
};

  return (
  <>
    <video autoPlay loop muted className="video-bg">
      <source src="/video.mp4" type="video/mp4" />
    </video>

    <div className="overlay"></div>

    <div className="content">
      <h1 className="hero-title">
        Plan Your Trip 
      </h1>

      <p>Explore the world smartly</p>

      <div className="search-box">

        <input
          type="text"
          placeholder="📍 Enter destination"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <select
          value={arrivalMode}
          onChange={(e) => setArrivalMode(e.target.value)}
        >
          <option value="">Select Arrival Mode</option>
          <option value="Airport">✈️ Airport</option>
          <option value="Railway Station">🚆 Railway Station</option>
        </select>

        <input
          type="date"
          value={arrivalDate}
          onChange={(e) => setArrivalDate(e.target.value)}
        />

        <input
          type="time"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
        />

        <input
          type="date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
        />

        <input
          type="time"
          value={departureTime}
          onChange={(e) => setDepartureTime(e.target.value)}
        />

        <button onClick={handlePlanTrip} disabled={loading}>
          {loading ? "Generating Trip..." : "✨ Plan Trip"}
        </button>

      </div>
    </div>

    <div className="map-section">
      <div className="map-box">
        <Map
          position={position}
          markers={selectedMarkers}
        />
      </div>
    </div>

    {tripText && (
      <div className="trip-result">

        <h2>Your Trip Planner</h2>

        {tripText.map((dayPlan, index) => (
          <div
            key={index}
            className="day-card"
            onClick={() => handleDayClick(dayPlan)}
          >

            <h3>Day {dayPlan.day}</h3>

            {dayPlan.places.map((place, idx) => (
              <div key={idx} className="place-card">

              <img
                src={
                  placeImages[place.name]
                    ? placeImages[place.name]
                    : "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg"
                }
                alt={place.name}
                className="place-image"
              />
                <div className="place-info">

                  <p>
                    ⏰ <strong>Time:</strong> {place.from} - {place.to}
                  </p>

                  <p>
                    📍 <strong>Place:</strong> {place.name}
                  </p>

                  <p>
                    🚗 {place.distance}
                  </p>

                  <p className="place-description">
                    {place.description}
                  </p>

                </div>

              </div>
            ))}

          </div>
        ))}

      </div>
    )}

  </>
);
}

export default App;