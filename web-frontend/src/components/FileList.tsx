import React, { useState } from 'react';
import { FileRecord } from '../types';

interface FileListProps {
  files: FileRecord[];
  onSelectFile: (fileRecord: FileRecord) => void;
}

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
}

// 遞歸函式：建立樹狀結構
const buildFileTree = (fileList: FileRecord[]): FileTreeNode[] => {
  const tree: FileTreeNode[] = [];
  const map: { [key: string]: FileTreeNode } = {};

  fileList.forEach((file) => {
    const parts = file.fileName.split('/');
    let currentLevel = tree;

    parts.forEach((part, index) => {
      const path = parts.slice(0, index + 1).join('/');
      if (!map[path]) {
        const isFile = index === parts.length - 1;
        const node: FileTreeNode = {
          name: part,
          path,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
        };
        map[path] = node;
        currentLevel.push(node);
      }
      currentLevel = map[path].children || [];
    });
  });

  return tree;
};

const FileList: React.FC<FileListProps> = ({ files, onSelectFile }) => {
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({});
  const fileTree = buildFileTree(files);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const renderFileTree = (nodes: FileTreeNode[], depth = 0) => (
    <ul style={{ listStyle: 'none', paddingLeft: depth === 0 ? '10px' : '20px' }}>
      {nodes.map((node) => {
        const fileData = files.find((f) => f.fileName === node.path);
        const hasChanges = fileData ? fileData.newCode && fileData.newCode !== fileData.oldCode : false;

        return (
          <li key={node.path} style={{ marginBottom: '3px' }}>
            {node.type === 'folder' ? (
              <div
                onClick={() => toggleFolder(node.path)}
                style={{
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {expandedFolders[node.path] ? '📂' : '📁'} {node.name}
              </div>
            ) : (
              <button
                onClick={() => fileData && onSelectFile(fileData)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '3px 10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'block',
                  width: '100%',
                  color: hasChanges ? 'red' : 'black', // **只有變更的檔案變紅**
                  fontSize: '14px',
                }}
              >
                📄 {node.name}
              </button>
            )}
            {node.children && expandedFolders[node.path] && renderFileTree(node.children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div>
      <h3>已上傳檔案</h3>
      {renderFileTree(fileTree)}
    </div>
  );
};

export default FileList;
