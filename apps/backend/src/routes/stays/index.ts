import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../lib/prisma'; // This path is now correct

const stays: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  /**
   * GET /stays
   * Returns a lightweight list of all verified stays for the map/list view.
   */
  fastify.get('/', async (request, reply) => {
    try {
      const staysList = await prisma.stay.findMany({
        where: {
          verification_status: {
            in: ['VERIFIED', 'BUSINESS_VERIFIED'],
          },
        },
        // Select only the fields needed for the card layout
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
          phone: true,
          whatsapp: true,
          photos: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
      });

      const formattedStays = staysList.map((stay) => ({
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

  /**
   * --- NEW ENDPOINT ---
   * GET /stays/:id
   * Returns the full, detailed data for a single stay.
   */
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      const stay = await prisma.stay.findUnique({
        where: { id },
        // Include all related photos for the gallery
        include: {
          photos: true,
        },
      });

      if (!stay) {
        return reply.status(404).send({ error: 'Stay not found' });
      }

      // Return the full, detailed stay object
      return stay;
    } catch (error) {
      console.error(`Error fetching stay ${id}:`, error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });
};

export default stays;