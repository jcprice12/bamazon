var supervisorApp = require("./../bamazonSupervisor.js");

//insert new department
var insertDept = function(connection, dept){
    connection.beginTransaction(function(errTrans){
        if(errTrans){
            return connection.rollback(function(){
                throw errTrans;
            });
        }
        connection.query("SELECT department_name FROM `Departments` WHERE department_name = ?", dept.department_name, function(errSel, selRes){
            if(errSel){
                return connection.rollback(function(){
                    throw errSel;
                });
            }
            if(selRes.length > 0){
                console.log("A department already exists with that name.");
                connection.rollback(function(){});
                supervisorApp.createDept();
            } else {
                connection.query("INSERT INTO `Departments` SET ?", dept, function(errInsert, insertRes){
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
                        console.log("Department successfully added!");
                        supervisorApp.startPrompt();
                    });
                });
            }
        });
    });
}

exports.insertDept = insertDept;