import { type NextFunction, type Request, type Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const userId = req.user?.id as string;
        const dashboard = await dashboardService(userId);
        res.status(200).json({ message: 'Dashboard data', dashboard });
    } catch (error) {
        next(error);
    }
}