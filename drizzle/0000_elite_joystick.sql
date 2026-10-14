CREATE TABLE `return_events` (
	`id` text PRIMARY KEY NOT NULL,
	`return_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`return_id`) REFERENCES `returns`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`address` text NOT NULL,
	`zip` text NOT NULL,
	`business` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `returns` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`merchant_id` text,
	`driver_id` text,
	`merchant_name` text NOT NULL,
	`item` text NOT NULL,
	`order_number` text NOT NULL,
	`carrier` text NOT NULL,
	`pickup_date` text NOT NULL,
	`pickup_window` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`merchant_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
