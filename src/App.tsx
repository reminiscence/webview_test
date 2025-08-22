import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const iframeRef = useRef(null);
  const [errorList, setErrorList] = useState([]);

  const updateInfo = (info) => {
    const { scanStatus, data } = info || {};
    if (scanStatus === "success") {
      // @ts-ignore
      if (data && data.parsed && data.parsed.fields) {
        // @ts-ignore
        const passportData = { ...data.parsed.fields };
        // passportData.birthDate = parseDate(passportData.birthDate);
        // passportData.expirationDate = parseDate(passportData.expirationDate);

        // @ts-ignore
        if (window?.ReactNativeWebView) {
          // @ts-ignore
          window.ReactNativeWebView?.postMessage(JSON.stringify({ action: 'RESULT', payload: { data: passportData } }));
        } else {
          console.log('success!', passportData)
        }
      } else {
        setErrorList([...errorList, 'No OCR Information']);

        // @ts-ignore
        if (window?.ReactNativeWebView) {
          // @ts-ignore
          window.ReactNativeWebView?.postMessage(JSON.stringify({ action: 'RESULT_ERR', payload: { data: data } }));
        } else {
          console.log('err..!')
        }
      }
    }

    if (scanStatus === 'error') {
      setErrorList([...errorList, 'Error in file scan']);
      // @ts-ignore
      if (window?.ReactNativeWebView) {
        // @ts-ignore
        window.ReactNativeWebView?.postMessage(JSON.stringify({ action: 'RESULT_ERR', payload: { data: 'Error in file scan' } }));
      } else {
        console.log('err..!')
      }
    }

    if (scanStatus === 'default') {
      setErrorList([...errorList, 'Unknown error']);

      // @ts-ignore
      if (window?.ReactNativeWebView) {
        // @ts-ignore
        window.ReactNativeWebView?.postMessage(JSON.stringify({ action: 'RESULT_ERR', payload: { data: 'unknown error' } }));
      } else {
        console.log('err..!')
      }
    }
  };

  const processOCR = (data: string) => {
    let postData = {};

    // scanImage(data, updateInfo);
    postData = { action: "SCAN_IMAGE", payload: { url: data } };
    const iframeContentWindow = iframeRef.current.contentWindow;

    iframeContentWindow.postMessage(postData);
    // console.log(
    //   "** init post message from the client",
    //   postData,
    //   iframeContentWindow
    // );
  };

  const receiveMessage = (e: MessageEvent) => {
    if (e.data) {
      if (typeof e.data === 'string') {

        try {
          const data = JSON.parse(e.data);

          const { action, payload } = data || {};

          if (action === "INIT_MRZ") {
            setErrorList([...errorList, `process!!`]);

            processOCR(payload.data);
          }
        } catch (err) {
          // @ts-ignore
          if (window?.ReactNativeWebView) {
            alert(`recv msg error : ${e.data}`);

            // @ts-ignore
            window.ReactNativeWebView?.postMessage(JSON.stringify({ action: 'RESULT_ERR', payload: { data: 'recv msg error' } }));
          } else {
            alert(`recv msg error - not window rn wv : ${e.data}`);

            console.log('err..!')
          }
        }
      } else {
        const { action, payload } = e.data || {};
        if (action === "SENDING_OCR_DATA") {
          updateInfo(payload.ocrData);
        } else if (action === "INIT_MRZ") {
          processOCR(payload.data);
        }
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      window.addEventListener("message", receiveMessage, false);
      document.addEventListener("message", receiveMessage, false);
    }, 200);

    return () => {
      window.removeEventListener('message', receiveMessage);
      document.removeEventListener('message', receiveMessage);
    };
  }, [errorList]);


  return (
    <>
      <div>
        <div style={{ width: '80vw', height: '80vh', background: '#aaa', overflow: 'auto'}}>
          {errorList.map((err, idx) => {
            return (
              <div key={`err_${idx}`} style={{ marginBottom: '10px'}}>{err}</div>
            )
          })}
        </div>
        <iframe
          width="0%"
          height="0px"
          ref={iframeRef}
          src="ocr-frame/ocr.html"
          title="ocr-processor"
        />
      </div>
    </>
  );
}

export default App;
