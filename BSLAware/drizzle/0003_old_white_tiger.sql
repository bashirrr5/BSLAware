CREATE TABLE `dictionary_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`word` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`video_id` text,
	`tags` text DEFAULT '[]' NOT NULL
);
