const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { AssemblyAI } = require("assemblyai");

const router = express.Router();

// Store uploads in a temp directory inside the backend folder
const uploadDir = path.join(__dirname, "..", "tmp_uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

// Lazily-created client – ensures dotenv has already run by the time we use it
let _client = null;
function getClient() {
  if (!_client) {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ASSEMBLYAI_API_KEY is not set in environment variables",
      );
    }
    _client = new AssemblyAI({ apiKey });
  }
  return _client;
}

/**
 * POST /api/transcribe
 * Accepts a multipart audio file, sends it to AssemblyAI, and returns the
 * transcript text.
 */
router.post("/", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No audio file provided" });
  }

  const filePath = req.file.path;
  console.log(
    `[transcribe] Received file: ${req.file.originalname}, size: ${req.file.size} bytes, path: ${filePath}`,
  );

  try {
    const client = getClient();

    // Upload the local file to AssemblyAI and request transcription
    console.log("[transcribe] Uploading to AssemblyAI...");
    const transcript = await client.transcripts.transcribe({
      audio: filePath,
      speech_models: ["universal-2"],
      language_code: "en",
    });

    console.log(
      `[transcribe] AssemblyAI status: ${transcript.status}, text length: ${(transcript.text || "").length}`,
    );

    if (transcript.status === "error") {
      console.error("[transcribe] AssemblyAI error:", transcript.error);
      return res
        .status(500)
        .json({ message: "Transcription failed", error: transcript.error });
    }

    res.json({ text: transcript.text || "" });
  } catch (error) {
    console.error("[transcribe] Error:", error.message || error);
    res.status(500).json({
      message: "Transcription failed",
      error: error.message || "Unknown error",
    });
  } finally {
    // Clean up the temporary file
    fs.unlink(filePath, () => {});
  }
});

module.exports = router;
