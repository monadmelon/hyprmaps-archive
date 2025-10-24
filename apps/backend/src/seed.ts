import { PrismaClient, StayType, LocationTag, TravelerTag, Amenity, PriceBand, QualityLevel, NoiseLevel, VerificationStatus } from '@prisma/client';
import { lucia } from './lib/auth'; // 1. Import Lucia
import { Argon2id } from 'oslo/password'; // 2. Import password hasher

const prisma = new PrismaClient();
const argon2id = new Argon2id(); // 3. Initialize hasher

async function main() {
  console.log('Start seeding ...');

  // --- Upsert Admin User ---
  const adminUsername = 'admin';
  const adminPassword = 'password'; // Use a strong password in production!

  // Check if admin user already exists
  let adminUser = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (!adminUser) {
    // Hash the password
    const hashedPassword = await argon2id.hash(adminPassword);

    // Create the user
    adminUser = await prisma.user.create({
      data: {
        id: 'admin_user_01', // Use a predictable ID for easy reference
        username: adminUsername,
      },
    });

    // Create the key (login credentials) for the user
    await prisma.key.create({
      data: {
        id: `username:${adminUsername}`, // Lucia convention
        userId: adminUser.id,
        hashedPassword: hashedPassword,
      },
    });
    console.log(`Created admin user with username: ${adminUsername}`);
  } else {
    console.log(`Admin user '${adminUsername}' already exists.`);
  }

  // --- Clean up and create Mock Stays (existing code) ---
  console.log('Cleaning up mock stays...');
  await prisma.photo.deleteMany({});
  await prisma.stay.deleteMany({ where: { name: { contains: 'Mock' } } });

  console.log('Creating mock stays...');
  const mockHostel = await prisma.stay.create({ /* ... existing hostel data ... */ 
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

  const mockGuesthouse = await prisma.stay.create({ /* ... existing guesthouse data ... */ 
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
  console.log({ adminUser, mockHostel, mockGuesthouse });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });