var inquirer = require("inquirer");
var printResults = require("./helpers/printer.js");
var queryHelper = require("./helpers/queriesAndTransactions.js");
var connection;

var viewAllProductsManager = function(){
    connection.query("SELECT * FROM `Products`", function(err, resp){
        if(err) throw err;
        printResults(resp);
        startManagerPrompt();
    });
}

var viewLowInv = function(){
    connection.query("SELECT * FROM `Products` WHERE `inventory` < 5", function(err, resp){
        if(err) throw err;
        printResults(resp);
        startManagerPrompt();
    });
}

var addInv = function(){
    inquirer.prompt([
        {
            type : "input",
            message : "Enter the id of the product you would like to add inventory to:",
            validate : function(input){
                if(!isNaN(input) && ((input * 1) > 0)){
                    return true;
                }
                return false;
            },
            name : "prodId",
        },
        {
            type : "input",
            message : "How many units would you like to add to the product's inventory?",
            validate : function(input){
                if(!isNaN(input) && ((input * 1) > 0)){
                    return true;
                }
                return false;
            },
            name : "amount",
        }
    ]).then(function(inqResp){
        queryHelper.addStock(connection, inqResp.prodId, inqResp.amount);
    });
}

var startManagerPrompt = function(){
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
            case "View Low Inventory":
                viewLowInv();
                break
            case "Add To Inventory":
                addInv();
                break
            case "Exit Application":
                connection.end();
                break;
            default :
                startManagerPrompt();
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

exports.startManagerPrompt = startManagerPrompt;
exports.addInv = addInv;
exports.bamazonManager = bamazonManager;