"use strict";

class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; //km
    this.duration = duration; //min
    this.calcPace;
  }
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcSpeed();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class Cycling extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
  }
}

/////////////////////////////////////////
//aplication architecture
const form = document.querySelector(".form");
const inputDistance = document.querySelector(".input_distance");
const inputDuration = document.querySelector(".input_duration");
const inputCadence = document.querySelector(".input_cadence");
const inputElevation = document.querySelector(".input_elevation");
const inputSelector = document.querySelector(".input_selector");

class App {
  #map;
  #mapEvent;
  #workout = [];

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

  _changeSelector() {
    inputElevation.closest(".row").classList.toggle("hidden_row");
    inputCadence.closest(".row").classList.toggle("hidden_row");
  }

  _newWorkout(e) {
    if (e.key == "Enter") {
      e.preventDefault();

      const isNumber = (...inputs) =>
        inputs.every((inp) => Number.isFinite(inp));

      const isPositive = (...inputs) => inputs.every((inp) => inp >= 0);

      //get data from form
      const type = inputSelector.value;
      const distance = +inputDistance.value;
      const duration = +inputDuration.value;
      const { lat, lng } = this.#mapEvent.latlng;
      let workout;

      //check if inputs are valid
      if (type === "running") {
        const cadence = +inputCadence.value;

        if (
          !isNumber(distance, duration, cadence) ||
          !isPositive(distance, duration, cadence)
        )
          return alert("please enter a positive number!");
        //create new object
        workout = new Running([lat, lng], distance, duration, cadence);
      }

      if (type === "cycling") {
        const elevation = +inputElevation.value;
        if (
          !isNumber(distance, duration, elevation) ||
          !isPositive(distance, duration)
        )
          return alert("please enter a positive number!");
        //create new object
        workout = new Cycling([lat, lng], distance, duration, elevation);
      }

      //add new object to workout array
      this.#workout = workout;
      this._displayMarker(workout);

      //clear the form
      inputCadence.value =
        inputDistance.value =
        inputDuration.value =
        inputElevation.value =
          "";
    }
  }
  _displayMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.distance}`)
      .openPopup();
  }
}

const app = new App();
