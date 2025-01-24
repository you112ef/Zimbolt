// app/types/cssModules.d.ts

declare module '*.css?url' {
  const value: string;
  export default value;
}

declare module '*.scss?url' {
  const value: string;
  export default value;
}

declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
