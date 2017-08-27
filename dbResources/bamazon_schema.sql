SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

DROP SCHEMA IF EXISTS `bamazon_db`;
CREATE SCHEMA IF NOT EXISTS `bamazon_db` DEFAULT CHARACTER SET utf8 ;
USE `bamazon_db` ;

-- -----------------------------------------------------
-- Table `bamazon_db`.`Departments`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bamazon_db`.`Departments`;
CREATE TABLE `bamazon_db`.`Departments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `department_name` VARCHAR(50) NOT NULL,
  `overhead_costs` DECIMAL(6,2) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bamazon_db`.`Products`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bamazon_db`.`Products`;
CREATE TABLE `bamazon_db`.`Products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_name` VARCHAR(50) NOT NULL,
  `price` DECIMAL(6,2) NOT NULL,
  `id_departments` INT NOT NULL,
  `inventory` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Products_Departments_idx` (`id_departments` ASC),
  CONSTRAINT `fk_Products_Departments`
    FOREIGN KEY (`id_departments`)
    REFERENCES `bamazon_db`.`Departments` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bamazon_db`.`Addresses`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bamazon_db`.`Addresses`;
CREATE TABLE `bamazon_db`.`Addresses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `address` VARCHAR(100) NOT NULL,
  `city` VARCHAR(50) NOT NULL,
  `state` VARCHAR(2) NOT NULL,
  `zip` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `unique_address`
	UNIQUE (`address`, `city`, `state`, `zip`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bamazon_db`.`Customers`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bamazon_db`.`Customers`;
CREATE TABLE `bamazon_db`.`Customers` (
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(75) NOT NULL,
  `hash` VARCHAR(100) NOT NULL,
  `id_addresses` INT NOT NULL,
  PRIMARY KEY (`email`),
  INDEX `fk_Customers_Addresses_idx` (`id_addresses` ASC),
  CONSTRAINT `fk_Customers_Addresses`
    FOREIGN KEY (`id_addresses`)
    REFERENCES `bamazon_db`.`Addresses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bamazon_db`.`Orders`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bamazon_db`.`Orders`;
CREATE TABLE `bamazon_db`.`Orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_products` INT NOT NULL,
  `quantity` INT NOT NULL,
  `sub_total` DECIMAL (9,2),
  `email_customers` VARCHAR(75) NOT NULL,
  `id_addresses` INT NOT NULL,
  `date_of_order` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Orders_Products_idx` (`id_products` ASC),
  INDEX `fk_Orders_Customers_idx` (`email_customers` ASC),
  INDEX `fk_Orders_Addresses_idx` (`id_addresses` ASC),
  CONSTRAINT `fk_Orders_Products`
    FOREIGN KEY (`id_products`)
    REFERENCES `bamazon_db`.`Products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Orders_Customers`
    FOREIGN KEY (`email_customers`)
    REFERENCES `bamazon_db`.`Customers` (`email`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Orders_Addresses`
    FOREIGN KEY (`id_addresses`)
    REFERENCES `bamazon_db`.`Addresses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;