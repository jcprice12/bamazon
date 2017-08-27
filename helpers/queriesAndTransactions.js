var printResults = require("./printer.js");
var custApp = require("./../bamazonCustomer.js");
var managerApp = require("./../bamazonManager.js");

var placeOrder = function(connection, productId, quantity, addressId, currentCustomer){
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
                            return connection.rollback(function(){
                                throw commitErr;
                            });
                        }
                        console.log("\nThank you for shopping with Bamazon!");
                        console.log("Your order is:\n");
                        connection.query("SELECT `id` AS `Order ID`, `id_products` AS `Product ID`, `quantity` AS `Quantity`, `sub_total` AS `Total`, `date_of_order` AS `Date` FROM `Orders` WHERE `date_of_order` = (SELECT max(date_of_order) FROM `Orders` WHERE `email_customers` = ? GROUP BY `email_customers`)", currentCustomer.email, function(selOrderErr, selOrderResp){
                            if(selOrderErr) throw selOrderErr;
                            printResults(selOrderResp);
                            custApp.mainMenu.execute();
                        })
                    });
                });
            });
        } else {
            console.log("Cannot place order, only " + invResp[0].inventory + " units of that product remain");
            connection.rollback(function(){});
            custApp.displayAvailableProducts.execute();
        }
    });
}

var placeMyOrderTransaction = function(connection, productId, quantity, addressId, currentCustomer){
    connection.beginTransaction(function(errTrans){
        if(errTrans) { throw errTrans; }
        placeOrder(connection, productId, quantity, addressId, currentCustomer);
    });
}

var createOrderAndAddressTransaction = function(connection, productId, quantity, addressObj, currentCustomer){
    connection.beginTransaction(function(errTrans){
        if(errTrans) { throw errTrans; }
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
                placeOrder(connection,productId, quantity, addrResp[0].id, currentCustomer);
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
                        placeOrder(connection,productId, quantity, addrSelectResp[0].id, currentCustomer);
                    });
                });
            }
        });
    });
}

var signUpTransaction = function(connection, customerObj, addressObj){
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
                        custApp.setCurrentCustomer(customerObj);
                        custApp.mainMenu.execute();
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
                                custApp.setCurrentCustomer(customerObj);
                                custApp.mainMenu.execute();
                            });
                        });
                    });
                });
            }
        });
    });
}

exports.signUpTransaction = signUpTransaction;
exports.createOrderAndAddressTransaction = createOrderAndAddressTransaction;
exports.placeMyOrderTransaction = placeMyOrderTransaction;