package com.bismillah.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Order {
    public int id;
    public String orderNumber;
    public String type;               // DINE_IN or DELIVERY
    public Integer roomId;
    public String customerName;
    public String customerPhone;
    public String address;
    public String paymentMethod;
    public BigDecimal total;
    public String status;
    public String itemsJson;          // JSON array of {id,name,qty,price}
    public LocalDateTime createdAt;
}
