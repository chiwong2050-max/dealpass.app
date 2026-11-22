import { Request, Response, NextFunction } from 'express';
import { InternalServerError, BadRequestError } from '../utils/errors';
import prisma from '../prisma';

// In-memory store for demo purposes (since we aren't migrating schema right now)
// In production, this would be a database table 'IncidentReport'
const MOCK_INCIDENTS = [
    {
        id: 'TKT-9921',
        businessName: "Joe's Pizza",
        offerName: "2-for-1 Slices",
        dateTime: "Yesterday, 2pm",
        details: "Manager said they don't accept 'internet coupons'. Rude behavior.",
        status: 'OPEN',
        userEmail: 'angry_customer@example.com',
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 'TKT-3321',
        businessName: "City Spa",
        offerName: "50% Off Massage",
        dateTime: "Tue 14th",
        details: "Code didn't scan. They honored it anyway but asked me to report it.",
        status: 'RESOLVED',
        userEmail: 'sarah.j@example.com',
        createdAt: new Date(Date.now() - 172800000).toISOString()
    }
];

export const createIncidentReport = async (req: Request, res: Response, next: NextFunction) => {
  const { businessName, offerName, dateTime, details } = req.body;
  const user = (req as any).user;
  
  if (!businessName || !details) {
    return next(new BadRequestError('Missing required report details.'));
  }

  try {
    const newTicket = {
        id: `TKT-${Math.floor(Math.random() * 10000)}`,
        businessName,
        offerName: offerName || 'General',
        dateTime,
        details,
        status: 'OPEN',
        userEmail: user?.email || 'Guest',
        createdAt: new Date().toISOString()
    };

    // Add to our mock store
    MOCK_INCIDENTS.unshift(newTicket);

    // 2. Attempt to find and "flag" the business if it exists
    const business = await prisma.business.findFirst({
        where: { tradingName: { contains: businessName } }
    });

    if (business) {
        console.log(`[SYSTEM ACTION] Business "${business.tradingName}" (ID: ${business.id}) has been FLAGGED for review.`);
    }

    res.status(200).json({ 
      message: 'Report filed successfully', 
      ticketId: newTicket.id
    });
  } catch (error) {
    console.error('Support report error:', error);
    next(new InternalServerError('Failed to file report.'));
  }
};

export const getIncidents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({ incidents: MOCK_INCIDENTS });
    } catch (error) {
        next(new InternalServerError('Failed to fetch incidents'));
    }
};

export const resolveIncident = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const ticket = MOCK_INCIDENTS.find(t => t.id === id);
        if (ticket) {
            ticket.status = 'RESOLVED';
            res.status(200).json({ message: 'Ticket resolved', ticket });
        } else {
            res.status(404).json({ message: 'Ticket not found' });
        }
    } catch (error) {
        next(new InternalServerError('Failed to resolve incident'));
    }
};