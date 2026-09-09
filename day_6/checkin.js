// Conceptual Model of an Airport
// Entrance
    //Terminal
        //Security
            //Gate
                //Boarding Pass (Passport + air ticket)

                // CheckIn => PP + Ticket => Boarding Pass => Gate => Security => Terminal => Entrance (Function)
// KoKo
let passport = true;
let ticket = true;

// MgMg
let mmpassport = true;
let mmticket = true;

// decision = passport && tickets:
// if + operators (and) = true, successful boarding / denied boarding

// if (condition True) {}
// if (1 > 1) { console.log("5 is greater than 1")}
// if (passport && ticket) { console.log("Pass")}
// else {console.log("Denied")}

// if (mmpassport && mmticket) { console.log("Pass")}
// else {console.log("Denied")}

function checkIn(hasPassport, hasTicket){
    if (hasPassport && hasTicket) {
        console.log("Check-in successful. Please proceed to security.");
        return true;
    } else {
        console.log("Check-in failed. Please ensure you have all required documents.");
        return false;
    }
}
// let mgmg = checkIn (true,true); //true, true => true
// let susu = checkIn (true,false); // true, false => false

// console.log(mgmg)
// console.log(susu)

// if (mgmg){console.log("MgMg can board the plane.")} else {console.log("MgMg cannot board the plane.")}
// if (susu){console.log("Susu can board the plane.")} else {console.log("Susu cannot board the plane.")}

module.exports = checkIn;