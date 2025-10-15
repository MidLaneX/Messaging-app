/// <reference types="react-scripts" />

// Extend HTMLInputElement to include the capture attribute
declare global {
  namespace JSX {
    interface IntrinsicElements {
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
        capture?: string | boolean;
      };
    }
  }
}