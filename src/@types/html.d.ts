// allows for `import * as template from 'foo.html'`
declare module '*.html' { const value: string; export default value; }
