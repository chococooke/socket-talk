const path = require("path");

exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file selected" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ url: fileUrl, originalName: req.file.originalname });
};
