import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Hello from Auth routes");
});

export default router;