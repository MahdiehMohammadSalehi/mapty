"use strict";

class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; //km
    this.duration = duration; //min
  }

  _description() {
    // prettier-ignore
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._description();
  }
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this._description();
  }
  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
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
const workoutList = document.querySelector(".workout_list");

class App {
  #map;
  #mapEvent;
  #workouts = [];
  #zoom = 14;

  constructor() {
    this._getPosition();
    form.addEventListener("keydown", this._newWorkout.bind(this));
    inputSelector.addEventListener("change", this._changeSelector);
    workoutList.addEventListener("click", this.#mapZoom.bind(this));
    this._getLocalStorage();
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
    this.#map = L.map("map").setView(coords, this.#zoom);

    L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#workouts.forEach((work) => this._displayMarker(work));
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
      this.#workouts.push(workout);
      this._displayMarker(workout);
      this._setLocalStorage();

      //display workout
      this._displayWorkout(workout);

      //clear and hide the form
      this._hideForm();
    }
  }

  _hideForm() {
    //prettier-ignore
    inputCadence.value =
    inputDistance.value =
    inputDuration.value =
    inputElevation.value =
      "";
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 100);
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
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♀️" : "🚴"} ${workout.description}`
      )
      .openPopup();
  }

  _displayWorkout(workout) {
    let html = `
    <li class="workout workout_${workout.type}" data-id="${workout.id}">
    <h2 class="workout_title">${workout.description}</h2> 
    <div class="workout_details">
        <span class="workout_icon">${
          workout.type === "running" ? "🏃‍♀️" : "🚴"
        }</span>
        <span class="workout_value">${workout.distance}</span>
        <span class="workout_unit">km</span>
    </div>
    <div class="workout_details">
        <span class="workout_icon">🕐</span>
        <span class="workout_value">${workout.duration}</span>
        <span class="workout_unit">min</span>
    </div>`;

    if (workout.type === "running") {
      html += ` <div class="workout_details">
    <span class="workout_icon">⚡️</span>
    <span class="workout_value">${workout.pace.toFixed(1)}</span>
    <span class="workout_unit">min/km</span>
    </div>
    <div class="workout_details">
    <span class="workout_icon">🦶🏼</span>
    <span class="workout_value">${workout.cadence}</span>
    <span class="workout_unit">spm</span>
    </div>
    </li>`;
    }

    if (workout.type === "cycling") {
      html += `
      <div class="workout workout_details">
      <span class="workout_icon">⚡️</span>
      <span class="workout_value">${workout.speed.toFixed(1)}</span>
      <span class="workout_unit">km/h</span>
  </div>
  <div class="workout_details">
      <span class="workout_icon">🏔️</span>
      <span class="workout_value">${workout.elevation}</span>
      <span class="workout_unit">m</span>
  </div>
  </li>`;
    }
    form.insertAdjacentHTML("afterend", html);
  }
  #mapZoom(e) {
    const workoutEl = e.target.closest(".workout");
    if (!workoutEl) return;
    const workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );
    // console.log(workout);

    this.#map.setView(workout.coords, this.#zoom, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  _setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workouts"));
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach((work) => this._displayWorkout(work));
  }
  reset() {
    localStorage.removeItem("workouts");
    location.reload();
  }
}

const app = new App();
