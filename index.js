var mysql = require("mysql");
var bamazonCustomer = require("./bamazonCustomer.js").bamazonCustomer;
var bamazonManager = require("./bamazonManager.js").bamazonManager;
var bamazonSupervisor = require("./bamazonSupervisor.js").bamazonSupervisor;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_db"
});

var commands = {
    "customer" : function(connection){
        bamazonCustomer(connection);
    },
    "manager" : function(connection){
        bamazonManager(connection);
    },
    "supervisor" : function(connection){
        bamazonSupervisor(connection);
    }
}

function printCommands(){
    console.log("\nAvailable Commands Are:");
    for(key in commands){
        console.log(key);
    }
}

connection.connect(function(err) {
    if(err) throw err;
    if(process.argv.length === 3){
        var command = process.argv[2];
        if(commands.hasOwnProperty(command)){
            commands[command](connection);
        } else {
            console.log("\nCommand \"" + command + "\" is not recognized");
            connection.end();
            printCommands();
        }
    } else {
        console.log("Invalid command-line args");
        connection.end();
    }
});