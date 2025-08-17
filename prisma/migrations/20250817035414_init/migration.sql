-- CreateTable
CREATE TABLE "public"."Summary" (
    "id" SERIAL NOT NULL,
    "original_text" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "summary_text" TEXT NOT NULL,
    "share_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Recipient" (
    "id" SERIAL NOT NULL,
    "summary_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "Recipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Summary_share_token_key" ON "public"."Summary"("share_token");

-- AddForeignKey
ALTER TABLE "public"."Recipient" ADD CONSTRAINT "Recipient_summary_id_fkey" FOREIGN KEY ("summary_id") REFERENCES "public"."Summary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
