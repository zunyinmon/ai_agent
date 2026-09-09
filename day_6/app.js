const checkIn = require('./checkin')
const boardingPass = require('./boardpass')

let mgmg = checkIn (true,true); //true, true => true
let susu = checkIn (true,false); // true, false => false