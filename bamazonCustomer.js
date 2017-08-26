var inquirer = require("inquirer");
var password_hash = require("password-hash");
var connection = require("./mySQLConnection.js");

var cellDivider = " | ";
var startCellDivider = "| ";

function getMaxWidthEachColumn(data){
    var lengths = [];
    for(key in data[0]){
        lengths.push(key.length);
    }
    for(var i = 0; i < data.length; i++){
        counter = 0;
        for(key in data[i]){
            if((data[i][key] + "").length > lengths[counter]){
                lengths[counter] = (data[i][key] + "").length;
            }
            counter++;
        }
    }
    return lengths;
}

function printRowDivider(lengths){
    var total = lengths.reduce(function(sum, value) {
        return sum + value;
    }, 0);
    total += ((lengths.length * cellDivider.length) + 1); 
    rowStr = "";
    for(var i = 0; i < total; i++){
        rowStr += "-";
    }
    console.log(rowStr);
}

function myPad(str, number){;
    for(var i = 0; i < number; i++){
        str += " ";
    }
    return str;
}

function printResults(results){
    var lengths = getMaxWidthEachColumn(results);
    printRowDivider(lengths);
    var counter;
    for(var i = 0; i < results.length; i++){
        counter = 0;
        if(i === 0){
            var headerString = startCellDivider;
            for(key in results[i]){
                headerString += (myPad(key, (lengths[counter] - key.length)) + cellDivider);
                counter++;
            }
            counter = 0;
            console.log(headerString);  
            printRowDivider(lengths);
        }
        var rowStr = startCellDivider;
        for(key in results[i]){
            rowStr += (myPad((results[i][key]+""), (lengths[counter] - (results[i][key]+"").length)) + cellDivider);
            counter++;
        }
        console.log(rowStr);
    }
    printRowDivider(lengths);
}

function displayAvailableProducts(){
    connection.query({
        sql : "SELECT * FROM `Products` WHERE `inventory` > 0",
        timeout : 40000,
    }, function(err, results){
        if(err) {
            console.log(err);
            mainMenu();
        } else {
            if(results.length > 0){
                printResults(results);
                inquirer.prompt([
                    {
                        type : "input",
                        message : "Enter the id of the product you'd like to buy:",
                        validate : function(input){
                            return !(isNaN(input));
                        },
                        name : "prodId",
                    },
                ]).then(function(inqResp){
                    
                }).catch(function(err){
                    console.log(err);
                    displayAvailableProducts();
                });
            } else {
                console.log("No available products. Please check again later");
                mainMenu();
            }
        }
    });
}

function mainMenu(){
    console.log("\n");
    var myChoices = [
        "Buy a Product",
        "Switch User",
        "Exit Application"
    ];
    inquirer.prompt([
        {
            type : "list",
            message : "What would you like to do?",
            choices : myChoices,
            name : "mainAction",
        },
    ]).then(function(inqResp){
        switch(inqResp.mainAction){
            case "Buy a Product" :
                displayAvailableProducts();
                break
            case "Switch User" :
                startPrompt();
                break
            case "Exit Application" :
                connection.end();
                break
            default :
                mainMenu();
        }
    }).catch(function(err){
        throw err;
    });
}

function startPrompt(){
    console.log("\nWelcome to Bamazon! Please log in.\n");
    inquirer.prompt([
        {
            type : "input",
            message : "Email:",
            validate : function(input){
                return input !== "";
            },
            name : "email",
        },
        {
            type : "password",
            message : "Password:",
            valdate : function(input){
                if(input.length >= 4){
                    return true;
                }
                return false;
            },
            name : "password",
        }
    ]).then(function(inqResp){
        connection.query("SELECT `hash` FROM `Customers` WHERE email = ?", inqResp.email, function(err, queryResponse){
            if(err) throw err;
            if(queryResponse.length > 0){
                if(password_hash.verify(inqResp.password,queryResponse[0].hash)){
                    mainMenu();
                } else {
                    console.log("\nIncorrect Email/Password combination.");
                    startPrompt();
                }
            } else {
                console.log("\nThe email you provided does not exist.");
                startPrompt();
            }
        });
    }).catch(function(err){
        throw err;
    })
}

connection.connect(function(err){
    if(err){
        throw err;
    }
    startPrompt();
});