import React, { useState, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import Sidebar from './components/Sidebar';
import CodeDiff from './components/CodeDiff';
import FileList from './components/FileList';
import RaceCarLoading from './components/RaceCarLoading';
import './App.css';
import { FileRecord } from './types';
import PromptModal from './components/PromptModal';
import LogModal from './components/LogModal';
import { useProjectManager } from './hooks/useProjectManager';

const App: React.FC = () => {
  const {
    files,
    setFiles,
    pendingFiles,
    selectedFile,
    setSelectedFile,
    advice,
    setAdvice,
    handleProjectUpload,
    sendFilesToBackend,
    sendFilesToMultiBackend,
    handleConfirmPrompt,
    isTesting,
    setIsTesting,
    progress,
    setProgress, 
    testProgress,
    setTestProgress,
    testResult,
    setTestResult,
    isUpdating,
    setIsUpdating,
    startProcessing,
    finishProcessing,
    fileLogs,
    setFileLogs,
    logModal,
    openLogModal,
    closeLogModal,
    handleConfirmRethink,
    handleGenerateConfigs,
    handleTestProject,
  } = useProjectManager();

  // 原有 state
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [processingMode, setProcessingMode] = useState("single");
  const [isRethinkModalOpen, setIsRethinkModalOpen] = useState(false);
  
  // 當使用者點選檔案列表時更新選取檔案
  const handleSelectFile = (fileRecord: FileRecord) => {
    setSelectedFile(fileRecord);
    setAdvice(fileRecord.advice || '尚無建議');
  };

  return (
    <div className="main-wrapper">
      {isUpdating && (
        <div className="loading-overlay">
          <RaceCarLoading progress={progress} total={files.length} />
        </div>
      )}

      {isRethinkModalOpen && (
        <PromptModal
          isOpen={isRethinkModalOpen}
          onClose={() => setIsRethinkModalOpen(false)}
          onConfirm={handleConfirmRethink}
        />
      )}

      {/* 顯示 log Modal */}
      <LogModal 
        isOpen={logModal.isOpen}
        onClose={closeLogModal}
        log={logModal.log}
        fileName={logModal.fileName}
      />

      <div className="title-container">
        <h2>AI 維運懶人包 tu_tu_tu_du</h2>
      </div>
      <div className="app-container">
        <Sidebar>
          <div className="mode-toggle" style={{ marginBottom: '10px', textAlign: 'center' }}>
            <button
              onClick={() => setProcessingMode('single')}
              style={{
                padding: '8px 12px',
                marginRight: '5px',
                backgroundColor: processingMode === 'single' ? '#007bff' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              獨立檔案
            </button>
            <button
              onClick={() => setProcessingMode('multi')}
              style={{
                padding: '8px 12px',
                backgroundColor: processingMode === 'multi' ? '#007bff' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              關聯檔案
            </button>
          </div>
          <input
            type="file"
            className="upload-button"
            onChange={(e) => {
              handleProjectUpload(e);
              setIsPromptModalOpen(true);
            }}
            ref={(input) => input && (input.webkitdirectory = true)}
          />
          <FileList files={files} onSelectFile={handleSelectFile} />
        </Sidebar>
  
        <main className="main-content">
          {selectedFile ? (
            <>
              <div
                className="code-diff-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <h3>程式碼比對 - {selectedFile.fileName}</h3>
                <div>
                  <button
                    onClick={() => setIsRethinkModalOpen(true)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginRight: '10px'
                    }}
                    disabled={selectedFile.loading}
                  >
                    AI rethink
                  </button>
                  
                  <button
                    onClick={handleGenerateConfigs}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                    disabled={selectedFile.loading}
                  >
                    自動部屬
                  </button>
                </div>
              </div>
              <CodeDiff
                fileName={selectedFile?.fileName || ""}
                oldCode={selectedFile?.oldCode || ""}
                newCode={selectedFile?.newCode || ""}
                loading={selectedFile?.loading || false}
                error={selectedFile?.error || ""}
                onCodeChange={(updatedCode) => {
                  setSelectedFile((prevFile) =>
                    prevFile ? { ...prevFile, newCode: updatedCode } : null
                  );
                  setFiles((prevFiles) =>
                    prevFiles.map((file) =>
                      file.fileName === selectedFile?.fileName
                        ? { ...file, newCode: updatedCode }
                        : file
                    )
                  );
                }}
              />
            </>
          ) : (
            <p className="placeholder-text">請上傳專案並選擇修改過的檔案來查看變更</p>
          )}
        </main>

        <PromptModal
          isOpen={isPromptModalOpen}
          onClose={() => setIsPromptModalOpen(false)}
          onConfirm={(prompt) => {
            handleConfirmPrompt(prompt, processingMode);
            setIsPromptModalOpen(false);}}
        />
  
        <aside className="advice-panel">
          <h3>後端建議</h3>
          {selectedFile?.advice ? (
            <ReactMarkdown>{selectedFile.advice}</ReactMarkdown>
          ) : (
            <p>尚無建議</p>
          )}
          <button
            onClick={handleTestProject}
            style={{
              marginTop: '15px',
              padding: '10px 15px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '100%',
            }}
            disabled={isTesting}
          >
            {isTesting ? '測試中...' : '測試專案'}
          </button>

          {/* 顯示進度訊息 */}
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '5px' }}>
          <>
            <strong>測試進度:</strong>
            <ul>
              {testProgress.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </>
          </div>

          {/* 如果有檔案的 log，可用紙張圖示顯示 */}
          {Object.keys(fileLogs).map((fileName) => (
            <div key={fileName} style={{ marginBottom: '5px' }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openLogModal(fileName);
                }}
                style={{ textDecoration: 'none', color: '#007bff' }}
              >
                <span role="img" aria-label="log">📄</span> {fileName}
              </a>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
};

export default App;