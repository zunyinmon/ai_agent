// 5 objects 
let car1 ={id: 12, name: 'BMW X5', price: 25000};
let car2 ={id: 13, name: 'Audi A4', price: 30000};
let car3 ={id: 14, name: 'Mercedes C-Class', price: 35000};
let car4 ={id: 15, name: 'Toyota Camry', price: 25000};
let car5 ={id: 16, name: 'Honda Accord', price: 28000};

console.log(car1);
console.log("car2 price: " + car2.price);
console.log("car3 price: " + car3.price);
console.log("car4 price: " + car4.price);
console.log("car5 price: " + car5.price);

console.log("car3 price: " + car3['price'] + " and name: " + car3['name']);