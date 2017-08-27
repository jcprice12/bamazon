
var connection;
var inquirer = require("inquirer");
var printResults = require("./helpers/printer.js");

var viewAllProductsManager = function(){
    connection.query("SELECT * FROM `Products`", function(err, resp){
        if(err) throw err;
        printResults(resp);
        startManagerPrompt();
    });
}

function startManagerPrompt(){
    myChoices = [
        "View Products for Sale",
        "View Low Inventory",
        "Add To Inventory",
        "Add New Product",
        "Exit Application"
    ];
    inquirer.prompt([
        {
            type : "list",
            message : "What would you like to do?",
            choices : myChoices,
            name : "action"
        }
    ]).then(function(inqResp){
        switch (inqResp.action){
            case "View Products for Sale":
                viewAllProductsManager();
                break;
            case "Exit Application":
                connection.end();
                break;
            default :
                startPrompt();
        }
    });
}

function welcomeScreen(){
    console.log("\nWelcome to Bamazon Manager!\n");
    startManagerPrompt();
}

var bamazonManager = function(myConn){
    connection = myConn;
    welcomeScreen();
}


exports.bamazonManager = bamazonManager;