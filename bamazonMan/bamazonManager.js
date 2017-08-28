//dependencies
var inquirer = require("inquirer");
var printResults = require("./../helpers/printer.js");
var manQueryHelper = require("./localHelpers/manQueryHelper.js");

//connection object (passed in from index.js)
var connection;

//simple select query. query handled in this file
var viewAllProductsManager = function(){
    connection.query("SELECT * FROM `Products`", function(err, resp){
        if(err) throw err;
        printResults(resp);
        startManagerPrompt();
    });
}

//simple select query. query handled in this file
var viewLowInv = function(){
    connection.query("SELECT * FROM `Products` WHERE `inventory` < 5", function(err, resp){
        if(err) throw err;
        printResults(resp);
        startManagerPrompt();
    });
}

//inqurier asks what you want to add inventory to, and how much
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
        //query helper does the update
        manQueryHelper.addStock(connection, inqResp.prodId, inqResp.amount);
    });
}

//inquirer asks user some info about new product
var addNewProduct = function(){
    connection.query("SELECT `department_name` FROM `Departments`", function(selErr, selRes){
        if(selErr) throw err;
        if(selRes.length > 0){
            var depts = [];
            for(var i = 0; i < selRes.length; i++){
                depts.push(selRes[i].department_name);
            }
            inquirer.prompt([
                {
                    type : "input",
                    message : "Name of Product:",
                    validate : function(input){
                        return (input !== "" && input.length <= 50);
                    },
                    name : "prodName",
                },
                {
                    type : "input",
                    message : "Price of Product:",
                    validate : function(input){
                        if(!isNaN(input) && ((input * 1) > 0)){
                            return true;
                        }
                        return false;
                    },
                    name : "prodPrice",
                },
                {
                    type : "list",
                    message : "Department",
                    choices : depts,
                    name : "deptName",
                },
            ]).then(function(inqResp){
                var myPrice = parseFloat(Math.round(inqResp.prodPrice * 100) / 100).toFixed(2);
                //create object to insert (note that inventory automatically set to 0)
                var prodToInsert = {
                    product_name : inqResp.prodName,
                    price : myPrice,
                    name_departments : inqResp.deptName,
                    inventory : 0,
                }
                //query helper takes care of the insert
                manQueryHelper.insertProd(connection,prodToInsert);
            });
        } else {
            console.log("Cannot add a new product because there are no departments in the Database.");
        }
    });
}

//main menu
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
            case "Add New Product":
                addNewProduct();
                break
            case "Exit Application":
                connection.end();
                break;
            default :
                startManagerPrompt();
        }
    });
}

//merely used to separate welcome to bamazon prompt from main menu on startup
function welcomeScreen(){
    console.log("\nWelcome to Bamazon Manager!\n");
    startManagerPrompt();
}

//called by index.js
var bamazonManager = function(myConn){
    connection = myConn;
    welcomeScreen();
}


//export my functions
exports.startManagerPrompt = startManagerPrompt;
exports.addInv = addInv;
exports.bamazonManager = bamazonManager;