const mysql = require('mysql2')


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hirani4536',
    database: 'inventory'
  })
//   const sql = 'CREATE TABLE inventory (inventory_name VARCHAR(255) NOT NULL, inventory_category VARCHAR(255) NOT NULL, expiry_time DATETIME, quantity int(255) NOT NULL , manufacturing_time DATETIME NOT NULL, inventory_image BLOB NOT NULL, inventory_id BIGINT UNSIGNED AUTO_INCREMENT, PRIMARY KEY(inventory_id))'
//   connection.query(sql, (err, result)=>{
//     if(err){
//         throw err
//     }
//     console.log('conncected')
//   })
module.exports = connection