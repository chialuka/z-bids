CREATE TABLE "documents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "documents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"pdfContent" text,
	"coverSheet" text,
	"complianceMatrix" text,
	"description" text,
	"dueDate" timestamp,
	"folderId" integer,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "folders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "folders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_folderId_folders_id_fk" FOREIGN KEY ("folderId") REFERENCES "public"."folders"("id") ON DELETE no action ON UPDATE no action;