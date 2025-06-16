import db from "@/lib/database/db";
import { Subscription } from "@/lib/database/schema/subscription.model";
import { File } from "@/lib/database/schema/file.model";
import { pinata } from "@/lib/pinata/config";
import { getCategoryFromMimeType, parseError } from "@/lib/utils";
import { Hono } from "hono";
import { getServerSession } from "@/actions/auth.action";
import fs from "fs";
import path from "path";

const fileRoute = new Hono();


fileRoute.get("/:page", async (c) => {
  
  try {
    await db();
    const category = c.req.param("page");
    const page = Number(c.req.query("page"));

    const session = await getServerSession();
    const FILE_SIZE = 9
    
    if (!session) {
      return c.json(
        {
          message: "Unauthorized",
          description: "You need to be logged in to upload file",
        },
        {
          status: 401,
        }
      );
    }

    const { user: { id: userId, email: userEmail } } = session;

    // handle share file logic letter
  

    

     const totalFiles = await File.countDocuments({ "userInfo.id": userId, category });

     const files = await File.find({ "userInfo.id": userId, category }).skip((page-1)*FILE_SIZE).limit(FILE_SIZE).sort({createdAt:-1}).lean()

    return c.json({
      message: "Success",
      description: "",
      data: {
        files: files,
        total: totalFiles,
        currentPage: page,
        totalPages: Math.ceil(totalFiles/FILE_SIZE)
      },  },
     {
        status:200
      }
    
    )

    
  } catch (error) {
    console.log("Error in file Fetching: ", error);
    const err = parseError(error);
    return c.json(
      { message: "Error", description: err, file: null },
      { status: 500 }
    );
  }
})

fileRoute.post("/upload", async (c) => {
  try {
    await db();
    const data = await c.req.formData();
    const uploadedFile = data.get("file") as globalThis.File | null;

    if (!uploadedFile) {
      return c.json(
        {
          message: "No file provided",
          description: "Please attach a file to upload.",
          file: null,
        },
        { status: 400 }
      );
    }

    const session = await getServerSession();
    if (!session) {
      return c.json(
        {
          message: "Unauthorized",
          description: "You need to be logged in to upload file",
        },
        {
          status: 401,
        }
      );
    }

    const userId = session.user.id;
    const name = session.user.name;
    const subs = await Subscription.findOne({ subscriber: userId });

    if (!subs) {
      return c.json(
        {
          message: "⚠️ Warning",
          category: null,
          description:
            "Subscription not found. Please log out and log in again to refresh your session.",
          file: null,
        },
        { status: 404 }
      );
    }

    if (subs.subscriptionType !== "free" && subs.status !== "activated") {
      return c.json(
        {
          message: "⚠️ Warning",
          category: null,
          description:
            "Your subscription has expired. Please re-subscribe to continue.",
          file: null,
        },
        { status: 400 }
      );
    }

    if (subs.selectedStorage <= subs.usedStorage) {
      return c.json(
        {
          message: "⚠️ Warning",
          category: null,
          description:
            "Storage limit exceeded. Please subscribe and select additional storage.",
          file: null,
        },
        { status: 400 }
      );
    }

    // Save the uploaded file temporarily to disk to create a stream
    const buffer = Buffer.from(await uploadedFile.arrayBuffer());
    const tempDir = path.resolve("/tmp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempPath = path.join(
      tempDir,
      `${Date.now()}_${uploadedFile.name.replace(/\s/g, "_")}`
    );
    fs.writeFileSync(tempPath, buffer);

    try {
      const options = {
        pinataMetadata: {
          name: uploadedFile.name,
          keyvalues: {
            userId,
            name,
          },
        },
      };

      const readableStream = fs.createReadStream(tempPath);
      const uploadData = await pinata.pinFileToIPFS(readableStream, options);

      // Clean up temporary file
      fs.unlinkSync(tempPath);

      // If the SDK returns a standard structure, adapt as needed:
      // Typical response: { IpfsHash, PinSize, Timestamp }
      const cid = uploadData.IpfsHash ;
      const size = uploadData.PinSize  || buffer.length;
      const mimeType =
        uploadedFile.type || "application/octet-stream";

      const category = getCategoryFromMimeType(mimeType);

      const fileDoc = await FileModel.create({
        pinataId: uploadData.IpfsHash,
        name: uploadedFile.name,
        mimeType,
        cid,
        size,
        userInfo: { id: userId, name },
        category,
      });

      await Subscription.updateOne(
        { subscriber: userId },
        {
          $inc: {
            usedStorage: size,
          },
        }
      );

      return c.json(
        {
          message: "Upload Successful",
          category,
          description: `File: ${uploadedFile.name}`,
        },
        { status: 201 }
      );
    } catch (err) {
      // Clean up temp file if Pinata upload fails
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      throw err;
    }
  } catch (error) {
    console.log("Error in file uploading: ", error);
    const err = parseError(error);
    return c.json(
      { message: "Error", description: err, file: null },
      { status: 500 }
    );
  }
});

export default fileRoute;