var inquirer = require("inquirer");
var printResults = require("./helpers/printer.js");
var queryHelper = require("./helpers/queriesAndTransactions.js");
var connection;

var viewSales = function(){
    connection.query({
        sql : "SELECT d.department_name AS `Department`, d.overhead_costs AS `Overhead Costs`, SUM(o.sub_total) AS `Sales`, (SUM(o.sub_total) - d.overhead_costs) AS `Total` FROM `Orders` AS o INNER JOIN `Products` AS p ON o.id_products = p.id INNER JOIN `Departments` AS d ON p.name_departments = d.department_name GROUP BY d.department_name",
        timeout : 40000,
    }, function(errSel, selRes){
        if(errSel) throw err;
        printResults(selRes);
        startPrompt();
    });
}

var createDept = function(){
    inquirer.prompt([
        {
            type : "input",
            message : "Department Name:",
            validate : function(input){
                if((input.length <= 50) && (input !== "")){
                    return true;
                }
                return false;
            },
            name : "deptName",
        },
        {
            type : "input",
            message : "Overhead Cost:",
            validate : function(input){
                if(!isNaN(input) && (input * 1) < 9999999999){
                    return true;
                }
                return false;
            },
            name : "deptOver",
        }
    ]).then(function(inqRes){
        var overhead = parseFloat(Math.round(inqRes.deptOver * 100) / 100).toFixed(2);
        deptObj = {
            department_name : inqRes.deptName,
            overhead_costs : overhead,
        }
        queryHelper.insertDept(connection, deptObj);
    });
}

var startPrompt = function(){
    myChoices = [
        "View Product Sales By Department",
        "Create New Department",
        "Exit Application",
    ]
    inquirer.prompt([
        {   
            type : "list",
            message : "What would you like to do?",
            choices : myChoices,
            name : "action",
        }
    ]).then(function(inqRes){
        switch (inqRes.action){
            case "View Product Sales By Department":
                viewSales();
                break;
            case "Create New Department" :
                createDept();
                break;
            case "Exit Application" :
                connection.end();
                break;
            default:
                startPrompt();
        }
    });
}

function welcomeScreen(){
    console.log("\nWelcome to Bamazon Supervisor!\n");
    startPrompt();
}

var bamazonSupervisor = function(myConn){
    connection = myConn;
    welcomeScreen();
}

exports.createDept = createDept;
exports.startPrompt = startPrompt;
exports.bamazonSupervisor = bamazonSupervisor;