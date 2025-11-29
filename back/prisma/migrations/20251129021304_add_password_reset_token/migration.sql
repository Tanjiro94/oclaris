-- CreateEnum
CREATE TYPE "public"."ad_status" AS ENUM ('draft', 'pending', 'ready', 'archived');

-- CreateEnum
CREATE TYPE "public"."gear_type" AS ENUM ('camera', 'lens', 'flash', 'accessory');

-- CreateEnum
CREATE TYPE "public"."job_status" AS ENUM ('queued', 'running', 'succeeded', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."ticket_category" AS ENUM ('bug', 'billing', 'question', 'other');

-- CreateEnum
CREATE TYPE "public"."ticket_priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "public"."ticket_status" AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- CreateTable
CREATE TABLE "public"."ad_constraint" (
    "art_direction_id" UUID NOT NULL,
    "constraint_option_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_constraint_pkey" PRIMARY KEY ("art_direction_id","constraint_option_id")
);

-- CreateTable
CREATE TABLE "public"."ad_place" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "art_direction_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "lat" DECIMAL(9,6),
    "lng" DECIMAL(9,6),
    "maps_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ad_style" (
    "art_direction_id" UUID NOT NULL,
    "style_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_style_pkey" PRIMARY KEY ("art_direction_id","style_id")
);

-- CreateTable
CREATE TABLE "public"."art_direction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "brief" TEXT NOT NULL,
    "use_gear" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."ad_status" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "art_direction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."constraint_option" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "constraint_type_id" UUID NOT NULL,
    "code" VARCHAR(120) NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "constraint_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."constraint_type" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(120) NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "constraint_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."favorite" (
    "user_id" UUID NOT NULL,
    "art_direction_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_pkey" PRIMARY KEY ("user_id","art_direction_id")
);

-- CreateTable
CREATE TABLE "public"."gear" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "public"."gear_type" NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."generation_job" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "art_direction_id" UUID NOT NULL,
    "model" VARCHAR(60) NOT NULL,
    "duration" INTEGER,
    "params" JSONB,
    "message" TEXT,
    "status" "public"."job_status" NOT NULL DEFAULT 'queued',
    "started_at" TIMESTAMPTZ(6),
    "finished_at" TIMESTAMPTZ(6),

    CONSTRAINT "generation_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."picture_generated" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "art_direction_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "format" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "picture_generated_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."style" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "libelle" TEXT NOT NULL,

    CONSTRAINT "style_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."support_ticket" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "subject" VARCHAR(120) NOT NULL,
    "category" "public"."ticket_category" NOT NULL,
    "priority" "public"."ticket_priority" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "public"."ticket_status" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMPTZ(6),

    CONSTRAINT "support_ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(320) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "verified_at" TIMESTAMPTZ(6),
    "verification_token_hash" TEXT,
    "verification_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_reset_token" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_adconst_ad" ON "public"."ad_constraint"("art_direction_id");

-- CreateIndex
CREATE INDEX "idx_adconst_option" ON "public"."ad_constraint"("constraint_option_id");

-- CreateIndex
CREATE INDEX "idx_place_ad" ON "public"."ad_place"("art_direction_id");

-- CreateIndex
CREATE INDEX "idx_adstyle_ad" ON "public"."ad_style"("art_direction_id");

-- CreateIndex
CREATE INDEX "idx_adstyle_style" ON "public"."ad_style"("style_id");

-- CreateIndex
CREATE INDEX "idx_ad_user" ON "public"."art_direction"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_copt" ON "public"."constraint_option"("constraint_type_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "constraint_type_code_key" ON "public"."constraint_type"("code");

-- CreateIndex
CREATE INDEX "idx_fav_ad" ON "public"."favorite"("art_direction_id");

-- CreateIndex
CREATE INDEX "idx_fav_user" ON "public"."favorite"("user_id");

-- CreateIndex
CREATE INDEX "idx_gear_user" ON "public"."gear"("user_id");

-- CreateIndex
CREATE INDEX "idx_job_ad" ON "public"."generation_job"("art_direction_id");

-- CreateIndex
CREATE INDEX "idx_job_user" ON "public"."generation_job"("user_id");

-- CreateIndex
CREATE INDEX "idx_pic_ad" ON "public"."picture_generated"("art_direction_id");

-- CreateIndex
CREATE UNIQUE INDEX "style_libelle_key" ON "public"."style"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "public"."user"("username");

-- CreateIndex
CREATE INDEX "password_reset_token_user_id_idx" ON "public"."password_reset_token"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_token_code_idx" ON "public"."password_reset_token"("code");

-- AddForeignKey
ALTER TABLE "public"."ad_constraint" ADD CONSTRAINT "fk_adconst_ad" FOREIGN KEY ("art_direction_id") REFERENCES "public"."art_direction"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ad_constraint" ADD CONSTRAINT "fk_adconst_opt" FOREIGN KEY ("constraint_option_id") REFERENCES "public"."constraint_option"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ad_place" ADD CONSTRAINT "fk_place_ad" FOREIGN KEY ("art_direction_id") REFERENCES "public"."art_direction"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ad_style" ADD CONSTRAINT "fk_adstyle_ad" FOREIGN KEY ("art_direction_id") REFERENCES "public"."art_direction"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ad_style" ADD CONSTRAINT "fk_adstyle_style" FOREIGN KEY ("style_id") REFERENCES "public"."style"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."art_direction" ADD CONSTRAINT "fk_ad_user" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."constraint_option" ADD CONSTRAINT "fk_copt_ctype" FOREIGN KEY ("constraint_type_id") REFERENCES "public"."constraint_type"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."favorite" ADD CONSTRAINT "fk_fav_ad" FOREIGN KEY ("art_direction_id") REFERENCES "public"."art_direction"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."favorite" ADD CONSTRAINT "fk_fav_user" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."gear" ADD CONSTRAINT "fk_gear_user" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."generation_job" ADD CONSTRAINT "fk_job_ad" FOREIGN KEY ("art_direction_id") REFERENCES "public"."art_direction"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."generation_job" ADD CONSTRAINT "fk_job_user" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."picture_generated" ADD CONSTRAINT "fk_pic_ad" FOREIGN KEY ("art_direction_id") REFERENCES "public"."art_direction"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."support_ticket" ADD CONSTRAINT "fk_ticket_user" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."password_reset_token" ADD CONSTRAINT "password_reset_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
