
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

var printResults = function(results){
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

module.exports = printResults;