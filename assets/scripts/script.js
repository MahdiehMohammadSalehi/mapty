'use strict'
const newWorkout=document.querySelector('.new_workout');
const inputDistance=document.querySelector('.input_distance');

let map,mapEvent;

if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(position){
        const{latitude,longitude}=position.coords;
        // const coords=[36.3307812,59.5517272];
        const coords=[latitude,longitude];
        map = L.map('map').setView(coords, 14);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.on('click',function(mapEvent){
        newWorkout.classList.remove('hidden');
        inputDistance.focus();
       
    })
        
    },function(){
        alert('cant get location')
    })
};

newWorkout.addEventListener('submit',function(e){
    console.log('i');
    
e.preventDefault();
// const {lat,lng}=mapEvent.latlng;
// L.marker([lat,lng]).addTo(map)
// .bindPopup(L.popup({
// maxWidth:250,
// minWidth:100,
// autoClose:false,
// closeOnClick:false,
// className:'running-popup',
// }))
// .setPopupContent('Workout').openPopup();
}
)
