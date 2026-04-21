USE supply_chain;

INSERT IGNORE INTO customers (customer_id, customer_name, email, password)
VALUES
(1021,'Aarav Sharma','aarav.sharma@example.com','pass123'),
(1022,'Ananya Singh','ananya.singh@example.com','pass123'),
(1023,'Rohan Mehta','rohan.mehta@example.com','pass123'),
(1024,'Isha Kapoor','isha.kapoor@example.com','pass123'),
(1025,'Vivaan Patel','vivaan.patel@example.com','pass123'),
(1026,'Diya Verma','diya.verma@example.com','pass123'),
(1027,'Kabir Rao','kabir.rao@example.com','pass123'),
(1028,'Saanvi Nair','saanvi.nair@example.com','pass123'),
(1029,'Arjun Gupta','arjun.gupta@example.com','pass123'),
(1030,'Meera Joshi','meera.joshi@example.com','pass123');

INSERT IGNORE INTO products (product_id, product_name, product_price, product_category)
VALUES
(2121,'Dell Laptop',800,'Electronics'),
(2122,'HP Laptop',950,'Electronics'),
(2123,'Asus Laptop',1200,'Electronics'),
(2124,'Logitech Mouse',25,'Electronics'),
(2125,'HP Mouse',30,'Electronics'),
(2126,'Corsair Keyboard',45,'Electronics'),
(2127,'Microsoft Keyboard',50,'Electronics'),
(2128,'Samsung Monitor',150,'Electronics'),
(2129,'LG Monitor',200,'Electronics'),
(2130,'Canon Printer',120,'Electronics'),
(2131,'Office Chair',85,'Furniture'),
(2132,'Gaming Chair',95,'Furniture'),
(2133,'Wooden Table',200,'Furniture'),
(2134,'Glass Table',220,'Furniture'),
(2135,'Filing Cabinet',150,'Furniture'),
(2136,'Storage Cabinet',180,'Furniture'),
(2137,'Notebook',5,'Stationery'),
(2138,'Diary',6,'Stationery'),
(2139,'Pen',1.5,'Stationery'),
(2140,'Marker',2,'Stationery'),
(2141,'Pencil',0.5,'Stationery'),
(2142,'Colored Pencil',0.6,'Stationery'),
(2143,'Eraser',0.75,'Stationery'),
(2144,'Sharpener',1,'Stationery'),
(2145,'Backpack',35,'Accessories'),
(2146,'Tote Bag',40,'Accessories'),
(2147,'Running Shoes',60,'Footwear'),
(2148,'Casual Shoes',70,'Footwear'),
(2149,'Socks Pair',5,'Footwear'),
(2150,'Slippers',6,'Footwear');

INSERT IGNORE INTO warehouses (warehouse_id, warehouse_name, warehouse_location)
VALUES
(3006,'Warehouse North','Delhi, India'),
(3007,'Warehouse South','Chennai, India'),
(3008,'Warehouse East','Kolkata, India'),
(3009,'Warehouse West','Mumbai, India'),
(3010,'Warehouse Central','Bangalore, India');

INSERT IGNORE INTO inventory (product_id, warehouse_id, stock_quantity)
VALUES
(2121,3006,50),(2121,3007,40),
(2122,3006,30),(2122,3008,25),
(2123,3007,20),(2123,3009,15),
(2124,3006,60),(2124,3010,45),
(2125,3007,30),(2125,3008,35),
(2126,3009,25),(2126,3010,20),
(2127,3006,15),(2127,3007,10),
(2128,3008,50),(2128,3009,40),
(2129,3010,35),(2129,3006,30),
(2130,3007,25),(2130,3008,20),
(2131,3009,45),(2131,3010,50),
(2132,3006,55),(2132,3007,60),
(2133,3008,35),(2133,3009,40),
(2134,3010,30),(2134,3006,25),
(2135,3007,20),(2135,3008,15),
(2136,3009,30),(2136,3010,25),
(2137,3006,50),(2137,3007,40),
(2138,3008,45),(2138,3009,35),
(2139,3006,100),(2139,3010,80),
(2140,3007,50),(2140,3008,40),
(2141,3009,60),(2141,3010,55),
(2142,3006,70),(2142,3007,65),
(2143,3008,90),(2143,3009,85),
(2144,3010,50),(2144,3006,45),
(2145,3007,35),(2145,3008,30),
(2146,3009,25),(2146,3010,20),
(2147,3006,15),(2147,3007,10),
(2148,3008,20),(2148,3009,25),
(2149,3010,30),(2149,3006,35),
(2150,3007,40),(2150,3008,45);

INSERT IGNORE INTO orders (order_id, customer_id, order_date, warehouse_id)
VALUES
(4001,1021,'2026-04-01',3006),
(4002,1022,'2026-04-02',3007),
(4003,1023,'2026-04-03',3008),
(4004,1024,'2026-04-04',3009),
(4005,1025,'2026-04-05',3010),
(4006,1026,'2026-04-06',3006),
(4007,1027,'2026-04-07',3007),
(4008,1028,'2026-04-08',3008),
(4009,1029,'2026-04-09',3009),
(4010,1030,'2026-04-10',3010);

INSERT IGNORE INTO order_items (order_item_id, order_id, product_id, quantity)
VALUES
(5001,4001,2121,1),(5002,4001,2140,2),
(5003,4002,2122,1),(5004,4002,2130,1),
(5005,4003,2123,1),(5006,4003,2124,2),
(5007,4004,2125,1),(5008,4004,2131,1),
(5009,4005,2126,1),(5010,4005,2132,1);

DROP TRIGGER IF EXISTS after_order_item_insert;

DELIMITER $$
CREATE TRIGGER after_order_item_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE inv_id INT;

    SELECT inventory_id INTO inv_id
    FROM inventory
    WHERE product_id = NEW.product_id
      AND warehouse_id = (SELECT warehouse_id FROM orders WHERE order_id = NEW.order_id)
    LIMIT 1;

    IF inv_id IS NOT NULL THEN
        UPDATE inventory
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE inventory_id = inv_id;

        INSERT INTO logs (inventory_id, change_type, change_quantity)
        VALUES (inv_id,'OUT',NEW.quantity);
    END IF;
END$$
DELIMITER ;
