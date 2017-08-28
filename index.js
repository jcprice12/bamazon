//dependencies
var mysql = require("mysql");
var bamazonCustomer = require("./bamazonCust/bamazonCustomer.js").bamazonCustomer;
var bamazonManager = require("./bamazonMan/bamazonManager.js").bamazonManager;
var bamazonSupervisor = require("./bamazonSuper/bamazonSupervisor.js").bamazonSupervisor;

//connection parameters established with mysql
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_db"
});

//available commands
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

//print commands if user entered an unknown command
function printCommands(){
    console.log("\nAvailable Commands Are:");
    for(key in commands){
        console.log(key);
    }
}

//start up connection. starts app based on command-line arg given. see available commands in the commands obj
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
        printCommands();
        connection.end();
    }
});