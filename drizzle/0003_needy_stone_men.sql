CREATE TABLE "order_templates" (
	"template_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_type" "payment_type" NOT NULL,
	"service_type" "service_type" NOT NULL,
	"template_name" varchar(255) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
