// Container for car objects
// 1 object => 1 car

// values keep in array container, index 0 starting point

let teams = ["Team A", "Team B", "Team C", "Team D", "Team E"]; // value

let cars = [
   {id: 12, name: 'BMW X5', price: 25000}, 
   {id: 13, name: 'Audi A4', price: 30000}, 
   {id: 14, name: 'Mercedes C-Class', price: 35000},
   {id: 15, name: 'Toyota Camry', price: 25000}, 
   {id: 16, name: 'Honda Accord', price: 28000} 
];


// console.log(teams[0]);
// console.log(cars[0]['price']);

// console.log(teams[0]);
// console.log(cars[0]);

// console.log(teams[2]);
// console.log(cars[2]);

// array of data, list of data, use looping
// loop => array (list)
// for (let team of teams) {
//     for (let car of cars) {
//         console.log(team);
//         console.log(car);
// }
// }

console.log("Cars List:")
console.log("=======")
for (let car of cars) {
        console.log(car['name'] + " price: " + car['price']);
}

// method, filter, map, reduce, find. sort, forEach, some, every, if