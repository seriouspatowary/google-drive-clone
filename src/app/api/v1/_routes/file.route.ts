import db from "@/lib/database/db";
import { Hono } from "hono";

const fileRoute = new Hono();


fileRoute.post("/upload", async (c) => {
      try {
          await db()
          const data = await c.req.formData();
          const file = File | null = data.get("file") as unknown as File
      } catch (error) {
        
      }

})