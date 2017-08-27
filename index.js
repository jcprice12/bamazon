var mysql = require("mysql");
var bamazonCustomer = require("./bamazonCustomer.js").bamazonCustomer;
var bamazonManager = require("./bamazonManager.js").bamazonManager;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_db"
});

connection.connect(function(err) {
    if(err) throw err;
    if(process.argv.length === 3){
        switch (process.argv[2]){
            case "customer" :
                bamazonCustomer(connection);
                break;
            case "manager" : 
                bamazonManager(connection);
                break;
            default :
                console.log("command not recognized");
                connection.end();
        }
    } else {
        console.log("Invalid command-line args");
        connection.end();
    }
});