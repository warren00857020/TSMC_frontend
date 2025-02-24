// types.ts

export interface FileRecord {
    fileName: string;
    oldCode: string;
    newCode: string;
    loading: boolean;
    error: string;
    advice?: string;
    unitTestCode?: string;
    dockerfileContent?: string;
    yamlContent?: string;
  }
  