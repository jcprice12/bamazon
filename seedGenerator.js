var connection = require("./mySQLConnection.js");
var password_hash = require("password-hash");

var customersArr = [{
    "first_name": "Katee",
    "last_name": "Theurer",
    "email": "ktheurer0@artisteer.com",
    "id_addresses": 1
  }, {
    "first_name": "Vivianna",
    "last_name": "Vasyutin",
    "email": "vvasyutin1@wunderground.com",
    "id_addresses": 2
  }, {
    "first_name": "Kayley",
    "last_name": "Tomala",
    "email": "ktomala2@chron.com",
    "id_addresses": 3
  }, {
    "first_name": "Ulrich",
    "last_name": "Downage",
    "email": "udownage3@ocn.ne.jp",
    "id_addresses": 4
  }, {
    "first_name": "Ina",
    "last_name": "Bugdall",
    "email": "ibugdall4@marketwatch.com",
    "id_addresses": 5
  }, {
    "first_name": "Linette",
    "last_name": "Reschke",
    "email": "lreschke5@weebly.com",
    "id_addresses": 6
  }, {
    "first_name": "Abie",
    "last_name": "Sampey",
    "email": "asampey6@indiatimes.com",
    "id_addresses": 7
  }, {
    "first_name": "Penni",
    "last_name": "Jumeau",
    "email": "pjumeau7@tinypic.com",
    "id_addresses": 8
  }, {
    "first_name": "Lucinda",
    "last_name": "Simonitto",
    "email": "lsimonitto8@reuters.com",
    "id_addresses": 9
  }, {
    "first_name": "Othilia",
    "last_name": "Topliss",
    "email": "otopliss9@privacy.gov.au",
    "id_addresses": 10
  }, {
    "first_name": "Orion",
    "last_name": "Graddell",
    "email": "ograddella@cam.ac.uk",
    "id_addresses": 11
  }, {
    "first_name": "Garner",
    "last_name": "Fley",
    "email": "gfleyb@flickr.com",
    "id_addresses": 12
  }, {
    "first_name": "Horatio",
    "last_name": "Headingham",
    "email": "hheadinghamc@si.edu",
    "id_addresses": 13
  }, {
    "first_name": "Bryant",
    "last_name": "Okill",
    "email": "bokilld@cpanel.net",
    "id_addresses": 14
  }, {
    "first_name": "Opalina",
    "last_name": "Long",
    "email": "olonge@ask.com",
    "id_addresses": 15
  }, {
    "first_name": "Tilda",
    "last_name": "Bendtsen",
    "email": "tbendtsenf@myspace.com",
    "id_addresses": 16
  }, {
    "first_name": "Aldwin",
    "last_name": "Spellacey",
    "email": "aspellaceyg@irs.gov",
    "id_addresses": 17
  }, {
    "first_name": "Jared",
    "last_name": "MacCarrane",
    "email": "jmaccarraneh@goo.ne.jp",
    "id_addresses": 18
  }, {
    "first_name": "Thibaud",
    "last_name": "Vallow",
    "email": "tvallowi@dell.com",
    "id_addresses": 19
  }, {
    "first_name": "Charity",
    "last_name": "Francom",
    "email": "cfrancomj@ft.com",
    "id_addresses": 20
  }, {
    "first_name": "Jess",
    "last_name": "Thrussell",
    "email": "jthrussellk@cnbc.com",
    "id_addresses": 21
  }, {
    "first_name": "Karlyn",
    "last_name": "Windibank",
    "email": "kwindibankl@about.com",
    "id_addresses": 22
  }, {
    "first_name": "Georgiana",
    "last_name": "Varnham",
    "email": "gvarnhamm@pcworld.com",
    "id_addresses": 23
  }, {
    "first_name": "Rebecca",
    "last_name": "Stoppe",
    "email": "rstoppen@ycombinator.com",
    "id_addresses": 24
  }, {
    "first_name": "test",
    "last_name": "test",
    "email": "test@test.com",
    "id_addresses": 25
  }];

function generateCustomers(i){
    var tempPass;
    if(i < customersArr.length){
        tempPass = password_hash.generate("password", {
            algorithm : 'sha256',
            saltLength : 16,
        });
        customersArr[i].hash = tempPass;
        connection.query("INSERT INTO Customers SET ?", customersArr[i], function(err, resp){
            if(err) throw err;
            console.log("Inserted: " + customersArr[i].email);
            generateCustomers((i+1));
        })
    } else {
        console.log("Finished inserting");
        connection.end();
    }
}

connection.connect(function(err){
    if(err){
        throw err;
    }
    generateCustomers(0);
});
