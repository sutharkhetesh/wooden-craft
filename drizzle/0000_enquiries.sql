CREATE TABLE enquiries (
 id TEXT PRIMARY KEY NOT NULL,
 created_at TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'New',
 notes TEXT NOT NULL DEFAULT '',
 payload TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX enquiries_created_at_idx ON enquiries(created_at);
--> statement-breakpoint
CREATE TABLE rate_limits (
 key TEXT PRIMARY KEY NOT NULL,
 count INTEGER NOT NULL DEFAULT 1,
 expires INTEGER NOT NULL
);
