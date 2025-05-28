import { useCallback, useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';
import './App.css';

function App() {

  if (!HTMLImageElement.prototype.toBlob) {
    HTMLImageElement.prototype.toBlob = function () {
      throw new Error('img.toBlob is not a function – use canvas.toBlob instead.');
    };
  }


  const [selectedImage, setSelectedImage] = useState(null);
  const [textResult, setTextResult] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [croppedText, setCroppedText] = useState(null);
  const [croppedCanvas, setCroppedCanvas] = useState(null);

  const worker = createWorker();

  const convertImageToText = useCallback(async () => {
    if (!selectedImage) return;

    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    const { data } = await worker.recognize(selectedImage);
    setTextResult(data.text);
  }, [worker, selectedImage]);


const convertCroppedImageToText = useCallback(async () => {
  if (!croppedCanvas) return;

  try {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    const { data } = await worker.recognize(croppedCanvas); // ✅ direct canvas OCR
    console.log(data.text)
    setCroppedText(data.text);
  } catch (err) {
    console.error('Failed OCR on cropped canvas:', err);
  }
}, [worker, croppedCanvas]);

  useEffect(() => {
    convertImageToText();
  }, [selectedImage, convertImageToText]);

  useEffect(() => {
    if (!textResult || croppedText) return;

    convertCroppedImageToText();
  }, [textResult, convertCroppedImageToText, croppedText]);


  useEffect(() => {
    if (!textResult) return;

    // 🧠 Regex parsing logic
    const amountMatch = textResult.match(/(?:\b|\D)(\d{1,3}(?:,\d{3})*(?:\.\d{2}))\s*=\s*Transaction date/i);
    const dateMatch = textResult.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/);
    const payeeMatch = textResult.match(/ORIG CO NAME:(.*?)ORIG ID:/is);
    const origIdMatch = textResult.match(/ORIG ID:(\d+)/i);


    setParsedData({
      amount: amountMatch?.[1] || 'Not found',
      date: dateMatch?.[0] || 'Not found',
      payee: payeeMatch?.[1]?.trim() || 'Not found',
      origId: origIdMatch?.[1] || 'Not found'
    });
  }, [textResult]);

  const handleChangeImage = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedImage(null);
      setParsedData(null);
      setCroppedText(null);     // clear previous cropped result
      setTextResult('');
      return;
    }

    setSelectedImage(file);
    setParsedData(null);
    setTextResult('');

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = img.width;
        const height = img.height / 3;

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height, 0, 0, width, height);
        // Instead of creating blob and URL
        setCroppedCanvas(canvas); // ✅ store the canvas directly

      };

      img.onerror = () => {
        console.error("Failed to load image into <img> tag.");
      };

      img.src = event.target.result;
    };


    reader.readAsDataURL(file);
  };


  return (
    <div className="App">
      <h1>ImText</h1>
      <p>Extract words and info from image!</p>

      <div className="input-wrapper">
        <label htmlFor="upload">Upload Image</label>
        <input type="file" id="upload" accept="image/*" onChange={handleChangeImage} />
      </div>

      <div className="result">
        {/* {selectedImage && (
          <div className="image-pair" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div className="box-image">
              <h4>Full Image</h4>
              <img src={URL.createObjectURL(selectedImage)} alt="full" style={{ maxWidth: '300px' }} />
            </div>
            {croppedPreview && (
              <div className="box-cropped">
                <h4>Cropped Top 50%</h4>
                <img src={croppedPreview} alt="cropped" style={{ maxWidth: '300px' }} />
              </div>
            )}
          </div> */}
        

        {parsedData && (
          <div className="box-parsed">
            <h3>🧾 Extracted Info</h3>
            <p><strong>Date:</strong> {parsedData.date}</p>
            <p><strong>Amount:</strong> {parsedData.amount}</p>
            <p><strong>Payee:</strong> {parsedData.payee}</p>
            <p><strong>OrigId:</strong> {parsedData.origId}</p>

          </div>
        )}

        {textResult && (
          <div className="box-p">
            <p>{textResult}</p>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default App;
