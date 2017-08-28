# bamazon
Database that models an online retailer called "Bamazon" using MySQL and node js

To install:

1. Download/Clone the Git repo
2. In the directory you downloaded it in, enter the command "npm install" to set up the necessary node modules
3. If you don't have MySQL, install it from (https://www.mysql.com/)
4. You can use the schema file in dbResources/ to set up the structure of the database (be careful, it will delete and re-create a database called "bamazon_db")
5. You can then run the seeds file located in dbResources/ as well in order to populate the database with some dummy data
6. Run the seedGenerator.js file in dbResources/ in order to populate the database with some customers as well.

There are three applications:

1. Bamazon Customer
2. Bamazon Manager
3. Bamazon Supervisor

To start them up, follow this format: "node index.js 'appName'"

E.G.

![Start Customer App](https://github.com/jcprice12/bamazon/blob/master/images/startCustomerApp.JPG?raw=true)

![Start Manager App](https://github.com/jcprice12/bamazon/blob/master/images/startManApp.JPG?raw=true)

![Start Supervisor App](https://github.com/jcprice12/bamazon/blob/master/images/startSuperApp.JPG?raw=true)


Follow the in-app prompts to use the applications

Here are some videos that walk through the app and the database structure

(Walkthrough of App)
https://www.dropbox.com/s/r4m3uiy9i7ghr3a/bamazonApp.mp4?dl=0

(Walkthrough of DB)
https://www.dropbox.com/s/3kzflv2xhbo99qy/mySQLWalkthrough.mp4?dl=0


