import { Request, Response, NextFunction } from 'express';
import { InternalServerError, BadRequestError } from '../utils/errors';
import prisma from '../prisma';

// In REAL app, these should be in .env
const VAPID_KEYS = {
    publicKey: process.env.VAPID_PUBLIC_KEY || 'BOmkOa_K0_e7s7_aLw7_aLw7_aLw7_aLw7_aLw7_aLw7_aLw7_aLw7',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'DUMMY_PRIVATE_KEY'
};

export const getPushConfig = (req: Request, res: Response) => {
    res.json({ publicKey: VAPID_KEYS.publicKey });
};

export const subscribeToPush = async (req: Request, res: Response, next: NextFunction) => {
    const subscription = req.body;
    const userId = (req as any).user?.id;

    if (!subscription || !subscription.endpoint) {
        return next(new BadRequestError('Invalid subscription object'));
    }

    try {
        await (prisma as any).pushSubscription.create({
            data: {
                userId,
                endpoint: subscription.endpoint,
                keys: subscription.keys
            }
        });
        
        res.status(201).json({ message: 'Subscription saved' });
    } catch (error) {
        console.error('Subscription save failed', error);
        // Might fail if already exists, just ignore for demo
        res.status(200).json({ message: 'Subscription updated' });
    }
};

export const sendTestNotification = async (req: Request, res: Response, next: NextFunction) => {
    const { title, body } = req.body;
    // Mock send
    console.log(`[PUSH] Sending "${title}" to all users.`);
    res.json({ message: `Sent to simulated devices.` });
};

export const processNotificationQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Get pending notifications
        const pending = await (prisma as any).notificationQueue.findMany({
            where: { status: 'PENDING' },
            take: 50
        });

        if (pending.length === 0) {
            return res.json({ message: 'Queue is empty.' });
        }

        // 2. "Send" them (Simulation)
        const updates = pending.map((n: any) => 
            (prisma as any).notificationQueue.update({
                where: { id: n.id },
                data: { status: 'SENT' }
            })
        );

        await prisma.$transaction(updates);

        console.log(`[QUEUE] Processed ${pending.length} notifications.`);
        // In a real app, this is where we'd iterate and call webpush.sendNotification()

        res.json({ 
            message: `Processed ${pending.length} notifications.`,
            details: pending.map((p: any) => ({ user: p.userId, title: p.title }))
        });

    } catch (error) {
        console.error("Queue error:", error);
        next(new InternalServerError('Failed to process queue.'));
    }
};