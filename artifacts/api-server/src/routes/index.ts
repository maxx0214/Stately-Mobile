import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiCoachRouter from "./ai-coach";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiCoachRouter);

export default router;
