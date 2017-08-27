var inquirer = require("inquirer");
var password_hash = require("password-hash");
var printResults = require("./helpers/printer.js");
var createOrderAndAddressTransaction = require("./helpers/queriesAndTransactions.js").createOrderAndAddressTransaction;
var placeMyOrderTransaction = require("./helpers/queriesAndTransactions.js").placeMyOrderTransaction;
var signUpTransaction = require("./helpers/queriesAndTransactions.js").signUpTransaction;
var connection;

var passwordLength = 4;
var currentCustomer = {};

var setCurrentCustomer = function(currentCust){
    currentCustomer = currentCust;
}

function validatePassword(input){
    if(input.length >= passwordLength){
        return true;
    }
    console.log("Password length must be 4 or more characters.");
    return false;
}

function inquirerCreateAddress(){
    var promise = inquirer.prompt([
        {
            type : "input",
            message : "Street Address:",
            validate : function(input){
                if(input.trim() !==  ""){
                    return true;
                } else {
                    return false;
                }
            },
            name : "addressLine",
        }, 
        {
            type : "input",
            message : "City:",
            validate : function(input){
                if(input.trim() !==  ""){
                    return true;
                } else {
                    return false;
                }
            },
            name : "myCity",
        },
        {
            type : "list",
            message : "State:",
            choices : ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'],
            name : "myState",
        },
        {
            type : "input",
            message : "5-Digit Zip Code:",
            validate : function(input){
                if(input.trim().length === 5 && !isNaN(input)){
                    return true;
                } else {
                    return false;
                }
            },
            name : "myZip",
        }
    ]);

    return promise;
}

function createOrderAddress(productId, quantity){
    var inqPromise = inquirerCreateAddress();
    inqPromise.then(function(inqRes){
        var addressObj = {
            address : inqRes.addressLine,
            city : inqRes.myCity,
            state : inqRes.myState,
            zip : inqRes.myZip,
        }
        createOrderAndAddressTransaction(connection,productId, quantity, addressObj, currentCustomer);
    });
}

function determineAddress(productId, quantity){
    var addressId = currentCustomer.id_addresses;
    connection.query("SELECT * FROM `Addresses` WHERE id = ?", addressId, function(addrErr, addrResp){
        if(addrErr) throw addrErr;
        var addr = addrResp[0];
        inquirer.prompt([
            {
                type : "confirm",
                message : "Use default billing and shipping address? (" + addr.address + " " + addr.city + " " + addr.state + " " + addr.zip + ")",
                default : true,
                name : "confirm",
            }
        ]).then(function(inqResp){
                if(inqResp.confirm){
                    placeMyOrderTransaction(connection, productId, quantity, addressId, currentCustomer);
                } else {
                    createOrderAddress(productId, quantity);
                }
        });
    });
}

function selectQuantity(productId){
    inquirer.prompt([
        {
            type : "input",
            message : "Enter the amount you would like to purchase:",
            validate : function(input){
                if( !isNaN(input) && ((input * 1) > 0)){
                    return true;
                }   
                return false;
            },
            default : 1,
            name : "amount",
        }
    ]).then(function(inqResp){
        determineAddress(productId, inqResp.amount);
    }).catch(function(err){
        connection.end();
        throw err;
    });
}

function selectProduct(){
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
        connection.query("SELECT * FROM `Products` WHERE id = ?", inqResp.prodId, function(err, resp){
            if(err) throw err;
            if(resp.length > 0){
                selectQuantity(resp[0].id);
            } else {
                console.log("There are no products with that ID");
                selectProduct();
            }
        });
    }).catch(function(err){
        connection.end();
        throw err;
    });
}

function displayAvailableProducts(){
    connection.query({
        sql : "SELECT * FROM `Products` WHERE `inventory` > 0",
        timeout : 40000,
    }, function(err, results){
        if(err) {
            throw err;
        } else {
            if(results.length > 0){
                printResults(results);
                selectProduct();
            } else {
                console.log("No available products. Please check again later");
                mainMenu();
            }
        }
    });
}

var mainMenu = function(){
    console.log("\n");
    var myChoices = [
        "Buy a Product",
        "Switch User",
        "Start Screen"
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
                break;
            case "Switch User" :
                logIn();
                break;
            case "Start Screen" :
                startPrompt();
                break;
            default :
                mainMenu();
        }
    }).catch(function(err){
        connection.end();
        throw err;
    });
}

function logIn(){
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
            name : "password",
        }
    ]).then(function(inqResp){
        if(validatePassword(inqResp.password)){
            connection.query("SELECT * FROM `Customers` WHERE email = ?", inqResp.email, function(err, queryResponse){
                if(err) throw err;
                if(queryResponse.length > 0){
                    if(password_hash.verify(inqResp.password,queryResponse[0].hash)){
                        currentCustomer = queryResponse[0];
                        mainMenu();
                    } else {
                        console.log("\nIncorrect Email/Password combination.");
                        logIn();
                    }
                } else {
                    console.log("\nThe email you provided does not exist.");
                    logIn();
                }
            });
        } else {
            logIn();
        }
    }).catch(function(err){
        connection.end();
        throw err;
    });
}

function signUp(){
    inquirer.prompt([
        {
            type : "input",
            message : "First Name:",
            validate : function(input){
                return (input.trim() !== "");
            },
            name : "fName",
        },
        {
            type : "input",
            message : "Last Name:",
            validate : function(input){
                return (input.trim() !== "");
            },
            name : "lName",
        },
        {
            type : "input",
            message : "Email:",
            validate : function(input){
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(input);
            },
            name : "myEmail",
        },
        {
            type : "password",
            message : "Password:",
            name : "password",
        }
    ]).then(function(inqRes){
        if(validatePassword(inqRes.password)){
            var passHash = password_hash.generate(inqRes.password, {
                algorithm : 'sha256',
                saltLength : 16,
            });
            var customerObj = {
                first_name : inqRes.fName,
                last_name : inqRes.lName,
                email : inqRes.myEmail,
                hash : passHash,
            }
            inqProm = inquirerCreateAddress();
            inqProm.then(function(inqAddrRes){
                var addressObj = {
                    address : inqAddrRes.addressLine,
                    city : inqAddrRes.myCity,
                    state : inqAddrRes.myState,
                    zip : inqAddrRes.myZip,
                }
                signUpTransaction(connection, customerObj, addressObj);
            }).catch(function(inqAddrErr){
                connection.end();
                throw inqAddrErr;
            });
        } else {
            signUp();
        }
    }).catch(function(err){
        connection.end();
        throw err;
    });
}

function startPrompt(){
    var myChoices = [
        "Log In",
        "Sign Up",
        "Exit Application"
    ];
    inquirer.prompt([
        {
            type : "list",
            message : "Welcome to Bamazon!",
            choices : myChoices,
            name : "choice",
        }
    ]).then(function(inquirerResult){
        switch (inquirerResult.choice){
            case "Log In" :
                logIn();
                break;
            case "Sign Up" :
                signUp();
                break;
            case "Exit Application" :
                connection.end();
                break;
            default :
                startPrompt();
        }
    }).catch(function(err){
        connection.end();
        throw err;
    });
}

var bamazonCustomer = function(myConn){
    connection = myConn;
    startPrompt();
}

exports.setCurrentCustomer = setCurrentCustomer;
exports.mainMenu = {
    execute : function(){
        mainMenu();
    }
}
exports.displayAvailableProducts = {
    execute : function(){
        displayAvailableProducts();
    }
}
exports.bamazonCustomer = bamazonCustomer;
