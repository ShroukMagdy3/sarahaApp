import multer from "multer";
import fs from "fs";
import path from 'path'

export const allowedExtension = {
  image: ["image/png", "image/jpeg"],
  pdf: ["application/pdf"],
  video: ["/video/mp4"],
};

export const multerLocal = ( {customPath ="general" , allowedExtension =[]} ={} ) => {
  const fullPath = `uploads/${customPath}`;
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
  const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  });

  function fileFilter (req, file, cb)  {
    if (!allowedExtension.includes(file.mimetype)) {
      cb(new Error("invalid file"));
    } else {
      cb(null, true);
    }
  };

  const upload = multer({  storage , fileFilter  });
  return upload;
};
export const multerHost = ( { allowedExtension =[]} ={} ) => {
  
  // if u didn't send filename multer generate a random name
  const storage = multer.diskStorage({});

  function fileFilter (req, file, cb)  {
    if (!allowedExtension.includes(file.mimetype)) {
      cb(new Error("invalid file"));
    } else {
      cb(null, true);
    }
  };

  const upload = multer({  storage , fileFilter  });
  return upload;
};
