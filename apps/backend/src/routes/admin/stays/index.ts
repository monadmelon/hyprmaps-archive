import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../../lib/prisma';
import { authHook } from '../../../hooks/authHook'; // Import the auth hook

// Define the shape of the data for creating/updating a stay (simplified for now)
// We'll expand this later to match the full schema
interface StayBody {
  name: string;
  type: 'HOSTEL' | 'GUESTHOUSE_HOTEL' | 'APARTMENT_HOMESTAY' | 'RESORT_VILLA';
  geo_latitude: number;
  geo_longitude: number;
  address: string;
  description: string;
  price_band: 'BUDGET' | 'MID' | 'PREMIUM';
  // Add other required fields as needed
}

const adminStays: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // --- Apply the Auth Hook ---
  // This hook will run before every route defined in this file
  fastify.addHook('preHandler', authHook);

  /**
   * GET /admin/stays - List all stays (for admin)
   */
  fastify.get('/', async (request, reply) => {
    // Check if user is attached (authHook should guarantee this, but good practice)
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    try {
      const stays = await prisma.stay.findMany({
        orderBy: { createdAt: 'desc' }, // Show newest first
      });
      return stays;
    } catch (error) {
      console.error('Admin: Error fetching stays:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * POST /admin/stays - Create a new stay
   */
  fastify.post<{ Body: StayBody }>('/', async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    try {
      const newStayData = request.body;
      // Basic validation (can be expanded with schema validation later)
      if (!newStayData.name || !newStayData.type || !newStayData.geo_latitude) {
        return reply.status(400).send({ error: 'Missing required fields' });
      }

      const stay = await prisma.stay.create({
        data: {
          ...newStayData,
          // Add default/required fields not in the body
          verification_status: 'UNVERIFIED', // Default for new entries
          // We'll need to handle relations like photos, tags later
        },
      });
      return reply.status(201).send(stay); // Send back the created stay
    } catch (error) {
      console.error('Admin: Error creating stay:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * PUT /admin/stays/:id - Update an existing stay
   */
  fastify.put<{ Params: { id: string }; Body: Partial<StayBody> }>('/:id', async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { id } = request.params;
    try {
      const updatedData = request.body;
      const stay = await prisma.stay.update({
        where: { id },
        data: updatedData,
      });
      return stay;
    } catch (error) {
      console.error(`Admin: Error updating stay ${id}:`, error);
      // Handle case where stay might not exist
      if ((error as any).code === 'P2025') { // Prisma code for record not found
        return reply.status(404).send({ error: 'Stay not found' });
      }
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * DELETE /admin/stays/:id - Delete a stay
   */
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { id } = request.params;
    try {
      await prisma.stay.delete({
        where: { id },
      });
      return reply.status(204).send(); // No content response for successful delete
    } catch (error) {
      console.error(`Admin: Error deleting stay ${id}:`, error);
      if ((error as any).code === 'P2025') {
        return reply.status(404).send({ error: 'Stay not found' });
      }
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

};

export default adminStays;