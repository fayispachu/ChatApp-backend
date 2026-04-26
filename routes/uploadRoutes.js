import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json("No file uploaded");
  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ fileUrl, fileType: req.file.mimetype.split("/")[0] });
});

export default router;
