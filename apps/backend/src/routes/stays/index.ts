import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../lib/prisma'; // (Only 2 levels up now)

const stays: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  /**
   * GET /stays
   */
  fastify.get('/', async (request, reply) => {
    try {
      const staysList = await prisma.stay.findMany({
        where: {
          verification_status: {
            in: ['VERIFIED', 'BUSINESS_VERIFIED'],
          },
        },
        select: {
          id: true,
          name: true,
          type: true,
          geo_latitude: true,
          geo_longitude: true,
          location_tags: true,
          traveler_tags: true,
          price_band: true,
          amenities: true,
          photos: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
      });

      const formattedStays = staysList.map(stay => ({
        ...stay,
        hero_photo: stay.photos.length > 0 ? stay.photos[0].url : null,
        photos: undefined, 
      }));

      return formattedStays;
    } catch (error) {
      console.error('Error fetching stays:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });
};

export default stays;