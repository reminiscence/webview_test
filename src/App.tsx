import { useEffect, useRef, useState } from 'react';
import { modals } from '@mantine/modals';
import './App.css';
import { Divider } from '@mantine/core';

function App() {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState<string>('');
  const [ua, setUa] = useState<string>('');
  const messageRef = useRef<HTMLDivElement | null>(null);
  const [msg, setMsg] = useState<string>('');
  const [cls, setCls] = useState<string>('');
  const [numValue, setNumValue] = useState<string>('');

  const onMessageFromApp = (e: MessageEvent) => {
    e.stopPropagation();

    setMsg(msg);
  };

  useEffect(() => {
    setUa(window.navigator.userAgent);
    window.addEventListener('message', onMessageFromApp);

    return () => {
      window.removeEventListener('message', onMessageFromApp);
    };
  }, []);

  // todo: 아래 custom modal 을 새로고침/뒤로가기 때 띄우는 행동은 동작하지 않음...
  // 브라우저단에서 동작을 막아두었기 때문에, 시스템 메세지로만 가능함.
  const openModal = () => modals.openConfirmModal({
    title: '새로고침',
    children: (
      <Text size='sm'>{'새로고침 시 다 날아감. 진짜 나감?'}</Text>
    ),
    onConfirm: () => {
      history.back();
    },
    onCancel() {
      history.pushState(null, '', location.href);
    },
  });

  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = '';

    return e.returnValue;
  };

  const preventGoBack = () => {
    history.pushState(null, '', location.href);
    history.go(-2);
  };

  const acceptFileTypeList = [
    'text/csv',
    'application/haansoftxlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];

  const deleteExceptFiles = (files: File[]) => {
    const fileArray = Array.from(files);
    const dataTransfer = new DataTransfer();

    fileArray.forEach((file, idx) => {
      if (acceptFileTypeList.includes(file.type)) {
        dataTransfer.items.add(file);
      }
    });

    return dataTransfer.files;
  };

  const handleChangeFileInput = (e) => {
    if (e != null) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', preventGoBack);

      const { files } = e.target;

      if (files) {
        const fileList = Array.from(files);

        const isNotExcelFileList = fileList.filter((file, idx) => {
          console.log(`${idx} file type: ${file.type}`);

          return !acceptFileTypeList.includes(file.type);
        });

        if (isNotExcelFileList.length > 0) {
          alert('엑셀 타입의 파일만 선택하실 수 있습니다.');

          inputRef.current.files = deleteExceptFiles(files as File[]);
        }

        const fileArray = Array.from(inputRef.current.files);

        const fileNameList = fileArray.map((file, idx) => {
          return file.name;
        });

        setFileName(fileNameList.join(', '));
      }
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', preventGoBack);
    }
  };

  const handleCloseWebView = () => {
    // @ts-ignore
    if (window?.ReactNativeWebView) {
      // @ts-ignore
      window.ReactNativeWebView?.postMessage(JSON.stringify({ key: 'close web view' }));
    }
  };

  return (
    <>
      <button onClick={() => {
        setCls('open');

        setTimeout(() => {
          setCls('');
        }, 5000);
      }}>{'loading test'}</button>
      <div className={''} style={{ visibility: `${cls === 'open' ? 'visible':'hidden'}`, opacity: `${cls === 'open' ? 1 : 0}`, position: 'fixed', top: 0, left: 0, width: '100%', height: '100dvh', backgroundColor: 'rgba(0,0,0,0.6)'}} />
      <div style={{
        width: 'calc(100% - 64px)',
        height: '100%',
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
        <h1>{'Web view test'}</h1>
        <div style={{
          width: '100%',
        }}>
          <label htmlFor={'ex_file'}>
            <h4>{'file input'}</h4>
            <div style={{
              width: 'calc(100% - 20px)',
              height: '30px',
              border: '2px solid #f0f0f0',
              borderRadius: '5px',
              padding: '5px 10px',
              lineHeight: 1.8,
            }}>{fileName}</div>
          </label>
        </div>
        <input
          ref={inputRef}
          type={'file'}
          id={'ex_file'}
          multiple={true}
          accept={acceptFileTypeList.join(',')}
          style={{ position: 'absolute', width: 0, height: 0, margin: '-1px', overflow: 'hidden' }}
          onChange={handleChangeFileInput} />
        <Divider w={'100%'} orientation={'horizontal'} my={16} />
        <div style={{
          width: 'calc(100% - 20px)',
          border: '2px solid #f0f0f0',
          borderRadius: '5px',
          padding: '5px 10px',
          lineHeight: 1.8,
        }}>
          {`My UA: ${ua}`}
        </div>
        <Divider w={'100%'} orientation={'horizontal'} my={16} />
        <button onClick={handleCloseWebView}>{'webview close'}</button>
        <div style={{ width: 'calc(100% - 20px)' }}>
          <div style={{ width: '100%'}}>{'Message from App'}</div>
          <div
            ref={messageRef}
            style={{
              width: 'calc(100% - 64px)',
              height: '300px',
              backgroundColor: '#e0e0e0',
              border: '2px solid #f0f0f0',
              borderRadius: '5px',
              padding: 32,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}>{msg}</div>
        </div>
        <div style={{
          width: 'calc(100% - 64px)',
          height: '300px',
          backgroundColor: '#e0e0e0',
          border: '2px solid #f0f0f0',
          borderRadius: '5px',
          padding: 32,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}>
          <div>{'input test'}</div>
          <input type={'text'} inputMode={"numeric"} maxLength={3} value={numValue} onChange={(e) => {
            const val = e.currentTarget.value;

            setNumValue(val.replace(/\D/g, ''));
          }} />
        </div>
      </div>
    </>
  );
}

export default App;
