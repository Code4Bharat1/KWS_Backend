-- CreateTable
CREATE TABLE "account_emailaddress" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "account_emailaddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_emailconfirmation" (
    "id" SERIAL NOT NULL,
    "created" TIMESTAMPTZ(6) NOT NULL,
    "sent" TIMESTAMPTZ(6),
    "key" VARCHAR(64) NOT NULL,
    "email_address_id" INTEGER NOT NULL,

    CONSTRAINT "account_emailconfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_group" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,

    CONSTRAINT "auth_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_group_permissions" (
    "id" BIGSERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "auth_group_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_permission" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "content_type_id" INTEGER NOT NULL,
    "codename" VARCHAR(100) NOT NULL,

    CONSTRAINT "auth_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_attendee" (
    "id" BIGSERIAL NOT NULL,
    "ticket_id" BIGINT,
    "num_people" INTEGER NOT NULL,
    "attended_time" TIMESTAMPTZ(6) NOT NULL,
    "event_id" BIGINT,
    "kws_member_id" BIGINT,

    CONSTRAINT "core_attendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_auditattendee" (
    "id" BIGSERIAL NOT NULL,
    "num_people" INTEGER NOT NULL,
    "action" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "attendee_id" BIGINT,
    "committed_id" BIGINT,

    CONSTRAINT "core_auditattendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_auditevent" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,
    "action" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "committed_id" BIGINT,
    "event_id" BIGINT,

    CONSTRAINT "core_auditevent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_auditeventticket" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "civil_id" VARCHAR(12) NOT NULL,
    "ticket_no" VARCHAR(50) NOT NULL,
    "amount_in_kwd" DECIMAL(10,3) NOT NULL,
    "action" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "committed_id" BIGINT,
    "ticket_id" BIGINT,

    CONSTRAINT "core_auditeventticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_auditfailedemail" (
    "id" BIGSERIAL NOT NULL,
    "resolved" BOOLEAN NOT NULL,
    "comments" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "committed_id" BIGINT,
    "failed_email_id" BIGINT,
    "resolved_by_id" BIGINT,

    CONSTRAINT "core_auditfailedemail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_auditmembertransactions" (
    "id" BIGSERIAL NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(10,3) NOT NULL,
    "date" DATE NOT NULL,
    "remarks" TEXT,
    "action" VARCHAR(10) NOT NULL,
    "created_date" TIMESTAMPTZ(6) NOT NULL,
    "committed_id" BIGINT,
    "member_id" BIGINT,
    "transaction_id" BIGINT,
    "slip" VARCHAR(100),

    CONSTRAINT "core_auditmembertransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_auditnonkwsmember" (
    "id" BIGSERIAL NOT NULL,
    "is_company" BOOLEAN NOT NULL,
    "first_name" VARCHAR(250),
    "middle_name" VARCHAR(150),
    "last_name" VARCHAR(150),
    "relation_to_kws" TEXT,
    "zone_member" VARCHAR(10),
    "email" VARCHAR(254),
    "blood_group" VARCHAR(3),
    "education_qualification" VARCHAR(150),
    "profession" VARCHAR(150),
    "contact" VARCHAR(100),
    "whatsapp" VARCHAR(100),
    "gender" VARCHAR(6),
    "marital_status" VARCHAR(7),
    "family_in_kuwait" VARCHAR(3),
    "flat_no" VARCHAR(25),
    "floor_no" VARCHAR(25),
    "block_no" VARCHAR(100),
    "building_name_no" VARCHAR(150),
    "street_no_name" VARCHAR(150),
    "area" VARCHAR(50),
    "action" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "account_id" BIGINT,
    "committed_id" BIGINT,

    CONSTRAINT "core_auditnonkwsmember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_auditsandouqchaboxholder" (
    "id" BIGSERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "in_use" BOOLEAN NOT NULL,
    "date_issued" DATE,
    "remarks" TEXT,
    "action" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "box_id" BIGINT,
    "committed_id" BIGINT,
    "member_id" BIGINT,
    "non_member_id" BIGINT,
    "referred_by_id" BIGINT,

    CONSTRAINT "core_auditsandouqchaboxholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_auditsandouqchatransaction" (
    "id" BIGSERIAL NOT NULL,
    "date" DATE NOT NULL,
    "note_20" INTEGER NOT NULL,
    "note_10" INTEGER NOT NULL,
    "note_5" INTEGER NOT NULL,
    "note_1" INTEGER NOT NULL,
    "note_0_5" INTEGER NOT NULL,
    "note_0_25" INTEGER NOT NULL,
    "coin_100" INTEGER NOT NULL,
    "coin_50" INTEGER NOT NULL,
    "coin_20" INTEGER NOT NULL,
    "coin_10" INTEGER NOT NULL,
    "coin_5" INTEGER NOT NULL,
    "action" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "box_id" BIGINT,
    "collected_by_id" BIGINT,
    "committed_id" BIGINT,
    "transaction_id" BIGINT,
    "status" VARCHAR(10) NOT NULL,
    "TID" VARCHAR(12) NOT NULL,
    "slip" VARCHAR(100),

    CONSTRAINT "core_auditsandouqchatransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_event" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "core_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_eventticket" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "civil_id" VARCHAR(12) NOT NULL,
    "ticket_no" VARCHAR(50) NOT NULL,
    "amount_in_kwd" DECIMAL(10,3) NOT NULL,
    "event_id" BIGINT,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "core_eventticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_failedemail" (
    "id" BIGSERIAL NOT NULL,
    "email_to" VARCHAR(200) NOT NULL,
    "reason_for_email" TEXT NOT NULL,
    "reason_for_failure" TEXT NOT NULL,
    "failed_time" TIMESTAMPTZ(6) NOT NULL,
    "resolved" BOOLEAN NOT NULL,
    "comments" TEXT,
    "resolved_by_id" BIGINT,

    CONSTRAINT "core_failedemail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_informationupdate" (
    "id" BIGSERIAL NOT NULL,
    "requested_date" TIMESTAMPTZ(6) NOT NULL,
    "updated_date" TIMESTAMPTZ(6) NOT NULL,
    "processed" BOOLEAN NOT NULL,
    "data" JSONB NOT NULL,
    "approved_by" VARCHAR(150),
    "member_id" BIGINT,

    CONSTRAINT "core_informationupdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_kwsmember" (
    "profile_picture" VARCHAR(100),
    "user_id" BIGINT NOT NULL,
    "civil_id" TEXT NOT NULL,
    "first_name" VARCHAR(150),
    "middle_name" VARCHAR(150),
    "last_name" VARCHAR(150),
    "email" VARCHAR(254),
    "dob" DATE,
    "blood_group" VARCHAR(3),
    "education_qualification" VARCHAR(150),
    "profession" VARCHAR(150),
    "kuwait_contact" VARCHAR(100),
    "kuwait_whatsapp" VARCHAR(100),
    "gender" VARCHAR(6) NOT NULL,
    "marital_status" VARCHAR(7),
    "family_in_kuwait" VARCHAR(3),
    "flat_no" VARCHAR(25),
    "floor_no" VARCHAR(25),
    "block_no" VARCHAR(100),
    "building_name_no" VARCHAR(150),
    "street_no_name" VARCHAR(150),
    "area" VARCHAR(50),
    "residence_complete_address" VARCHAR(300),
    "pin_no_india" VARCHAR(30),
    "mohalla_village" VARCHAR(150),
    "taluka" VARCHAR(150),
    "district" VARCHAR(150),
    "native_pin_no" VARCHAR(30),
    "indian_contact_no_1" VARCHAR(100),
    "indian_contact_no_2" VARCHAR(100),
    "indian_contact_no_3" VARCHAR(100),
    "emergency_name_kuwait" VARCHAR(150),
    "emergency_contact_kuwait" VARCHAR(100),
    "emergency_name_india" VARCHAR(150),
    "emergency_contact_india" VARCHAR(100),
    "father_name" VARCHAR(150),
    "mother_name" VARCHAR(150),
    "spouse_name" VARCHAR(150),
    "child_name_1" VARCHAR(150),
    "child_name_2" VARCHAR(150),
    "child_name_3" VARCHAR(150),
    "child_name_4" VARCHAR(150),
    "child_name_5" VARCHAR(150),
    "additional_information" TEXT,
    "full_name_1" VARCHAR(150),
    "relation_1" VARCHAR(50),
    "percentage_1" INTEGER,
    "mobile_1" VARCHAR(100),
    "full_name_2" VARCHAR(150),
    "relation_2" VARCHAR(50),
    "percentage_2" INTEGER,
    "mobile_2" VARCHAR(100),
    "full_name_3" VARCHAR(150),
    "relation_3" VARCHAR(50),
    "percentage_3" INTEGER,
    "mobile_3" VARCHAR(100),
    "full_name_4" VARCHAR(150),
    "relation_4" VARCHAR(50),
    "percentage_4" INTEGER,
    "mobile_4" VARCHAR(100),
    "kwsid" VARCHAR(10),
    "admin_charges" VARCHAR(3),
    "amount_in_kwd" DECIMAL(10,2),
    "type_of_member" VARCHAR(50),
    "approved_by" VARCHAR(150),
    "approved_date" DATE,
    "updated_date" TIMESTAMPTZ(6) NOT NULL,
    "application_date" TIMESTAMPTZ(6) NOT NULL,
    "form_scanned" VARCHAR(100),
    "form_received_by" VARCHAR(250),
    "card_printed" VARCHAR(3),
    "card_printed_date" DATE,
    "card_expiry_date" DATE,
    "follow_up_member" VARCHAR(100),
    "zone_member" VARCHAR(10),
    "office_comments" TEXT,
    "membership_status" VARCHAR(10),
    "requested_membership" VARCHAR(255),
    "general_address" VARCHAR(255),

    CONSTRAINT "core_kwsmember_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "core_luckydraw" (
    "id" BIGSERIAL NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "remarks" TEXT,
    "attendee_id" BIGINT,
    "event_id" BIGINT,

    CONSTRAINT "core_luckydraw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_membertransaction" (
    "id" BIGSERIAL NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(10,3) NOT NULL,
    "date" DATE NOT NULL,
    "remarks" TEXT,
    "member_id" BIGINT,
    "slip" VARCHAR(100),
    "approved_by_id" BIGINT,
    "status" VARCHAR(10) NOT NULL DEFAULT 'pending',

    CONSTRAINT "core_membertransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_nonkwsmember" (
    "id" BIGSERIAL NOT NULL,
    "is_company" BOOLEAN NOT NULL,
    "first_name" VARCHAR(250),
    "middle_name" VARCHAR(150),
    "last_name" VARCHAR(150),
    "relation_to_kws" TEXT,
    "zone_member" VARCHAR(10),
    "email" VARCHAR(254),
    "blood_group" VARCHAR(3),
    "education_qualification" VARCHAR(150),
    "profession" VARCHAR(150),
    "contact" VARCHAR(100),
    "whatsapp" VARCHAR(100),
    "gender" VARCHAR(6),
    "marital_status" VARCHAR(7),
    "family_in_kuwait" VARCHAR(3),
    "flat_no" VARCHAR(25),
    "floor_no" VARCHAR(25),
    "block_no" VARCHAR(100),
    "building_name_no" VARCHAR(150),
    "street_no_name" VARCHAR(150),
    "area" VARCHAR(50),

    CONSTRAINT "core_nonkwsmember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_sandouqchaboxholder" (
    "id" BIGSERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "in_use" BOOLEAN NOT NULL,
    "date_issued" DATE,
    "remarks" TEXT,
    "member_id" BIGINT,
    "non_member_id" BIGINT,
    "referred_by_id" BIGINT,

    CONSTRAINT "core_sandouqchaboxholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_sandouqchatransaction" (
    "id" BIGSERIAL NOT NULL,
    "date" DATE NOT NULL,
    "note_20" INTEGER NOT NULL,
    "note_10" INTEGER NOT NULL,
    "note_5" INTEGER NOT NULL,
    "note_1" INTEGER NOT NULL,
    "note_0_5" INTEGER NOT NULL,
    "note_0_25" INTEGER NOT NULL,
    "coin_100" INTEGER NOT NULL,
    "coin_50" INTEGER NOT NULL,
    "coin_20" INTEGER NOT NULL,
    "coin_10" INTEGER NOT NULL,
    "coin_5" INTEGER NOT NULL,
    "box_id" BIGINT,
    "collected_by_id" BIGINT,
    "status" VARCHAR(10) NOT NULL,
    "TID" VARCHAR(12) NOT NULL,
    "slip" VARCHAR(100),
    "approved_by_id" BIGINT,

    CONSTRAINT "core_sandouqchatransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_admin_log" (
    "id" SERIAL NOT NULL,
    "action_time" TIMESTAMPTZ(6) NOT NULL,
    "object_id" TEXT,
    "object_repr" VARCHAR(200) NOT NULL,
    "action_flag" SMALLINT NOT NULL,
    "change_message" TEXT NOT NULL,
    "content_type_id" INTEGER,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "django_admin_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_celery_beat_clockedschedule" (
    "id" SERIAL NOT NULL,
    "clocked_time" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "django_celery_beat_clockedschedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_celery_beat_crontabschedule" (
    "id" SERIAL NOT NULL,
    "minute" VARCHAR(240) NOT NULL,
    "hour" VARCHAR(96) NOT NULL,
    "day_of_week" VARCHAR(64) NOT NULL,
    "day_of_month" VARCHAR(124) NOT NULL,
    "month_of_year" VARCHAR(64) NOT NULL,
    "timezone" VARCHAR(63) NOT NULL,

    CONSTRAINT "django_celery_beat_crontabschedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_celery_beat_intervalschedule" (
    "id" SERIAL NOT NULL,
    "every" INTEGER NOT NULL,
    "period" VARCHAR(24) NOT NULL,

    CONSTRAINT "django_celery_beat_intervalschedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_celery_beat_periodictask" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "task" VARCHAR(200) NOT NULL,
    "args" TEXT NOT NULL,
    "kwargs" TEXT NOT NULL,
    "queue" VARCHAR(200),
    "exchange" VARCHAR(200),
    "routing_key" VARCHAR(200),
    "expires" TIMESTAMPTZ(6),
    "enabled" BOOLEAN NOT NULL,
    "last_run_at" TIMESTAMPTZ(6),
    "total_run_count" INTEGER NOT NULL,
    "date_changed" TIMESTAMPTZ(6) NOT NULL,
    "description" TEXT NOT NULL,
    "crontab_id" INTEGER,
    "interval_id" INTEGER,
    "solar_id" INTEGER,
    "one_off" BOOLEAN NOT NULL,
    "start_time" TIMESTAMPTZ(6),
    "priority" INTEGER,
    "headers" TEXT NOT NULL,
    "clocked_id" INTEGER,
    "expire_seconds" INTEGER,

    CONSTRAINT "django_celery_beat_periodictask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_celery_beat_periodictasks" (
    "ident" SMALLINT NOT NULL,
    "last_update" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "django_celery_beat_periodictasks_pkey" PRIMARY KEY ("ident")
);

-- CreateTable
CREATE TABLE "django_celery_beat_solarschedule" (
    "id" SERIAL NOT NULL,
    "event" VARCHAR(24) NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,

    CONSTRAINT "django_celery_beat_solarschedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_content_type" (
    "id" SERIAL NOT NULL,
    "app_label" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,

    CONSTRAINT "django_content_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_migrations" (
    "id" BIGSERIAL NOT NULL,
    "app" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "applied" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "django_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_session" (
    "session_key" VARCHAR(40) NOT NULL,
    "session_data" TEXT NOT NULL,
    "expire_date" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "django_session_pkey" PRIMARY KEY ("session_key")
);

-- CreateTable
CREATE TABLE "django_site" (
    "id" SERIAL NOT NULL,
    "domain" VARCHAR(100) NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "django_site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socialaccount_socialaccount" (
    "id" SERIAL NOT NULL,
    "provider" VARCHAR(30) NOT NULL,
    "uid" VARCHAR(191) NOT NULL,
    "last_login" TIMESTAMPTZ(6) NOT NULL,
    "date_joined" TIMESTAMPTZ(6) NOT NULL,
    "extra_data" TEXT NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "socialaccount_socialaccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socialaccount_socialapp" (
    "id" SERIAL NOT NULL,
    "provider" VARCHAR(30) NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "client_id" VARCHAR(191) NOT NULL,
    "secret" VARCHAR(191) NOT NULL,
    "key" VARCHAR(191) NOT NULL,

    CONSTRAINT "socialaccount_socialapp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socialaccount_socialapp_sites" (
    "id" BIGSERIAL NOT NULL,
    "socialapp_id" INTEGER NOT NULL,
    "site_id" INTEGER NOT NULL,

    CONSTRAINT "socialaccount_socialapp_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socialaccount_socialtoken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "token_secret" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6),
    "account_id" INTEGER NOT NULL,
    "app_id" INTEGER NOT NULL,

    CONSTRAINT "socialaccount_socialtoken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_user" (
    "id" BIGSERIAL NOT NULL,
    "password" VARCHAR(128) NOT NULL,
    "last_login" TIMESTAMPTZ(6),
    "is_superuser" BOOLEAN NOT NULL,
    "username" VARCHAR(150) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "is_staff" BOOLEAN NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "date_joined" TIMESTAMPTZ(6) NOT NULL,
    "staff_roles" JSONB NOT NULL,

    CONSTRAINT "users_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_user_groups" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "users_user_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_user_user_permissions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "users_user_user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_memberrenewal" (
    "id" BIGSERIAL NOT NULL,
    "requested_date" TIMESTAMPTZ(6) NOT NULL,
    "updated_date" TIMESTAMPTZ(6) NOT NULL,
    "processed" BOOLEAN NOT NULL,
    "data" JSONB NOT NULL,
    "approved_by" VARCHAR(150),
    "member_id" BIGINT,

    CONSTRAINT "core_memberrenewal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_raffle" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "prize" VARCHAR(250) NOT NULL,
    "organizer_id" VARCHAR(50) NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "core_raffle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_emailaddress_email_key" ON "account_emailaddress"("email");

-- CreateIndex
CREATE INDEX "account_emailaddress_email_03be32b2_like" ON "account_emailaddress"("email");

-- CreateIndex
CREATE INDEX "account_emailaddress_user_id_2c513194" ON "account_emailaddress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_emailconfirmation_key_key" ON "account_emailconfirmation"("key");

-- CreateIndex
CREATE INDEX "account_emailconfirmation_email_address_id_5b7f8c58" ON "account_emailconfirmation"("email_address_id");

-- CreateIndex
CREATE INDEX "account_emailconfirmation_key_f43612bd_like" ON "account_emailconfirmation"("key");

-- CreateIndex
CREATE UNIQUE INDEX "auth_group_name_key" ON "auth_group"("name");

-- CreateIndex
CREATE INDEX "auth_group_name_a6ea08ec_like" ON "auth_group"("name");

-- CreateIndex
CREATE INDEX "auth_group_permissions_group_id_b120cbf9" ON "auth_group_permissions"("group_id");

-- CreateIndex
CREATE INDEX "auth_group_permissions_permission_id_84c5c92e" ON "auth_group_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_group_permissions_group_id_permission_id_0cd325b0_uniq" ON "auth_group_permissions"("group_id", "permission_id");

-- CreateIndex
CREATE INDEX "auth_permission_content_type_id_2f476e4b" ON "auth_permission"("content_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_permission_content_type_id_codename_01ab375a_uniq" ON "auth_permission"("content_type_id", "codename");

-- CreateIndex
CREATE INDEX "core_attendee_event_id_7f07451e" ON "core_attendee"("event_id");

-- CreateIndex
CREATE INDEX "core_attendee_kws_member_id_6059386c" ON "core_attendee"("kws_member_id");

-- CreateIndex
CREATE INDEX "core_attendee_ticket_id_140cb005" ON "core_attendee"("ticket_id");

-- CreateIndex
CREATE INDEX "core_auditattendee_attendee_id_646ec007" ON "core_auditattendee"("attendee_id");

-- CreateIndex
CREATE INDEX "core_auditattendee_committed_id_cfa1428f" ON "core_auditattendee"("committed_id");

-- CreateIndex
CREATE INDEX "core_auditevent_committed_id_790e18eb" ON "core_auditevent"("committed_id");

-- CreateIndex
CREATE INDEX "core_auditevent_event_id_6d47a18c" ON "core_auditevent"("event_id");

-- CreateIndex
CREATE INDEX "core_auditeventticket_committed_id_56e8b8a4" ON "core_auditeventticket"("committed_id");

-- CreateIndex
CREATE INDEX "core_auditeventticket_ticket_id_e3d38a6c" ON "core_auditeventticket"("ticket_id");

-- CreateIndex
CREATE INDEX "core_auditfailedemail_committed_id_99aefd69" ON "core_auditfailedemail"("committed_id");

-- CreateIndex
CREATE INDEX "core_auditfailedemail_failed_email_id_45fdf716" ON "core_auditfailedemail"("failed_email_id");

-- CreateIndex
CREATE INDEX "core_auditfailedemail_resolved_by_id_8c1925b9" ON "core_auditfailedemail"("resolved_by_id");

-- CreateIndex
CREATE INDEX "core_auditmembertransactions_committed_id_ed29971c" ON "core_auditmembertransactions"("committed_id");

-- CreateIndex
CREATE INDEX "core_auditmembertransactions_member_id_dc6f4923" ON "core_auditmembertransactions"("member_id");

-- CreateIndex
CREATE INDEX "core_auditmembertransactions_transaction_id_65e59db6" ON "core_auditmembertransactions"("transaction_id");

-- CreateIndex
CREATE INDEX "core_auditnonkwsmember_account_id_c8fb02b9" ON "core_auditnonkwsmember"("account_id");

-- CreateIndex
CREATE INDEX "core_auditnonkwsmember_committed_id_cc6a3563" ON "core_auditnonkwsmember"("committed_id");

-- CreateIndex
CREATE INDEX "core_auditsandouqchaboxholder_box_id_c795416d" ON "core_auditsandouqchaboxholder"("box_id");

-- CreateIndex
CREATE INDEX "core_auditsandouqchaboxholder_committed_id_3c271af4" ON "core_auditsandouqchaboxholder"("committed_id");

-- CreateIndex
CREATE INDEX "core_auditsandouqchaboxholder_member_id_e268d88f" ON "core_auditsandouqchaboxholder"("member_id");

-- CreateIndex
CREATE INDEX "core_auditsandouqchaboxholder_non_member_id_2d091b98" ON "core_auditsandouqchaboxholder"("non_member_id");

-- CreateIndex
CREATE INDEX "core_auditsandouqchaboxholder_referred_by_id_8a171021" ON "core_auditsandouqchaboxholder"("referred_by_id");

-- CreateIndex
CREATE INDEX "core_auditsandouqchatransaction_box_id_59b86d39" ON "core_auditsandouqchatransaction"("box_id");

-- CreateIndex
CREATE INDEX "core_auditsandouqchatransaction_collected_by_id_05fb1dfc" ON "core_auditsandouqchatransaction"("collected_by_id");

-- CreateIndex
CREATE INDEX "core_auditsandouqchatransaction_committed_id_72310e15" ON "core_auditsandouqchatransaction"("committed_id");

-- CreateIndex
CREATE INDEX "core_auditsandouqchatransaction_transaction_id_031f80cd" ON "core_auditsandouqchatransaction"("transaction_id");

-- CreateIndex
CREATE INDEX "core_eventticket_event_id_c6580ce6" ON "core_eventticket"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_ticket_created_per_event" ON "core_eventticket"("event_id", "ticket_no");

-- CreateIndex
CREATE INDEX "core_failedemail_resolved_by_id_ac9d98a8" ON "core_failedemail"("resolved_by_id");

-- CreateIndex
CREATE INDEX "core_informationupdate_member_id_b646865c" ON "core_informationupdate"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "core_kwsmember_civil_id_key" ON "core_kwsmember"("civil_id");

-- CreateIndex
CREATE INDEX "core_kwsmember_civil_id_9d8c8e12_like" ON "core_kwsmember"("civil_id");

-- CreateIndex
CREATE INDEX "core_kwsmember_kwsid_e46800af" ON "core_kwsmember"("kwsid");

-- CreateIndex
CREATE INDEX "core_kwsmember_kwsid_e46800af_like" ON "core_kwsmember"("kwsid");

-- CreateIndex
CREATE INDEX "core_luckydraw_attendee_id_7d4ff97c" ON "core_luckydraw"("attendee_id");

-- CreateIndex
CREATE INDEX "core_luckydraw_event_id_a4a07889" ON "core_luckydraw"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_lucky_draw_per_event" ON "core_luckydraw"("event_id", "attendee_id");

-- CreateIndex
CREATE INDEX "core_membertransaction_member_id_a9db06b1" ON "core_membertransaction"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "core_sandouqchaboxholder_number_key" ON "core_sandouqchaboxholder"("number");

-- CreateIndex
CREATE UNIQUE INDEX "core_sandouqchaboxholder_member_id_key" ON "core_sandouqchaboxholder"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "core_sandouqchaboxholder_non_member_id_key" ON "core_sandouqchaboxholder"("non_member_id");

-- CreateIndex
CREATE INDEX "core_sandouqchaboxholder_referred_by_id_bf51f5dc" ON "core_sandouqchaboxholder"("referred_by_id");

-- CreateIndex
CREATE INDEX "core_sandouqchatransaction_box_id_75519a4e" ON "core_sandouqchatransaction"("box_id");

-- CreateIndex
CREATE INDEX "core_sandouqchatransaction_collected_by_id_41f2b692" ON "core_sandouqchatransaction"("collected_by_id");

-- CreateIndex
CREATE INDEX "django_admin_log_content_type_id_c4bce8eb" ON "django_admin_log"("content_type_id");

-- CreateIndex
CREATE INDEX "django_admin_log_user_id_c564eba6" ON "django_admin_log"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "django_celery_beat_periodictask_name_key" ON "django_celery_beat_periodictask"("name");

-- CreateIndex
CREATE INDEX "django_celery_beat_periodictask_clocked_id_47a69f82" ON "django_celery_beat_periodictask"("clocked_id");

-- CreateIndex
CREATE INDEX "django_celery_beat_periodictask_crontab_id_d3cba168" ON "django_celery_beat_periodictask"("crontab_id");

-- CreateIndex
CREATE INDEX "django_celery_beat_periodictask_interval_id_a8ca27da" ON "django_celery_beat_periodictask"("interval_id");

-- CreateIndex
CREATE INDEX "django_celery_beat_periodictask_name_265a36b7_like" ON "django_celery_beat_periodictask"("name");

-- CreateIndex
CREATE INDEX "django_celery_beat_periodictask_solar_id_a87ce72c" ON "django_celery_beat_periodictask"("solar_id");

-- CreateIndex
CREATE UNIQUE INDEX "django_celery_beat_solar_event_latitude_longitude_ba64999a_uniq" ON "django_celery_beat_solarschedule"("event", "latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "django_content_type_app_label_model_76bd3d3b_uniq" ON "django_content_type"("app_label", "model");

-- CreateIndex
CREATE INDEX "django_session_expire_date_a5c62663" ON "django_session"("expire_date");

-- CreateIndex
CREATE INDEX "django_session_session_key_c0390e0f_like" ON "django_session"("session_key");

-- CreateIndex
CREATE UNIQUE INDEX "django_site_domain_a2e37b91_uniq" ON "django_site"("domain");

-- CreateIndex
CREATE INDEX "django_site_domain_a2e37b91_like" ON "django_site"("domain");

-- CreateIndex
CREATE INDEX "socialaccount_socialaccount_user_id_8146e70c" ON "socialaccount_socialaccount"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "socialaccount_socialaccount_provider_uid_fc810c6e_uniq" ON "socialaccount_socialaccount"("provider", "uid");

-- CreateIndex
CREATE INDEX "socialaccount_socialapp_sites_site_id_2579dee5" ON "socialaccount_socialapp_sites"("site_id");

-- CreateIndex
CREATE INDEX "socialaccount_socialapp_sites_socialapp_id_97fb6e7d" ON "socialaccount_socialapp_sites"("socialapp_id");

-- CreateIndex
CREATE UNIQUE INDEX "socialaccount_socialapp__socialapp_id_site_id_71a9a768_uniq" ON "socialaccount_socialapp_sites"("socialapp_id", "site_id");

-- CreateIndex
CREATE INDEX "socialaccount_socialtoken_account_id_951f210e" ON "socialaccount_socialtoken"("account_id");

-- CreateIndex
CREATE INDEX "socialaccount_socialtoken_app_id_636a42d7" ON "socialaccount_socialtoken"("app_id");

-- CreateIndex
CREATE UNIQUE INDEX "socialaccount_socialtoken_app_id_account_id_fca4e0ac_uniq" ON "socialaccount_socialtoken"("app_id", "account_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_username_key" ON "users_user"("username");

-- CreateIndex
CREATE INDEX "users_user_username_06e46fe6_like" ON "users_user"("username");

-- CreateIndex
CREATE INDEX "users_user_groups_group_id_9afc8d0e" ON "users_user_groups"("group_id");

-- CreateIndex
CREATE INDEX "users_user_groups_user_id_5f6f5a90" ON "users_user_groups"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_groups_user_id_group_id_b88eab82_uniq" ON "users_user_groups"("user_id", "group_id");

-- CreateIndex
CREATE INDEX "users_user_user_permissions_permission_id_0b93982e" ON "users_user_user_permissions"("permission_id");

-- CreateIndex
CREATE INDEX "users_user_user_permissions_user_id_20aca447" ON "users_user_user_permissions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_user_permissions_user_id_permission_id_43338c45_uniq" ON "users_user_user_permissions"("user_id", "permission_id");

-- CreateIndex
CREATE INDEX "core_memberrenewal_member_id_f10247f3" ON "core_memberrenewal"("member_id");

-- AddForeignKey
ALTER TABLE "account_emailaddress" ADD CONSTRAINT "account_emailaddress_user_id_2c513194_fk_users_user_id" FOREIGN KEY ("user_id") REFERENCES "users_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "account_emailconfirmation" ADD CONSTRAINT "account_emailconfirm_email_address_id_5b7f8c58_fk_account_e" FOREIGN KEY ("email_address_id") REFERENCES "account_emailaddress"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissio_permission_id_84c5c92e_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "auth_permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissions_group_id_b120cbf9_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "auth_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_permission" ADD CONSTRAINT "auth_permission_content_type_id_2f476e4b_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "django_content_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_attendee" ADD CONSTRAINT "core_attendee_event_id_7f07451e_fk_core_event_id" FOREIGN KEY ("event_id") REFERENCES "core_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_attendee" ADD CONSTRAINT "core_attendee_kws_member_id_6059386c_fk_core_kwsmember_user_id" FOREIGN KEY ("kws_member_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_attendee" ADD CONSTRAINT "core_attendee_ticket_id_140cb005_fk_core_eventticket_id" FOREIGN KEY ("ticket_id") REFERENCES "core_eventticket"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditattendee" ADD CONSTRAINT "core_auditattendee_attendee_id_646ec007_fk_core_attendee_id" FOREIGN KEY ("attendee_id") REFERENCES "core_attendee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditattendee" ADD CONSTRAINT "core_auditattendee_committed_id_cfa1428f_fk_core_kwsm" FOREIGN KEY ("committed_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditevent" ADD CONSTRAINT "core_auditevent_committed_id_790e18eb_fk_core_kwsmember_user_id" FOREIGN KEY ("committed_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditevent" ADD CONSTRAINT "core_auditevent_event_id_6d47a18c_fk_core_event_id" FOREIGN KEY ("event_id") REFERENCES "core_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditeventticket" ADD CONSTRAINT "core_auditeventticke_committed_id_56e8b8a4_fk_core_kwsm" FOREIGN KEY ("committed_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditeventticket" ADD CONSTRAINT "core_auditeventticket_ticket_id_e3d38a6c_fk_core_eventticket_id" FOREIGN KEY ("ticket_id") REFERENCES "core_eventticket"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditfailedemail" ADD CONSTRAINT "core_auditfailedemai_committed_id_99aefd69_fk_core_kwsm" FOREIGN KEY ("committed_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditfailedemail" ADD CONSTRAINT "core_auditfailedemai_failed_email_id_45fdf716_fk_core_fail" FOREIGN KEY ("failed_email_id") REFERENCES "core_failedemail"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditfailedemail" ADD CONSTRAINT "core_auditfailedemai_resolved_by_id_8c1925b9_fk_core_kwsm" FOREIGN KEY ("resolved_by_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditmembertransactions" ADD CONSTRAINT "core_auditmembertran_committed_id_ed29971c_fk_core_kwsm" FOREIGN KEY ("committed_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditmembertransactions" ADD CONSTRAINT "core_auditmembertran_member_id_dc6f4923_fk_core_kwsm" FOREIGN KEY ("member_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditmembertransactions" ADD CONSTRAINT "core_auditmembertran_transaction_id_65e59db6_fk_core_memb" FOREIGN KEY ("transaction_id") REFERENCES "core_membertransaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditnonkwsmember" ADD CONSTRAINT "core_auditnonkwsmemb_account_id_c8fb02b9_fk_core_nonk" FOREIGN KEY ("account_id") REFERENCES "core_nonkwsmember"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditnonkwsmember" ADD CONSTRAINT "core_auditnonkwsmemb_committed_id_cc6a3563_fk_core_kwsm" FOREIGN KEY ("committed_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditsandouqchaboxholder" ADD CONSTRAINT "core_auditsandouqcha_box_id_c795416d_fk_core_sand" FOREIGN KEY ("box_id") REFERENCES "core_sandouqchaboxholder"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditsandouqchaboxholder" ADD CONSTRAINT "core_auditsandouqcha_committed_id_3c271af4_fk_core_kwsm" FOREIGN KEY ("committed_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditsandouqchaboxholder" ADD CONSTRAINT "core_auditsandouqcha_member_id_e268d88f_fk_core_kwsm" FOREIGN KEY ("member_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditsandouqchaboxholder" ADD CONSTRAINT "core_auditsandouqcha_non_member_id_2d091b98_fk_core_nonk" FOREIGN KEY ("non_member_id") REFERENCES "core_nonkwsmember"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditsandouqchaboxholder" ADD CONSTRAINT "core_auditsandouqcha_referred_by_id_8a171021_fk_core_kwsm" FOREIGN KEY ("referred_by_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditsandouqchatransaction" ADD CONSTRAINT "core_auditsandouqcha_box_id_59b86d39_fk_core_sand" FOREIGN KEY ("box_id") REFERENCES "core_sandouqchaboxholder"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditsandouqchatransaction" ADD CONSTRAINT "core_auditsandouqcha_collected_by_id_05fb1dfc_fk_core_kwsm" FOREIGN KEY ("collected_by_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditsandouqchatransaction" ADD CONSTRAINT "core_auditsandouqcha_committed_id_72310e15_fk_core_kwsm" FOREIGN KEY ("committed_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_auditsandouqchatransaction" ADD CONSTRAINT "core_auditsandouqcha_transaction_id_031f80cd_fk_core_sand" FOREIGN KEY ("transaction_id") REFERENCES "core_sandouqchatransaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_eventticket" ADD CONSTRAINT "core_eventticket_event_id_c6580ce6_fk_core_event_id" FOREIGN KEY ("event_id") REFERENCES "core_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_failedemail" ADD CONSTRAINT "core_failedemail_resolved_by_id_ac9d98a8_fk_core_kwsm" FOREIGN KEY ("resolved_by_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_informationupdate" ADD CONSTRAINT "core_informationupda_member_id_b646865c_fk_core_kwsm" FOREIGN KEY ("member_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_kwsmember" ADD CONSTRAINT "core_kwsmember_user_id_88bb0b4e_fk_users_user_id" FOREIGN KEY ("user_id") REFERENCES "users_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_luckydraw" ADD CONSTRAINT "core_luckydraw_attendee_id_7d4ff97c_fk_core_attendee_id" FOREIGN KEY ("attendee_id") REFERENCES "core_attendee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_luckydraw" ADD CONSTRAINT "core_luckydraw_event_id_a4a07889_fk_core_event_id" FOREIGN KEY ("event_id") REFERENCES "core_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_membertransaction" ADD CONSTRAINT "core_membertransacti_member_id_a9db06b1_fk_core_kwsm" FOREIGN KEY ("member_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_membertransaction" ADD CONSTRAINT "fk_approved_by" FOREIGN KEY ("approved_by_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_sandouqchaboxholder" ADD CONSTRAINT "core_sandouqchaboxho_member_id_a846af5c_fk_core_kwsm" FOREIGN KEY ("member_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_sandouqchaboxholder" ADD CONSTRAINT "core_sandouqchaboxho_non_member_id_f7d32d87_fk_core_nonk" FOREIGN KEY ("non_member_id") REFERENCES "core_nonkwsmember"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_sandouqchaboxholder" ADD CONSTRAINT "core_sandouqchaboxho_referred_by_id_bf51f5dc_fk_core_kwsm" FOREIGN KEY ("referred_by_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_sandouqchatransaction" ADD CONSTRAINT "core_sandouqchatrans_box_id_75519a4e_fk_core_sand" FOREIGN KEY ("box_id") REFERENCES "core_sandouqchaboxholder"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_sandouqchatransaction" ADD CONSTRAINT "core_sandouqchatrans_collected_by_id_41f2b692_fk_core_kwsm" FOREIGN KEY ("collected_by_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_sandouqchatransaction" ADD CONSTRAINT "fk_approved_by" FOREIGN KEY ("approved_by_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_content_type_id_c4bce8eb_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "django_content_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_user_id_c564eba6_fk_users_user_id" FOREIGN KEY ("user_id") REFERENCES "users_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "django_celery_beat_periodictask" ADD CONSTRAINT "django_celery_beat_p_clocked_id_47a69f82_fk_django_ce" FOREIGN KEY ("clocked_id") REFERENCES "django_celery_beat_clockedschedule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "django_celery_beat_periodictask" ADD CONSTRAINT "django_celery_beat_p_crontab_id_d3cba168_fk_django_ce" FOREIGN KEY ("crontab_id") REFERENCES "django_celery_beat_crontabschedule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "django_celery_beat_periodictask" ADD CONSTRAINT "django_celery_beat_p_interval_id_a8ca27da_fk_django_ce" FOREIGN KEY ("interval_id") REFERENCES "django_celery_beat_intervalschedule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "django_celery_beat_periodictask" ADD CONSTRAINT "django_celery_beat_p_solar_id_a87ce72c_fk_django_ce" FOREIGN KEY ("solar_id") REFERENCES "django_celery_beat_solarschedule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "socialaccount_socialaccount" ADD CONSTRAINT "socialaccount_socialaccount_user_id_8146e70c_fk_users_user_id" FOREIGN KEY ("user_id") REFERENCES "users_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "socialaccount_socialapp_sites" ADD CONSTRAINT "socialaccount_social_site_id_2579dee5_fk_django_si" FOREIGN KEY ("site_id") REFERENCES "django_site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "socialaccount_socialapp_sites" ADD CONSTRAINT "socialaccount_social_socialapp_id_97fb6e7d_fk_socialacc" FOREIGN KEY ("socialapp_id") REFERENCES "socialaccount_socialapp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "socialaccount_socialtoken" ADD CONSTRAINT "socialaccount_social_account_id_951f210e_fk_socialacc" FOREIGN KEY ("account_id") REFERENCES "socialaccount_socialaccount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "socialaccount_socialtoken" ADD CONSTRAINT "socialaccount_social_app_id_636a42d7_fk_socialacc" FOREIGN KEY ("app_id") REFERENCES "socialaccount_socialapp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_user_groups" ADD CONSTRAINT "users_user_groups_group_id_9afc8d0e_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "auth_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_user_groups" ADD CONSTRAINT "users_user_groups_user_id_5f6f5a90_fk_users_user_id" FOREIGN KEY ("user_id") REFERENCES "users_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_user_user_permissions" ADD CONSTRAINT "users_user_user_perm_permission_id_0b93982e_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "auth_permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_user_user_permissions" ADD CONSTRAINT "users_user_user_permissions_user_id_20aca447_fk_users_user_id" FOREIGN KEY ("user_id") REFERENCES "users_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_memberrenewal" ADD CONSTRAINT "core_memberrenewal_member_id_f10247f3_fk_core_kwsmember_user_id" FOREIGN KEY ("member_id") REFERENCES "core_kwsmember"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
