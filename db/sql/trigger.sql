DROP TABLE IF EXISTS `user_operate_history`;
CREATE TABLE `user_operate_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `table_id` int(11) NOT NULL,
  `operatetable` varchar(200) NOT NULL,
  `operatetype` varchar(200) NOT NULL,
  `operatetime` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;


--triggers

DROP TRIGGER IF EXISTS `tri_log_insert_itemcomments`;
DELIMITER ;;
CREATE TRIGGER `tri_log_insert_itemcomments` AFTER INSERT ON `itemcomments` FOR EACH ROW begin
    INSERT INTO user_operate_history(table_id, operatetable, operatetype, operatetime) VALUES (new.id, 'itemcomments','insert',  now());
end
;;
DELIMITER ;

DELIMITER ;;
CREATE TRIGGER `tri_log_insert_itemrecitals` AFTER INSERT ON `itemrecitals` FOR EACH ROW begin
    INSERT INTO user_operate_history(table_id, operatetable, operatetype, operatetime) VALUES (new.id, 'itemrecitals','insert',  now());
end
;;
DELIMITER ;

DROP TRIGGER IF EXISTS `tri_update_user`;
DELIMITER ;;
CREATE TRIGGER `tri_update_user` AFTER UPDATE ON `user` FOR EACH ROW begin
    INSERT INTO user_history(user_id,operatetype, operatetime) VALUES (new.id, 'update a user', now());
end
;;
DELIMITER ;

DROP TRIGGER IF EXISTS `tri_delete_user`;
DELIMITER ;;
CREATE TRIGGER `tri_delete_user` AFTER DELETE ON `user` FOR EACH ROW begin
    INSERT INTO user_history(user_id, operatetype, operatetime) VALUES (old.id, 'delete a user', now());
end
;;
DELIMITER 

DROP TRIGGER IF EXISTS `tri_log_delete_itemrecitals`;
DELIMITER ;;
CREATE TRIGGER `tri_log_delete_itemrecitals` AFTER DELETE ON `itemrecitals` FOR EACH ROW begin
    INSERT INTO user_operate_history(table_id, operatetable, operatetype, operatetime) VALUES (old.id, 'itemrecitals','delete',  now());
end
;;
DELIMITER ;


DROP TRIGGER IF EXISTS `ins_info`;  
create trigger ins_info  
after insert on nhfxelect for each row   
begin  
    if HOUR(new.RecordTime)='20' then    
    insert into nhfxbyhour (UnitDepName, UnitDepCode, ElectCost, TimeJG, RecordTime)  
        values( '数统学院', '1', new.USERKWH, '20', new.RecordTime);  
    end if;  
end;  


DROP TRIGGER IF EXISTS `upd_info`;  
create trigger upd_info  
after insert on StuCost for each row   
begin  
    update StuCostbyHour set HourCost = HourCost + new.Cost  
        where (TimeJD = hour(new.RecordTime) + 1) and date_format(new.RecordTime, '%Y-%m-%d') = date_format(RecordTime, '%Y-%m-%d');  
end;  

DROP TRIGGER IF EXISTS `tri_update_books_when_add_items`;
DELIMITER ;;
CREATE TRIGGER `tri_update_books_when_add_items` AFTER UPDATE ON `items` FOR EACH ROW begin
    update books set items = items + 1 where id = hour(new.bid);
end
;;
DELIMITER ;

%s/tri_\([_a-z]*\)/\1_trigger/g


DROP TRIGGER IF EXISTS `after_delete_books_trigger`;
DELIMITER ;;
CREATE TRIGGER `after_delete_books_trigger` AFTER DELETE ON `books` FOR EACH ROW begin
    DELETE from bookrecitals where bid=old.id;
    DELETE from items where bid=old.id;
end
;;
DELIMITER ;

DROP TRIGGER IF EXISTS `after_delete_items_trigger`;
DELIMITER ;;
CREATE TRIGGER `after_delete_items_trigger` AFTER DELETE ON `items` FOR EACH ROW begin
    DELETE from itemrecitals where iid=old.id;
    DELETE from itemcomments where iid=old.id;
end
;;
DELIMITER ;

DROP TRIGGER IF EXISTS `after_delete_users_trigger`;
DELIMITER ;;
CREATE TRIGGER `after_delete_users_trigger` AFTER DELETE ON `users` FOR EACH ROW begin
    DELETE from bookrecitals where uid=old.id;
    DELETE from itemrecitals where uid=old.id;
    DELETE from itemcomments where uid=old.id;
end
;;
DELIMITER ;
