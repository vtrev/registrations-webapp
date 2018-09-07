CREATE TABLE towns(
	id serial not null primary key,
	starts_with text not null,
town text not null,
	    UNIQUE(starts_with)
	);
	
	CREATE TABLE registrations (
		id serial not null primary key,
	        registration text not null,
        town_id int not null,
		foreign key (town_id) references towns(id)
	);
INSERT INTO towns (starts_with,town) values ('CA','CapeTown');
INSERT INTO towns (starts_with,town) values ('CY','Bellville');
INSERT INTO towns (starts_with,town) values ('CW','Worcester');
INSERT INTO towns (starts_with,town) values ('CL','Stellenbosch');
INSERT INTO towns (starts_with,town) values ('CAW','George');
INSERT INTO towns (starts_with,town) values ('CEO','Grabouw');
INSERT INTO towns (starts_with,town) values ('CFR','Kuilsrivier');

