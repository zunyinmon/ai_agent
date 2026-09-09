const Database = require('better-sqlite3');

const db = new Database('cars.db');

// const columns = db.prepare('PRAGMA table_info(cars)').all();
// const hasExpectedSchema = columns.some((column) => column.name === 'make') &&
// 	columns.some((column) => column.name === 'color');

// if (columns.length > 0 && !hasExpectedSchema) {
// 	db.prepare('DROP TABLE cars').run();
// }

// db.prepare(`
// 	CREATE TABLE IF NOT EXISTS cars (
// 		id INTEGER PRIMARY KEY AUTOINCREMENT,
// 		make TEXT,
// 		color TEXT
// 	)
// `).run();

const cars = db.prepare('SELECT * FROM cars').all();

for (let car of cars) {
    console.log(car['id'], car['make'], car['color']);
}

// insert a new car into the database
// db.prepare(`INSERT INTO cars (make, color) VALUES (?, ?)`
// ).run('Toyota', 'White');
// db.prepare(`INSERT INTO cars (make, color) VALUES (?, ?)`
// ).run('BMW', 'Black');

// update the make of the car with id 2 to 'Toyota'
// db.prepare(`
//   UPDATE cars
//   SET make = ?
//   WHERE make = ?
// `).run('Toyota', 'BMW');

// update the color of the car with id 2 to 'BMW'
// db.prepare(`
//   UPDATE cars
//   SET make = ?
//   WHERE id = ?
// `).run('BMW', 2);


// // SQL (RDBMS - Table)
// // insert, select, update, delete