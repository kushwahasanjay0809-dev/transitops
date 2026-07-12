/**
 * Trip Number Generator.
 * Format: TRP-YYYYMMDD-XXXX (e.g., TRP-20260712-0042)
 */

const { prisma } = require('../config/database');

/**
 * Generate the next trip number for today's date.
 * Queries the database for the latest trip number with today's date prefix
 * and increments the sequence.
 * @returns {Promise<string>} The next trip number
 */
async function generateTripNumber() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `TRP-${year}${month}${day}`;

  // Find the latest trip number for today
  const latestTrip = await prisma.trip.findFirst({
    where: {
      tripNumber: {
        startsWith: datePrefix,
      },
    },
    orderBy: {
      tripNumber: 'desc',
    },
    select: {
      tripNumber: true,
    },
  });

  let sequence = 1;

  if (latestTrip) {
    // Extract the sequence number from the last trip number
    const lastSequence = parseInt(latestTrip.tripNumber.split('-')[2], 10);
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  return `${datePrefix}-${String(sequence).padStart(4, '0')}`;
}

module.exports = { generateTripNumber };
