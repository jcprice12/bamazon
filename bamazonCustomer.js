var inquirer = require("inquirer");
var password_hash = require("password-hash");
var connection = require("./mySQLConnection.js");

var passwordLength = 4;
var cellDivider = " | ";
var startCellDivider = "| ";
var currentCustomer = {};

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

function validatePassword(input){
    if(input.length >= passwordLength){
        return true;
    }
    console.log("Password length must be 4 or more characters.");
    return false;
}

var placeOrder = function(productId, quantity, addressId){
    connection.query("SELECT * FROM `Products` WHERE `id` = ?", productId, function(errInv, invResp){
        if(invResp[0].inventory >= quantity){
            connection.query({
                sql : "UPDATE `Products` SET `inventory` = (`inventory` - ?) WHERE `id` = ?",
                timeout : 40000,
                values : [quantity,productId],
            }, function(updateErr, updateResults){
                if(updateErr){
                    return connection.rollback(function(){
                        throw updateErr;
                    });
                }
                var myTotal = invResp[0].price * quantity;
                var myDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
                var order = {
                    id_products : productId,
                    "quantity" : quantity,
                    sub_total : myTotal,
                    email_customers : currentCustomer.email,
                    id_addresses : addressId,
                    date_of_order : myDate,
                }
                connection.query({
                    sql : "INSERT INTO `Orders` SET ?",
                    timeout : 40000,
                    values : [order],
                }, function(errInsert, insertResults){
                    if(errInsert){
                        return connection.rollback(function(){
                            throw errInsert;
                        });
                    }
                    connection.commit(function(commitErr){
                        if(commitErr){
                            connection.rollback(function(){
                                throw commitErr;
                            });
                        }
                        console.log("\nThank you for shopping with Bamazon!");
                        console.log("Your order is:\n");
                        connection.query("SELECT `id` AS `Order ID`, `id_products` AS `Product ID`, `quantity` AS `Quantity`, `sub_total` AS `Total`, `date_of_order` AS `Date` FROM `Orders` WHERE `date_of_order` = (SELECT max(date_of_order) FROM `Orders` WHERE `email_customers` = ? GROUP BY `email_customers`)", currentCustomer.email, function(selOrderErr, selOrderResp){
                            if(selOrderErr) throw selOrderErr;
                            printResults(selOrderResp);
                            mainMenu();
                        })
                    });
                });
            });
        } else {
            console.log("Cannot place order, only " + invResp[0].inventory + " units of that product remain");
            connection.rollback(function(){});
            displayAvailableProducts();
        }
    });
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

function createOrderAddress(productId, quantity, callback){
    var inqPromise = inquirerCreateAddress();
    inqPromise.then(function(inqRes){
        connection.beginTransaction(function(errTrans){
            if(errTrans) { throw errTrans; }
            var addressObj = {
                address : inqRes.addressLine,
                city : inqRes.myCity,
                state : inqRes.myState,
                zip : inqRes.myZip,
            }
            connection.query({
                sql : "SELECT * FROM `Addresses` WHERE `address` = ? AND `city` = ? AND `state` = ? AND `zip` = ?",
                timeout : 40000,
                values : [addressObj.address, addressObj.city, addressObj.state, addressObj.zip],
            }, function(selectAddrErr, addrResp){
                if(selectAddrErr){
                    return connection.rollback(function(){
                        throw selectAddrErr;
                    })
                }
                if(addrResp.length > 0){
                    placeOrder(productId, quantity, addrResp[0].id);
                } else {
                    connection.query("INSERT INTO `Addresses` SET ?", addressObj, function(insertAddrErr, insertAddrResp){
                        if(insertAddrErr){
                            return connection.rollback(function(){
                                throw insertAddrErr;
                            });
                        }
                        connection.query({
                            sql : "SELECT id FROM `Addresses` WHERE `address` = ? AND `city` = ? AND `state` = ? AND `zip` = ?",
                            timeout : 40000,
                            values : [addressObj.address, addressObj.city, addressObj.state, addressObj.zip],
                        }, function(addrSelectErr, addrSelectResp){
                            if(addrSelectErr){
                                return connection.rollback(function(){
                                    throw addrSelectErr;
                                });
                            }
                            placeOrder(productId, quantity, addrSelectResp[0].id);
                        });
                    });
                }
            });
        });
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
                    connection.beginTransaction(function(errTrans){
                        if(errTrans) { throw errTrans; }
                        placeOrder(productId, quantity, addressId);
                    });
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

function mainMenu(){
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
                login();
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
        },
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
    ]).then(function(inqRes){
        if(validatePassword(inqRes.password)){
            var addressObj = {
                address : inqRes.addressLine,
                city : inqRes.myCity,
                state : inqRes.myState,
                zip : inqRes.myZip,
            }
            connection.beginTransaction(function(errTrans){
                if(errTrans) throw errTrans;
                connection.query({
                    sql : "SELECT * FROM `Addresses` WHERE `address` = ? AND `city` = ? AND `state` = ? AND `zip` = ?",
                    timeout : 40000,
                    values : [addressObj.address, addressObj.city, addressObj.state, addressObj.zip],
                }, function(selectAddrErr, addrResp){
                    if(selectAddrErr){
                        return connection.rollback(function(){
                            throw selectAddrErr;
                        })
                    }
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
                    if(addrResp.length > 0){
                        customerObj["id_addresses"] = addrResp[0].id;
                        connection.query("INSERT INTO `Customers` SET ?", customerObj, function(insertCustErr, insertCustResp){
                            if(insertCustErr){
                                return connection.rollback(function(){
                                    throw insertCustErr;
                                });
                            }
                            connection.commit(function(commitErr){
                                if(commitErr){
                                    return connection.rollback(function(){
                                        throw commitErr;
                                    });
                                }
                                currentCustomer = customerObj;
                                mainMenu();
                            });
                        });
                    } else {
                        connection.query("INSERT INTO `Addresses` SET ?", addressObj, function(insertAddrErr, insertAddrResp){
                            if(insertAddrErr){
                                return connection.rollback(function(){
                                    throw insertAddrErr;
                                });
                            }
                            connection.query({
                                sql : "SELECT id FROM `Addresses` WHERE `address` = ? AND `city` = ? AND `state` = ? AND `zip` = ?",
                                timeout : 40000,
                                values : [addressObj.address, addressObj.city, addressObj.state, addressObj.zip],
                            }, function(addrSelectErr, addrSelectResp){
                                if(addrSelectErr){
                                    return connection.rollback(function(){
                                        throw addrSelectErr;
                                    });
                                }
                                customerObj["id_addresses"] = addrSelectResp[0].id;
                                connection.query("INSERT INTO `Customers` SET ?", customerObj, function(insertCustErr, insertCustResp){
                                    if(insertCustErr){
                                        return connection.rollback(function(){
                                            throw insertCustErr;
                                        });
                                    }
                                    connection.commit(function(commitErr){
                                        if(commitErr){
                                            return connection.rollback(function(){
                                                throw commitErr;
                                            });
                                        }
                                        currentCustomer = customerObj;
                                        mainMenu();
                                    });
                                });
                            });
                        });
                    }
                });
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

connection.connect(function(err){
    if(err){
        throw err;
    }
    startPrompt();
});