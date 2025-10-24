-- CreateEnum
CREATE TYPE "StayType" AS ENUM ('HOSTEL', 'GUESTHOUSE_HOTEL', 'APARTMENT_HOMESTAY', 'RESORT_VILLA');

-- CreateEnum
CREATE TYPE "LocationTag" AS ENUM ('BEACHFRONT', 'NEAR_BEACH', 'NORTH_CLIFF', 'SOUTH_CLIFF', 'TOWN_INLAND');

-- CreateEnum
CREATE TYPE "TravelerTag" AS ENUM ('BACKPACKERS', 'COUPLES', 'FAMILIES', 'SOLO', 'REMOTE_WORKERS');

-- CreateEnum
CREATE TYPE "Amenity" AS ENUM ('AC', 'WIFI', 'HOT_WATER', 'PARKING', 'KITCHEN', 'POOL', 'RESTAURANT', 'YOGA', 'WASHING_MACHINE', 'POWER_BACKUP');

-- CreateEnum
CREATE TYPE "PriceBand" AS ENUM ('BUDGET', 'MID', 'PREMIUM');

-- CreateEnum
CREATE TYPE "QualityLevel" AS ENUM ('POOR', 'BASIC', 'GOOD', 'EXCELLENT');

-- CreateEnum
CREATE TYPE "NoiseLevel" AS ENUM ('QUIET', 'MODERATE', 'NOISY');

-- CreateEnum
CREATE TYPE "BathroomType" AS ENUM ('PRIVATE_ATTACHED', 'PRIVATE_DETACHED', 'SHARED');

-- CreateEnum
CREATE TYPE "HotWaterType" AS ENUM ('NONE', 'SOLAR', 'GEYSER_INSTANT', 'GEYSER_STORAGE');

-- CreateEnum
CREATE TYPE "WifiReliability" AS ENUM ('NONE', 'BASIC_BROWSING', 'VIDEO_CALL_CAPABLE', 'EXCELLENT');

-- CreateEnum
CREATE TYPE "BedSize" AS ENUM ('SINGLE', 'DOUBLE', 'QUEEN', 'KING');

-- CreateEnum
CREATE TYPE "KitchenQuality" AS ENUM ('NONE', 'BASIC_KETTLE', 'SHARED_KITCHEN', 'PRIVATE_KITCHENETTE', 'PRIVATE_FULL_KITCHEN');

-- CreateEnum
CREATE TYPE "OperationalStatus" AS ENUM ('OPEN', 'CLOSED_TEMPORARILY', 'CLOSED_PERMANENTLY');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'BUSINESS_VERIFIED');

-- CreateTable
CREATE TABLE "Stay" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StayType" NOT NULL,
    "geo_latitude" DOUBLE PRECISION NOT NULL,
    "geo_longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "whatsapp" TEXT,
    "description" TEXT NOT NULL,
    "website_social" TEXT,
    "operational_status" "OperationalStatus" NOT NULL DEFAULT 'OPEN',
    "season_label" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "completeness_score" INTEGER NOT NULL DEFAULT 0,
    "location_tags" "LocationTag"[],
    "traveler_tags" "TravelerTag"[],
    "amenities" "Amenity"[],
    "price_band" "PriceBand" NOT NULL,
    "price_range_low" TEXT,
    "price_range_high" TEXT,
    "price_monthly_note" TEXT,
    "cleanliness_level" "QualityLevel",
    "noise_level" "NoiseLevel",
    "light_level" "QualityLevel",
    "airflow" TEXT,
    "view_note" TEXT,
    "bathroom_type" "BathroomType",
    "hot_water_type" "HotWaterType",
    "pressure_note" TEXT,
    "wifi_speed_mbps" INTEGER,
    "wifi_reliability" "WifiReliability",
    "in_room_signal" "QualityLevel",
    "outlets_count_bucket" TEXT,
    "spaciousness_flag" BOOLEAN NOT NULL DEFAULT false,
    "room_dimensions_text" TEXT,
    "bed_size" "BedSize",
    "kitchen_quality" "KitchenQuality",
    "real_cooking_flag" BOOLEAN NOT NULL DEFAULT false,
    "stove_flag" BOOLEAN NOT NULL DEFAULT false,
    "fridge_flag" BOOLEAN NOT NULL DEFAULT false,
    "utensils_flag" BOOLEAN NOT NULL DEFAULT false,
    "counter_space_flag" BOOLEAN NOT NULL DEFAULT false,
    "laundry_machine" BOOLEAN NOT NULL DEFAULT false,
    "drying_space" BOOLEAN NOT NULL DEFAULT false,
    "cleaning_frequency" TEXT,
    "furnishing_level" TEXT,
    "storage_ok" BOOLEAN NOT NULL DEFAULT false,
    "mosquito_protection" TEXT,
    "pest_control_recency" TEXT,
    "parking_detail" TEXT,
    "quality_score_internal" INTEGER NOT NULL DEFAULT 0,
    "long_term_score_internal" INTEGER NOT NULL DEFAULT 0,
    "google_place_id" TEXT,
    "google_review_rating" DOUBLE PRECISION,
    "google_review_count" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "source" TEXT,
    "stayId" TEXT NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stay_google_place_id_key" ON "Stay"("google_place_id");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
