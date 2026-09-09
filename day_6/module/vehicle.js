function saveVehicle(vehicle) {
    // validation
    if (vehicle ["id"] == "" || vehicle ["name"] == "" || vehicle ["price"] < 0) {
        return false;
    } else {
        return true;
    }
}

// function add() {}
// function sub() {}

module.exports = saveVehicle;
// module.exports = {saveVehicle, add, sub};