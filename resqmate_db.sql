SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
	category_id INTEGER NOT NULL AUTO_INCREMENT, 
	category_name VARCHAR(100) NOT NULL, 
	description TEXT, 
	PRIMARY KEY (category_id)
);

DROP TABLE IF EXISTS locations;
CREATE TABLE locations (
	location_id INTEGER NOT NULL AUTO_INCREMENT, 
	location_name VARCHAR(255), 
	barangay VARCHAR(100), 
	city VARCHAR(100), 
	province VARCHAR(100), 
	region VARCHAR(100), 
	PRIMARY KEY (location_id)
);

DROP TABLE IF EXISTS resources;
CREATE TABLE resources (
	resource_id INTEGER NOT NULL AUTO_INCREMENT, 
	resource_name VARCHAR(100), 
	category VARCHAR(50), 
	quantity_available INTEGER, 
	unit VARCHAR(50), 
	location VARCHAR(150), 
	status VARCHAR(50), 
	last_updated DATETIME DEFAULT now(), 
	PRIMARY KEY (resource_id)
);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
	user_id INTEGER NOT NULL AUTO_INCREMENT, 
	first_name VARCHAR(50) NOT NULL, 
	last_name VARCHAR(50) NOT NULL, 
	email VARCHAR(100) NOT NULL, 
	password VARCHAR(255) NOT NULL, 
	`role` ENUM('community_user','staff','admin'), 
	date_created DATETIME DEFAULT now(), 
	phone_number VARCHAR(20), 
	dob DATETIME, 
	session_token VARCHAR(255), 
	failed_login_attempts INTEGER DEFAULT 0,
	locked_until DATETIME DEFAULT NULL,
	PRIMARY KEY (user_id), 
	UNIQUE (email)
);

DROP TABLE IF EXISTS assistance_requests;
CREATE TABLE assistance_requests (
	request_id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER, 
	category_id INTEGER, 
	location_id INTEGER, 
	request_details TEXT, 
	priority_level ENUM('low','medium','high','critical'), 
	status VARCHAR(50), 
	rejection_reason TEXT, 
	date_requested DATETIME DEFAULT now(), 
	PRIMARY KEY (request_id), 
	FOREIGN KEY(user_id) REFERENCES users (user_id), 
	FOREIGN KEY(category_id) REFERENCES categories (category_id), 
	FOREIGN KEY(location_id) REFERENCES locations (location_id)
);

DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
	notification_id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER, 
	title VARCHAR(100), 
	message TEXT, 
	is_read BOOL, 
	created_at DATETIME DEFAULT now(), 
	PRIMARY KEY (notification_id), 
	FOREIGN KEY(user_id) REFERENCES users (user_id)
);

DROP TABLE IF EXISTS distributions;
CREATE TABLE distributions (
	distribution_id INTEGER NOT NULL AUTO_INCREMENT, 
	request_id INTEGER, 
	resource_id INTEGER, 
	staff_id INTEGER, 
	quantity_given INTEGER, 
	distribution_date DATETIME DEFAULT now(), 
	PRIMARY KEY (distribution_id), 
	FOREIGN KEY(request_id) REFERENCES assistance_requests (request_id), 
	FOREIGN KEY(resource_id) REFERENCES resources (resource_id), 
	FOREIGN KEY(staff_id) REFERENCES users (user_id)
);

DROP TABLE IF EXISTS request_status_history;
CREATE TABLE request_status_history (
	history_id INTEGER NOT NULL AUTO_INCREMENT, 
	request_id INTEGER, 
	updated_by INTEGER, 
	status VARCHAR(50), 
	remarks TEXT, 
	updated_at DATETIME DEFAULT now(), 
	PRIMARY KEY (history_id), 
	FOREIGN KEY(request_id) REFERENCES assistance_requests (request_id), 
	FOREIGN KEY(updated_by) REFERENCES users (user_id)
);

SET FOREIGN_KEY_CHECKS=1;
