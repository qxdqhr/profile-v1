CREATE TABLE "idea_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"priority" varchar(10) DEFAULT 'medium' NOT NULL,
	"tags" json DEFAULT '[]'::json,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idea_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"color" varchar(20) DEFAULT 'blue',
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "idea_items" ADD CONSTRAINT "idea_items_list_id_idea_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."idea_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_lists" ADD CONSTRAINT "idea_lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;