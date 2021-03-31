const imageThumbnail = require("image-thumbnail");
import * as Storage from "@spica-devkit/storage";

/* 
HOW TO USE THIS ASSET
To use this asset you need to send 2 parameters as post
The parameters should be: 
{
    'suffix': any string here
    'base64': base64 string of your image
}
*/

Storage.initialize({ apikey: process.env.THUMBNAILER_APIKEY });

export default async function(req, res) {
    const { suffix, base64 } = req.body;
    const env = process.env;
    if (suffix && base64) {
        let options = { percentage: 25, responseType: "base64" };
        const thumbnail = await imageThumbnail(base64, options).catch(e => {
            return res.status(400).send({message: "Malformed base64 image data", error: e});
        });

        const imgBuffer = toBuffer(base64);
        let imgWithMeta = {
            contentType: "image/png",
            data: imgBuffer,
            name: "thumbnail_image_" + suffix
        };

        const thumbnailBuffer = toBuffer(thumbnail);
        let thumbnailBufferWithMeta = {
            contentType: "image/png",
            data: thumbnailBuffer,
            name: "image_" + suffix
        };

        console.log("Buffered the images");
        const originalImg = await Storage.insert(imgWithMeta).catch(e => console.log(e));
        const thumbnailImg = await Storage.insert(thumbnailBufferWithMeta).catch(e =>
            console.log(e)
        );

        return res.status(200).send({ original: originalImg[0], thumbnail: thumbnailImg[0] });
    }
    return res.status(400).send({message: "You need to pass both suffix and base64 variables.", suffix: suffix, base64: base64});
}

function toBuffer(base64) {
    base64 = base64.replace("data:image/*;charset=utf-8;base64,", "");
    return new Buffer.from(base64, "base64");
}