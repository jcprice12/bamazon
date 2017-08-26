USE `bamazon_db`;

insert into `Departments` (`department_name`, `overhead_costs`) VALUES
("clothing", 500.00),
("video games", 250.00),
("books", 100.00);

insert into `Products` (`product_name`, `price`, `id_departments`, `inventory`) VALUES
("khakis", 30.00, 1, 100),
("shirt", 50.00, 1, 100),
("socks", 5.00, 1, 2000),
("shoes", 70.00, 1, 10),
("jeans", 50.00, 1, 3),
("Guild Wars 2", 40.00, 2, 60),
("Battlefied One", 60.00, 2, 60),
("Battlefied Two", 60.00, 2, 70),
("Some Mario Game", 60.00, 2, 3000),
("Red Dead Redemption 2", 60.00, 2, 4),
("The Great Gatsby 2", 15.00, 3, 100),
("Harry Potter 8 (Harry Potter Goes Back to School)", 20.00, 3, 2),
("Moby Dick 2", 10.00, 3, 200);


insert into Addresses (address, city, state, zip) values ('45 2nd Place', 'Mobile', 'AL', '36689');
insert into Addresses (address, city, state, zip) values ('3 Burrows Junction', 'Kansas City', 'MO', '64109');
insert into Addresses (address, city, state, zip) values ('29 Mayfield Center', 'Stamford', 'CT', '06912');
insert into Addresses (address, city, state, zip) values ('2 Summerview Terrace', 'San Diego', 'CA', '92121');
insert into Addresses (address, city, state, zip) values ('48135 Saint Paul Hill', 'Austin', 'TX', '78749');
insert into Addresses (address, city, state, zip) values ('9101 Bultman Plaza', 'Charleston', 'WV', '25321');
insert into Addresses (address, city, state, zip) values ('760 Shoshone Circle', 'Miami', 'FL', '33129');
insert into Addresses (address, city, state, zip) values ('47 Daystar Point', 'Las Cruces', 'NM', '88006');
insert into Addresses (address, city, state, zip) values ('03169 Farwell Crossing', 'Sacramento', 'CA', '94286');
insert into Addresses (address, city, state, zip) values ('8046 Manufacturers Lane', 'Huntington', 'WV', '25705');
insert into Addresses (address, city, state, zip) values ('57 Memorial Court', 'Detroit', 'MI', '48267');
insert into Addresses (address, city, state, zip) values ('2 Forest Run Circle', 'Miami', 'FL', '33158');
insert into Addresses (address, city, state, zip) values ('40 Corscot Place', 'Sacramento', 'CA', '94291');
insert into Addresses (address, city, state, zip) values ('6 Division Junction', 'Portland', 'OR', '97240');
insert into Addresses (address, city, state, zip) values ('642 Charing Cross Circle', 'Wilmington', 'NC', '28405');
insert into Addresses (address, city, state, zip) values ('700 Kedzie Drive', 'San Francisco', 'CA', '94105');
insert into Addresses (address, city, state, zip) values ('49 Birchwood Crossing', 'Baton Rouge', 'LA', '70810');
insert into Addresses (address, city, state, zip) values ('91553 Carioca Circle', 'Jamaica', 'NY', '11407');
insert into Addresses (address, city, state, zip) values ('531 Ruskin Plaza', 'Vero Beach', 'FL', '32964');
insert into Addresses (address, city, state, zip) values ('995 Johnson Park', 'Jackson', 'MS', '39216');
insert into Addresses (address, city, state, zip) values ('5 Farragut Way', 'San Diego', 'CA', '92153');
insert into Addresses (address, city, state, zip) values ('24935 Pine View Street', 'Toledo', 'OH', '43656');
insert into Addresses (address, city, state, zip) values ('8001 Westport Terrace', 'Richmond', 'VA', '23260');
insert into Addresses (address, city, state, zip) values ('6 Vahlen Avenue', 'Tulsa', 'OK', '74156');
insert into Addresses (address, city, state, zip) values ('20 Victoria Drive', 'Joliet', 'IL', '60435');