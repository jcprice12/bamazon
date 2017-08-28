var managerApp = require("./../bamazonManager.js");

//update product inventory
var addStock = function(connection, productId, amount){
    connection.beginTransaction(function(errTrans){
        if(errTrans) {
            return connection.rollback(function(){
                throw errTrans;
            });
        }
        connection.query("SELECT id FROM `Products` WHERE id = ?", productId, function(selErr, selRes){
            if(selErr) {
                return connection.rollback(function(){
                    throw selErr;
                });
            }
            if(selRes.length > 0){
                connection.query("UPDATE `Products` SET `inventory` = (`inventory` + ?) WHERE `id` = ?", [amount, productId], function(updateErr, updateRes){
                    if(updateErr){
                        return connection.rollback(function(){
                            throw updateErr;
                        });
                    }
                    connection.commit(function(commitErr){
                        if(commitErr){
                            return connection.rollback(function(){
                                throw commitErr;
                            });
                        }
                        console.log("Inventory for product with Product ID '" + productId + "' updated!");
                        managerApp.startManagerPrompt();
                    });
                });
            } else {
                console.log("There are no products associated with that id");
                connection.rollback(function(){});
                managerApp.addInv();
            }
        });
    });
}

//insert product into db
var insertProd = function(connection, product){
    connection.beginTransaction(function(errTrans){
        if(errTrans){
            return connection.rollback(function(){
                throw errTrans;
            });
        }
        connection.query("INSERT INTO `Products` SET ?", product, function(errInsert, insertRes){
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
                console.log("Product successfully added!");
                managerApp.startManagerPrompt();
            });
        });
    });
}

//export functions
exports.insertProd = insertProd;
exports.addStock = addStock;