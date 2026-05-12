import { generatePdfAndUpload } from "./GeneratePdfAndUpload.js";
import { fullCVobject } from "./cvObject.js";

const test = async () => {
    try {
        await generatePdfAndUpload({
            _id: "test123",
            ...fullCVobject
        });

    } catch (err) {
        console.error(err);
    }
};

test();