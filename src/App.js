import { useCallback, useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [textResult, setTextResult] = useState('');
  const [parsedData, setParsedData] = useState(null);

  const worker = createWorker();

  const convertImageToText = useCallback(async () => {
    if (!selectedImage) return;

    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    const { data } = await worker.recognize(selectedImage);
    setTextResult(data.text);
  }, [worker, selectedImage]);

  useEffect(() => {
    convertImageToText();
  }, [selectedImage, convertImageToText]);

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
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setParsedData(null);
      setTextResult('');
    } else {
      setSelectedImage(null);
      setParsedData(null);
      setTextResult('');
    }
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
        {selectedImage && (
          <div className="box-image">
            <img src={URL.createObjectURL(selectedImage)} alt="thumb" />
          </div>
        )}

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
