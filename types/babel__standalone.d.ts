declare module '@babel/standalone' {
  interface TransformOptions {
    presets?: string[];
    filename?: string;
    plugins?: string[];
    [key: string]: any;
  }

  interface TransformResult {
    code: string;
    map?: any;
    ast?: any;
  }

  export function transform(code: string, options?: TransformOptions): TransformResult;
  export function transformFromAst(ast: any, code?: string, options?: TransformOptions): TransformResult;
} 