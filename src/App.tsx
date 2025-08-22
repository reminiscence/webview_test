import { useEffect, useRef } from 'react';
import './App.css';

function App() {
  const iframeRef = useRef(null);

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
        // @ts-ignore
        if (window?.ReactNativeWebView) {
          // @ts-ignore
          window.ReactNativeWebView?.postMessage(JSON.stringify({ action: 'RESULT_ERR', payload: { data: 'No OCR Information' } }));
        } else {
          console.log('err..!')
        }
      }
    }

    if (scanStatus === 'error') {
      // @ts-ignore
      if (window?.ReactNativeWebView) {
        // @ts-ignore
        window.ReactNativeWebView?.postMessage(JSON.stringify({ action: 'RESULT_ERR', payload: { data: 'Error in file scan' } }));
      } else {
        console.log('err..!')
      }
    }

    if (scanStatus === 'default') {
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
      const { action, payload } = e.data || {};
      if (action === "SENDING_OCR_DATA") {
        updateInfo(payload.ocrData);
      } else if (action === "INIT_MRZ") {
        processOCR(payload.data);
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      window.addEventListener("message", receiveMessage, false);
    }, 200);

    return () => {
      window.removeEventListener('message', receiveMessage);
    };
  }, []);


  return (
    <>
      <div>
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
