-- Admin PIN (default 1234) --
INSERT INTO admin_settings (id, pin) VALUES (1, '1234')
    ON DUPLICATE KEY UPDATE pin=pin;

-- Categories --
INSERT INTO categories (id, name, name_te, sort_order) VALUES
 (1,'Biryanis','బిర్యానీలు',1),
 (2,'Kebabs','కబాబ్‌లు',2),
 (3,'Starters','స్టార్టర్స్',3),
 (4,'Curries','కర్రీలు',4),
 (5,'Breads','రొట్టెలు',5),
 (6,'Beverages','పానీయాలు',6)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Menu Items --
INSERT INTO menu_items (id, category_id, name, name_te, price, is_veg) VALUES
 (1,1,'Chicken Dum Biryani','చికెన్ దమ్ బిర్యానీ',280,FALSE),
 (2,1,'Mutton Biryani','మటన్ బిర్యానీ',380,FALSE),
 (3,1,'Veg Biryani','వెజ్ బిర్యానీ',200,TRUE),
 (4,1,'Egg Biryani','ఎగ్ బిర్యానీ',220,FALSE),
 (5,2,'Chicken Seekh Kebab','చికెన్ సీక్ కబాబ్',260,FALSE),
 (6,2,'Mutton Shami Kebab','మటన్ షామీ కబాబ్',320,FALSE),
 (7,2,'Paneer Tikka','పనీర్ టిక్కా',240,TRUE),
 (8,3,'Chicken 65','చికెన్ 65',240,FALSE),
 (9,3,'Gobi Manchurian','గోబీ మంచూరియన్',180,TRUE),
 (10,4,'Butter Chicken','బటర్ చికెన్',300,FALSE),
 (11,4,'Dal Tadka','దాల్ తడ్కా',160,TRUE),
 (12,5,'Butter Naan','బటర్ నాన్',50,TRUE),
 (13,5,'Rumali Roti','రుమాలీ రొట్టి',40,TRUE),
 (14,6,'Masala Chaas','మసాలా చాస్',40,TRUE),
 (15,6,'Sweet Lassi','స్వీట్ లస్సీ',80,TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Rooms --
INSERT INTO rooms (id, name, capacity) VALUES
 (1,'Room 1',4),(2,'Room 2',4),(3,'Room 3',6),(4,'Room 4',4),
 (5,'Room 5',8),(6,'Room 6',4),(7,'Room 7',6),(8,'Room 8',4),
 (9,'Room 9',10),(10,'Room 10',4)
ON DUPLICATE KEY UPDATE name=VALUES(name);
