const saveVehicle = require('./vehicle');   // function

// VEHICLE-1
let vehicle = {
    "id": 100,
    "name": "BMX X3",
    "price": 15000
};

let result = saveVehicle(vehicle);

if(result) {
    console.log("Vehicle saved successful.");
} else {
    console.log("Vehicle save failed!!!");
}

