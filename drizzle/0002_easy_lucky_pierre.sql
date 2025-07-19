ALTER TABLE "orders" ALTER COLUMN "service_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."service_type";--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('product', 'project');--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "service_type" SET DATA TYPE "public"."service_type" USING "service_type"::"public"."service_type";