"use strict";
const form = document.querySelector(".form");
const inputDistance = document.querySelector(".input_distance");
const inputDuration = document.querySelector(".input_duration");
const inputCadence = document.querySelector(".input_cadence");
const inputElevation = document.querySelector(".input_elevation");
const inputSelector = document.querySelector(".input_selector");

class App {
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();
    form.addEventListener("keydown", this._newWorkout.bind(this));
    inputSelector.addEventListener("change", this._changeSelector);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._displayMap.bind(this),
        function () {
          alert("cant get location");
        }
      );
    }
  }

  _displayMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, 14);

    L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    form.classList.remove("hidden");
    inputDistance.focus();
    this.#mapEvent = mapE;
  }

  _newWorkout(e) {
    if (e.key == "Enter") {
      e.preventDefault();

      const { lat, lng } = this.#mapEvent.latlng;
      L.marker([lat, lng])
        .addTo(this.#map)
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
  }
  _changeSelector() {
    inputElevation.closest(".row").classList.toggle("hidden_row");
    inputCadence.closest(".row").classList.toggle("hidden_row");
  }
}
const app = new App();

//
