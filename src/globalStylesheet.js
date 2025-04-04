const globalStyles = new CSSStyleSheet();
globalStyles.replaceSync(`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box
  }  
`);

export default globalStyles;
