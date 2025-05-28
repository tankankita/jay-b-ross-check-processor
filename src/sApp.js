// import React, { useState } from 'react';
// import pdfToText from "react-pdftotext";
// import Tesseract from 'tesseract.js';

// // import { FileUploader } from "react-drag-drop-files";

// export default function App() {
//   const ChangeFile = (event) => {
//     console.log(event.target.files[0]);
//     pdfToText(event.target.files[0])
//       .then((text) => {
//         console.log("text:", text);
//         const string = text.replace(new RegExp("CHART", "g"), "");

//         // Extracting the name
//         const nameMatch = string.match(/^[A-Z\s,]+/);
//         const name = nameMatch ? nameMatch[0].trim() : "";

//         // Extracting the address
//         const addressMatch = string.match(
//           /\d+\s[A-Za-z\s.]+,\s?[A-Z]{2}\s?[A-Z0-9]{6}/g
//         );
//         const address = addressMatch ? addressMatch[0].trim() : "";

//         // Extracting the HIN number
//         const hinMatch = string.match(/HIN:(\d+)/);
//         const hin = hinMatch ? hinMatch[1] : "";

//         // Extracting the sex
//         const sexMatch = string.match(/SEX:(\w){1}/g);
//         const sex = sexMatch ? sexMatch[1] : "";

//         // Extracting the date of birth
//         const dobMatch = string.match(/DOB:(\d{4}-\d{2}-\d{2})/);
//         const dob = dobMatch ? dobMatch[1] : "";

//         // Extracting the age
//         const ageMatch = string.match(/AGE:(\d+(\.\d+)?)/);
//         const age = ageMatch ? ageMatch[1] : "";

//         // Extracting the phone number
//         const phoneMatch = string.match(/Home:\s*(\d{3}-\d{3}-\d{4})/);
//         const phone = phoneMatch ? phoneMatch[1] : "";

//         // Extracting the clinic name
//         const clinicMatch = string.match(/HOME:\s*\d{3}-\d{3}-\d{4}\s*(.*)/);
//         const clinicName = clinicMatch ? clinicMatch[1].trim() : "";

//         // Output the extracted data
//         console.log({
//           name,
//           address,
//           hin,
//           sex,
//           dob,
//           age,
//           phone,
//           clinicName,
//         });
//       })
//       .catch((error) => console.error("Failed to extract text from pdf"));
//   };

//   return (
//     <div className="App">
//       <h1>result</h1>
//       <input type="file" onChange={ChangeFile} />
//       <h2>Start editing to see some magic happen!</h2>
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import { createWorker } from "tesseract.js";
import "./App.css";
function App() {
  const [ocr, setOcr] = useState("");
  const [imageData, setImageData] = useState(null);
  const worker = createWorker({
    logger: (m) => {
      console.log(m);
    },
  });
  const convertImageToText = async () => {
    if (!imageData) return;
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const {
      data: { text },
    } = await worker.recognize(imageData);
    setOcr(text);
  };

  useEffect(() => {
    convertImageToText();
  }, [imageData]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if(!file)return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUri = reader.result;
      console.log({ imageDataUri });
      setImageData(imageDataUri);
    };
    reader.readAsDataURL(file);
  }
  return (
    <div className="App">
      <div>
        <p>Choose an Image</p>
        <input
          type="file"
          name=""
          id=""
          onChange={handleImageChange}
          accept="image/*"
        />
      </div>
      <div className="display-flex">
        <img src={imageData} alt="" srcset="" />
        <p>{ocr}</p>
      </div>
    </div>
  );
}
export default App;
