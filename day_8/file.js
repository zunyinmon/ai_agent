const fs = require('fs');

fs.writeFileSync('car.txt', 'BMW\nMercedes\nAudi', 'utf8');

const cars = fs.readFileSync('car.txt', 'utf8')
console.log(cars)