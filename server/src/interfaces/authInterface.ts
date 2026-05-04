import { Request } from "express";
import type { File } from "multer";

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
  file?: File
}