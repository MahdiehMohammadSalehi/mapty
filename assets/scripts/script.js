"use strict";
const form = document.querySelector(".form");
const inputDistance = document.querySelector(".input_distance");
const inputDuration = document.querySelector(".input_duration");
const inputCadence = document.querySelector(".input_cadence");
const inputElevation = document.querySelector(".input_elevation");
const inputSelector = document.querySelector(".input_selector");

let map, mapEvent;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude, longitude } = position.coords;
      // const coords=[36.3307812,59.5517272];
      const coords = [latitude, longitude];
      map = L.map("map").setView(coords, 14);

      L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on("click", function (mapE) {
        form.classList.remove("hidden");
        inputDistance.focus();
        mapEvent = mapE;
      });
    },
    function () {
      alert("cant get location");
    }
  );
}

form.addEventListener("keydown", function (e) {
  if (e.key == "Enter") {
    e.preventDefault();

    const { lat, lng } = mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: "running-popup",
        })
      )
      .setPopupContent("Workout")
      .openPopup();
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        "";
  }
});

inputSelector.addEventListener("change", function () {
  inputElevation.closest(".row").classList.toggle("hidden_row");
  inputCadence.closest(".row").classList.toggle("hidden_row");
});
