import { Router, Response } from "express";
import { z } from "zod";
import pool from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const addRelationSchema = z.object({
  plant_a_id: z.number().int(),
  plant_b_id: z.number().int(),
  is_companion: z.boolean(),
  explanation: z.string().optional(),
});

router.post(
  "/add_relation",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const parsed = addRelationSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const { plant_a_id, plant_b_id, is_companion, explanation } =
        parsed.data;

      // Validate both plants exist
      const plantsCheck = await pool.query(
        "SELECT id FROM plants WHERE id IN ($1, $2)",
        [plant_a_id, plant_b_id]
      );
      if (plantsCheck.rows.length < 2) {
        res.status(400).json({ error: "One or both plant IDs do not exist" });
        return;
      }

      const result = await pool.query(
        `INSERT INTO plant_relations (plant_a_id, plant_b_id, is_companion, explanation, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          plant_a_id,
          plant_b_id,
          is_companion,
          explanation ?? null,
          req.user!.userId,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      if (err.code === "23505") {
        res.status(409).json({ error: "This relationship already exists" });
        return;
      }
      console.error("Add relation error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get(
  "/user_relationships",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        "SELECT * FROM plant_relations WHERE created_by = $1",
        [req.user!.userId]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("User relationships error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
