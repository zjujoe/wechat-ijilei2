-- mysql -uroot -pwoo123 < init_db.sql
-- bee api jeedev-api3 -conn="root:woo123@tcp(127.0.0.1:3306)/jeedev3";above jeedev-api3
-- bee generate docs ;under jeedev-api3;
-- mysqldump -uroot -pwoo123 jeedev3 > jeedev3.dump
-- mysql -uroot -pwoo123 jeedev3 < jeedev3.dump

set global time_zone = '+8:00';
set time_zone = '+8:00';
flush privileges;
select now();

drop database if exists jeedev3;
create database jeedev3;


