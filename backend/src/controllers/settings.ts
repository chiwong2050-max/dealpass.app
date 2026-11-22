import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { InternalServerError, BadRequestError } from '../utils/errors';

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configs = await prisma.platformConfig.findMany();
    
    // Convert array to object for easier frontend consumption
    const settings: Record<string, string> = {};
    configs.forEach(conf => {
        settings[conf.key] = conf.value;
    });

    res.status(200).json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    next(new InternalServerError('Failed to fetch settings.'));
  }
};

export const updateSetting = async (req: Request, res: Response, next: NextFunction) => {
  const { key, value, description } = req.body;

  if (!key) {
    return next(new BadRequestError('Key is required.'));
  }

  try {
    const config = await prisma.platformConfig.upsert({
      where: { key },
      update: { 
        value: String(value),
        description: description || undefined 
      },
      create: { 
        key, 
        value: String(value),
        description 
      },
    });

    res.status(200).json({ message: 'Setting updated', config });
  } catch (error) {
    console.error('Update setting error:', error);
    next(new InternalServerError('Failed to update setting.'));
  }
};

export const bulkUpdateSettings = async (req: Request, res: Response, next: NextFunction) => {
  const { settings } = req.body; // Expecting object { key: value, key2: value2 }

  if (!settings || typeof settings !== 'object') {
    return next(new BadRequestError('Settings object is required.'));
  }

  try {
    const operations = Object.entries(settings).map(([key, value]) => {
        return prisma.platformConfig.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
        });
    });

    await prisma.$transaction(operations);

    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Bulk update settings error:', error);
    next(new InternalServerError('Failed to update settings.'));
  }
};