import { Router } from "express";
import { getProperty } from "../controllers/propertyController";
import { getCalendarRange } from "../controllers/calendarController";
import { postRate } from "../controllers/rateController";
import { postBlock, deleteBlock } from "../controllers/blockController";
import { getBookings, postBooking } from "../controllers/bookingController";
import { postImport } from "../controllers/importController";

const router = Router();

router.get("/property", getProperty);

router.get("/calendar", getCalendarRange);

router.post("/rates", postRate);

router.post("/block", postBlock);
router.delete("/block", deleteBlock);

router.get("/bookings", getBookings);
router.post("/bookings", postBooking);

router.post("/import", postImport);

export default router;
