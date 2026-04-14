import { Router, Request, Response } from "express";
import { z } from "zod";
import pool from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const addPlantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  planting_start: z.number().int().min(1).max(12).nullable().optional(),
  planting_end: z.number().int().min(1).max(12).nullable().optional(),
  harvesting_start: z.number().int().min(1).max(12).nullable().optional(),
  harvesting_end: z.number().int().min(1).max(12).nullable().optional(),
  water: z.number().int().nullable().optional(),
  shadow: z.boolean().nullable().optional(),
  height: z.number().int().nullable().optional(),
  spread: z.number().int().nullable().optional(),
  body_water: z.boolean().nullable().optional(),
  is_tree: z.boolean().nullable().optional(),
});

router.get("/get_all_plants", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM plants ORDER BY name ASC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Get all plants error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/add_plant",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const parsed = addPlantSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const p = parsed.data;

      const existing = await pool.query(
        "SELECT id FROM plants WHERE LOWER(name) = LOWER($1)",
        [p.name]
      );
      if (existing.rows.length > 0) {
        res.status(409).json({ error: "Plant already exists" });
        return;
      }

      const result = await pool.query(
        `INSERT INTO plants (name, planting_start, planting_end, harvesting_start, harvesting_end, water, shadow, height, spread, body_water, is_tree, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          p.name,
          p.planting_start ?? null,
          p.planting_end ?? null,
          p.harvesting_start ?? null,
          p.harvesting_end ?? null,
          p.water ?? null,
          p.shadow ?? null,
          p.height ?? null,
          p.spread ?? null,
          p.body_water ?? null,
          p.is_tree ?? null,
          req.user!.userId,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Add plant error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get(
  "/user_plants",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        "SELECT * FROM plants WHERE created_by = $1 ORDER BY name ASC",
        [req.user!.userId]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("User plants error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
