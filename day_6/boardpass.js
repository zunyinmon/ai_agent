function boarding(hasPassport, hasTicket){
    if (hasPassport && hasTicket) {
        console.log("Boarding successful. Please proceed to your gate.");
        return true;
    } else {
        console.log("Boarding failed. Please ensure you have all required documents.");
        return false;
    }
}

module.exports = boarding;