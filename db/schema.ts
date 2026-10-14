import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const profiles = sqliteTable("profiles", {
 id: text("id").primaryKey(), role: text("role").notNull(), name: text("name").notNull(), phone: text("phone").notNull(), email: text("email").notNull(), address: text("address").notNull(), zip: text("zip").notNull(), business: text("business").notNull().default(""), createdAt: text("created_at").notNull(),
});
export const returns = sqliteTable("returns", {
 id: text("id").primaryKey(), customerId: text("customer_id").notNull().references(()=>profiles.id), merchantId: text("merchant_id").references(()=>profiles.id), driverId: text("driver_id").references(()=>profiles.id), merchantName: text("merchant_name").notNull(), item: text("item").notNull(), orderNumber: text("order_number").notNull(), carrier: text("carrier").notNull(), pickupDate: text("pickup_date").notNull(), window: text("pickup_window").notNull(), notes: text("notes").notNull().default(""), status: text("status").notNull().default("requested"), createdAt: text("created_at").notNull(),
});
export const events = sqliteTable("return_events", { id: text("id").primaryKey(), returnId: text("return_id").notNull().references(()=>returns.id), actorId: text("actor_id").notNull(), status: text("status").notNull(), createdAt: text("created_at").notNull() });
