declare module 'pptxgenjs' {
  export default class PptxGenJS {
      constructor();
      addSlide(): Slide;
      writeFile(options: { fileName: string }): Promise<void>;
  }

  interface Slide {
      addText(text: string, options: TextOptions): void;
      addImage(options: ImageOptions): void;
  }

  interface TextOptions {
      x?: number;
      y?: number;
      w?: string | number;
      h?: string | number;
      fontSize?: number;
      bold?: boolean;
      color?: string;
      align?: 'left' | 'center' | 'right';
      breakLine?: boolean;
  }

  interface ImageOptions {
      data: string;
      x: number;
      y: number;
      w: number;
      h: number;
  }
}
