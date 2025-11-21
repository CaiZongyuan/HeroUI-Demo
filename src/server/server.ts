import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import fs from "fs";
import multer from "multer";
import os from "os";
import path from "path";

const app = express();
const PORT = 8989;

// Server running at: /project/server/server.ts
// Uploads go to:     /project/uploads/
const UPLOAD_ROOT = path.resolve(process.cwd(), "..");
const UPLOAD_DIR = path.join(UPLOAD_ROOT, "uploads");

type MediaType = 'images' | 'audios' | 'videos' | 'misc';

const MIME_TYPE_MAP: Record<string, MediaType> = {
    'image': 'images',
    'audio': 'audios',
    'video': 'videos'
};

// Initialize directories
Object.values(MIME_TYPE_MAP).forEach((dirName) => {
    const dir = path.join(UPLOAD_DIR, dirName);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Multer storage engine
const storage = multer.diskStorage({
    destination: (_req: Request, file: Express.Multer.File, cb) => {
        // From mimetype (e.g., 'image/jpeg') extract prefix
        const typeKey = file.mimetype.split('/')[0];
        const folder = MIME_TYPE_MAP[typeKey] || 'misc';

        const targetDir = path.join(UPLOAD_DIR, folder);
        // Defensive programming
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        cb(null, targetDir);
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
        // Simple. Remove spaces from file name to avoid URL encoding hell.
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const cleanName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${uniqueSuffix}-${cleanName}`);
    },
});

const upload = multer({ storage });

// Get local IP
function getLocalIP(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        const ifaceList = interfaces[name];
        if (!ifaceList) continue;

        for (const iface of ifaceList) {
            // Skip non-IPv4 and internal addresses (127.0.0.1)
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost'; // Fallback
}

// Unified upload handling logic (Don't Repeat Yourself)
const handleUpload = (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
    }

    const typeKey = req.file.mimetype.split('/')[0];
    const category = MIME_TYPE_MAP[typeKey] || 'misc';
    const ip = getLocalIP();

    // Construct URL
    const fileUrl = `http://${ip}:${PORT}/uploads/${category}/${req.file.filename}`;

    console.log(`[${category.toUpperCase()}] Saved: ${req.file.filename} (${(req.file.size / 1024).toFixed(2)} KB)`);

    res.status(200).json({
        success: true,
        message: "Upload successful",
        data: {
            url: fileUrl,
            fileName: req.file.filename,
            mimeType: req.file.mimetype,
            mediaType: category,
            size: req.file.size
        }
    });
};

// Middleware and routes
app.use(cors());

// Static file service
app.use("/uploads", express.static(UPLOAD_DIR));

// Routes
app.post("/upload", upload.single("file"), handleUpload);
app.post("/upload/images", upload.single("file"), handleUpload);
app.post("/upload/audios", upload.single("file"), handleUpload);
app.post("/upload/videos", upload.single("file"), handleUpload);

// Global error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Server Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
});

// Start server
app.listen(PORT, () => {
    const ip = getLocalIP();
    console.log(`\n🚀 Server running with Bun`);
    console.log(`-----------------------------------`);
    console.log(`Local:   http://localhost:${PORT}`);
    console.log(`Network: http://${ip}:${PORT}`);
    console.log(`Root:    ${UPLOAD_DIR}`);
    console.log(`-----------------------------------\n`);
});