DROP PROCEDURE IF EXISTS updateBookrecitals;
delimiter $$
CREATE PROCEDURE updateBookrecitals()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE tmp_uid INT DEFAULT 0;
    DECLARE tmp_bid INT DEFAULT 0;
    DECLARE u_index CURSOR FOR SELECT id from users;
    DECLARE b_index CURSOR FOR SELECT id from books;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    OPEN u_index;
    outloop: LOOP
        FETCH u_index INTO tmp_uid;
        IF done THEN
            LEAVE outloop;
        END IF;
        OPEN b_index;
        innerloop: LOOP
            FETCH b_index INTO tmp_bid;
            IF done THEN
            LEAVE innerloop;
            END IF;
            select @c2:=count(*) from itemrecitals,items where itemrecitals.uid=tmp_uid and itemrecitals.status>=2 and itemrecitals.iid=items.id and items.bid=tmp_bid into @ee;
            select @c4:=count(*) from itemrecitals,items where itemrecitals.uid=tmp_uid and itemrecitals.status>=4 and itemrecitals.iid=items.id and items.bid=tmp_bid into @ee;
            select @c6:=count(*) from itemrecitals,items where itemrecitals.uid=tmp_uid and itemrecitals.status>=6 and itemrecitals.iid=items.id and items.bid=tmp_bid into @ee;
            insert into bookrecitals values(0,NOW(),tmp_uid,tmp_bid,@c2,@c4,@c6);
        END LOOP innerloop;
        CLOSE b_index;
        SET done = FALSE;
    END Loop outloop;
    CLOSE u_index;
END;
$$
DELIMITER ;
call updateBookrecitals();

DROP PROCEDURE IF EXISTS updateBookrecitals;
delimiter $$
CREATE PROCEDURE updateBookrecitals(IN t_uid INTEGER, IN t_iid INTEGER)
BEGIN
    DECLARE t_bid INT DEFAULT 0;
    DECLARE t_c2 INT DEFAULT 0;
    DECLARE t_c4 INT DEFAULT 0;
    DECLARE t_c6 INT DEFAULT 0;
    DECLARE t_id INT DEFAULT 0;
    select bid from items where id=t_iid into t_bid;
    select count(*) from itemrecitals,items where itemrecitals.uid=t_uid and itemrecitals.status>=2 and itemrecitals.iid=items.id and items.bid=t_bid into t_c2;
    select count(*) from itemrecitals,items where itemrecitals.uid=t_uid and itemrecitals.status>=4 and itemrecitals.iid=items.id and items.bid=t_bid into t_c4;
    select count(*) from itemrecitals,items where itemrecitals.uid=t_uid and itemrecitals.status>=6 and itemrecitals.iid=items.id and items.bid=t_bid into t_c6;
    select id from bookrecitals where uid=t_uid and bid=t_bid into t_id;
    if t_id > 0 then
        update bookrecitals set start=t_c2,middle=t_c4,finished=t_c6 where uid=t_uid and bid=t_bid;
    else
        insert into bookrecitals values(0,NOW(),t_uid,t_bid,t_c2,t_c4,t_c6);
    end if;
END;
$$
DELIMITER ;
call updateBookrecitals(2,1);
