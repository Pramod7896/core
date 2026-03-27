import multer from "multer";
import fs from "fs";
import path from "path";
import util from "util";
import { logger } from "../config/logger.js";
import { User } from "../models/index.js";

const allowedDocs = /\.(pdf|doc|docx|txt|pptx|xlsx|xls|ppt)$/i;
const allowedMedia = /\.(mp3|wav|aac|flac|mp4|mov|avi|mkv|flv|webm)$/i;
const allowedImages = /\.(png|jpg|jpeg|gif|bmp|tiff|webp)$/i;

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const user = await User.findByPk(req.user.user_id);
      if (!user) {
        logger.error(`User not found for file upload: ${req.user.user_id}`);
        return cb(new Error("User not found"));
      }

      logger.debug(`Processing file: ${file.originalname} for user: ${user.user_name} file object: ${util.inspect(file, { depth: 5 })}`);

      const ext = path.extname(file.originalname).toLowerCase();
      let folderType = "docs";
      let fileType = "doc";

      if (allowedImages.test(ext)) {
        folderType = "images";
        fileType = "image";
      } else if (allowedMedia.test(ext)) {
        folderType = "media";
        fileType = "media";
      }

      req.fileType = fileType;
      logger.debug(`Determined fileType: ${fileType}, folderType: ${folderType}`);

      const enterprizeId = user.enterprize_fid || "general";
      const baseDirRel = path.join(
        "uploads",
        `enterprize_${enterprizeId}`,
        `user_${user.user_id}`,
      );
      const baseDirAbs = path.resolve(baseDirRel);

      let uploadDirRel = path.join(baseDirRel, folderType);
      let uploadDirAbs = path.resolve(uploadDirRel);

      if (req.body.parent_path) {
        const parentPath = String(req.body.parent_path);

        if (path.isAbsolute(parentPath)) {
          logger.warn(`Ignoring absolute parent_path for upload: ${parentPath}`);
        } else {
          const candidateAbs = path.resolve(baseDirAbs, parentPath);
          if (
            !candidateAbs.startsWith(baseDirAbs + path.sep) &&
            candidateAbs !== baseDirAbs
          ) {
            logger.warn(`Ignoring unsafe parent_path for upload: ${parentPath}`);
          } else {
            uploadDirAbs = candidateAbs;
            uploadDirRel = path.relative(process.cwd(), candidateAbs);
            logger.debug(`Resolved uploadDir from parent_path: ${uploadDirRel}`);
          }
        }
      }

      if (!fs.existsSync(uploadDirAbs)) {
        fs.mkdirSync(uploadDirAbs, { recursive: true });
        logger.info(`Created upload directory: ${uploadDirRel}`);
      }

      req.fileFolder = uploadDirRel;
      logger.debug(`Final upload directory set: ${uploadDirRel}`);

      cb(null, uploadDirRel);
    } catch (err) {
      logger.error(`Error in Multer destination callback: ${err.stack}`);
      cb(err);
    }
  },

  filename: (req, file, cb) => {
    try {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      let fileName = unique + ext;

      if (req.uploadType === "profile") {
        fileName = `profile_${unique}${ext}`;
      }

      req.storedFileName = fileName;
      req.originalFileName = file.originalname;

      logger.debug(`Generated file name: ${fileName}, original name: ${file.originalname}`);
      cb(null, fileName);
    } catch (err) {
      logger.error(`Error in Multer filename callback: ${err.stack}`);
      cb(err);
    }
  },
});

const fileFilter = (req, file, cb) => {
  try {
    const ext = path.extname(file.originalname).toLowerCase();

    if (req.uploadType === "profile") {
      if (allowedImages.test(ext)) {
        logger.debug(`Profile upload accepted: ${file.originalname}`);
        cb(null, true);
      } else {
        logger.warn(`Profile upload rejected (invalid image): ${file.originalname}`);
        cb(new Error("Only image allowed"));
      }
    } else {
      if (allowedDocs.test(ext) || allowedMedia.test(ext) || allowedImages.test(ext)) {
        logger.debug(`File accepted: ${file.originalname}`);
        cb(null, true);
      } else {
        logger.warn(`File rejected (invalid format): ${file.originalname}`);
        cb(new Error("Invalid format"));
      }
    }
  } catch (err) {
    logger.error(`Error in fileFilter callback: ${err.stack}`);
    cb(err);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 1024 },
});

export default upload;
