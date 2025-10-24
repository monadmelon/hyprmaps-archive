import { PrismaClient, StayType, LocationTag, TravelerTag, Amenity, PriceBand, QualityLevel, NoiseLevel, VerificationStatus } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Clean up existing mock data
  await prisma.photo.deleteMany({});
  await prisma.stay.deleteMany({ where: { name: { contains: 'Mock' } } });

  // Mock Stay 1: A Backpacker Hostel on North Cliff
  const mockHostel = await prisma.stay.create({
    data: {
      name: 'Mock: The Wanderer\'s Hostel',
      type: StayType.HOSTEL,
      geo_latitude: 8.7360, // Example coords for North Cliff
      geo_longitude: 76.7118,
      address: 'Near Helipad, North Cliff, Varkala',
      phone: '9876543210',
      whatsapp: '9876543210',
      description: 'A budget-friendly hostel for backpackers and solo travelers, right on the cliff.',
      operational_status: 'OPEN',
      verification_status: VerificationStatus.VERIFIED,
      completeness_score: 80,
      
      location_tags: [LocationTag.NORTH_CLIFF],
      traveler_tags: [TravelerTag.BACKPACKERS, TravelerTag.SOLO],
      amenities: [Amenity.WIFI, Amenity.POWER_BACKUP, Amenity.WASHING_MACHINE],
      
      price_band: PriceBand.BUDGET,
      price_range_low: '400-800',

      cleanliness_level: QualityLevel.GOOD,
      noise_level: NoiseLevel.MODERATE,
      wifi_reliability: 'VIDEO_CALL_CAPABLE',
      
      quality_score_internal: 3,
      long_term_score_internal: 20,
      
      google_place_id: 'mock_place_id_1',
      google_review_rating: 4.2,
      google_review_count: 152,

      photos: {
        create: [
          { url: 'mock/hostel_room.jpg', caption: 'Dorm Room' },
          { url: 'mock/hostel_common.jpg', caption: 'Common Area' },
        ],
      },
    },
  });

  // Mock Stay 2: A Guesthouse Near the Beach
  const mockGuesthouse = await prisma.stay.create({
    data: {
      name: 'Mock: Ocean View Guesthouse',
      type: StayType.GUESTHOUSE_HOTEL,
      geo_latitude: 8.7450, // Example coords for Odayam (Near Beach)
      geo_longitude: 76.7050,
      address: 'Odayam Beach Road, Varkala',
      phone: '9123456789',
      whatsapp: '9123456789',
      description: 'Quiet guesthouse with AC rooms, perfect for couples. 5-minute walk to the beach.',
      operational_status: 'OPEN',
      verification_status: VerificationStatus.BUSINESS_VERIFIED,
      completeness_score: 95,
      
      location_tags: [LocationTag.NEAR_BEACH],
      traveler_tags: [TravelerTag.COUPLES, TravelerTag.REMOTE_WORKERS],
      amenities: [Amenity.AC, Amenity.WIFI, Amenity.HOT_WATER, Amenity.PARKING, Amenity.KITCHEN],
      
      price_band: PriceBand.MID,
      price_range_low: '2000-3000',
      price_range_high: '3000-4500',

      cleanliness_level: QualityLevel.EXCELLENT,
      noise_level: NoiseLevel.QUIET,
      wifi_speed_mbps: 30,
      wifi_reliability: 'VIDEO_CALL_CAPABLE',
      hot_water_type: 'GEYSER_INSTANT',
      kitchen_quality: 'PRIVATE_KITCHENETTE',
      real_cooking_flag: true,

      quality_score_internal: 4,
      long_term_score_internal: 75,
      
      google_place_id: 'mock_place_id_2',
      google_review_rating: 4.7,
      google_review_count: 88,

      photos: {
        create: [
          { url: 'mock/guesthouse_room.jpg', caption: 'Deluxe AC Room' },
          { url: 'mock/guesthouse_view.jpg', caption: 'Balcony View' },
          { url: 'mock/guesthouse_kitchen.jpg', caption: 'Kitchenette' },
        ],
      },
    },
  });

  console.log('Seeding finished.');
  console.log({ mockHostel, mockGuesthouse });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });