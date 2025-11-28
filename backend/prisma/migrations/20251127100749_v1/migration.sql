-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "open" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_types" (
    "id" SERIAL NOT NULL,
    "type_name" VARCHAR(20) NOT NULL,
    "description" VARCHAR(100),
    "starting_score" INTEGER NOT NULL DEFAULT 25000,
    "ending_score" INTEGER NOT NULL,
    "point_first" INTEGER NOT NULL,
    "point_second" INTEGER NOT NULL,
    "point_third" INTEGER NOT NULL,
    "point_fourth" INTEGER NOT NULL,

    CONSTRAINT "game_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "is_detailed" BOOLEAN NOT NULL DEFAULT true,
    "game_type" INTEGER NOT NULL,
    "game_date" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_players" (
    "session_id" UUID NOT NULL,
    "seat" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "final_ranking" INTEGER NOT NULL,
    "final_score" INTEGER NOT NULL,
    "final_point" DECIMAL(6,1) NOT NULL,

    CONSTRAINT "session_players_pkey" PRIMARY KEY ("session_id","seat")
);

-- CreateTable
CREATE TABLE "round_records" (
    "session_id" UUID NOT NULL,
    "idx" INTEGER NOT NULL,
    "wind" INTEGER NOT NULL,
    "dealer" INTEGER NOT NULL,
    "honba" INTEGER NOT NULL DEFAULT 0,
    "kyotaku" INTEGER NOT NULL DEFAULT 0,
    "renchan" BOOLEAN NOT NULL DEFAULT false,
    "ryukyoku" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "round_records_pkey" PRIMARY KEY ("session_id","idx")
);

-- CreateTable
CREATE TABLE "round_player_status" (
    "session_id" UUID NOT NULL,
    "idx" INTEGER NOT NULL,
    "seat" INTEGER NOT NULL,
    "win" BOOLEAN NOT NULL DEFAULT false,
    "tsumo" BOOLEAN NOT NULL DEFAULT false,
    "lose" BOOLEAN NOT NULL DEFAULT false,
    "fuulu" BOOLEAN NOT NULL DEFAULT false,
    "reach" BOOLEAN NOT NULL DEFAULT false,
    "startingscore" INTEGER NOT NULL,
    "deltascore" INTEGER NOT NULL,

    CONSTRAINT "round_player_status_pkey" PRIMARY KEY ("session_id","idx","seat")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "game_types_type_name_key" ON "game_types"("type_name");

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_game_type_fkey" FOREIGN KEY ("game_type") REFERENCES "game_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_players" ADD CONSTRAINT "session_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_players" ADD CONSTRAINT "session_players_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_records" ADD CONSTRAINT "round_records_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_player_status" ADD CONSTRAINT "round_player_status_session_id_idx_fkey" FOREIGN KEY ("session_id", "idx") REFERENCES "round_records"("session_id", "idx") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_player_status" ADD CONSTRAINT "round_player_status_session_id_seat_fkey" FOREIGN KEY ("session_id", "seat") REFERENCES "session_players"("session_id", "seat") ON DELETE CASCADE ON UPDATE CASCADE;
