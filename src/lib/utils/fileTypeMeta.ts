export default (fileType: string) => {
  switch (fileType) {
    case 'js':
      return {
        icon: 'mdi-language-javascript',
        color: '#fec927',
        monacoLanguage: 'javascript'
      }
    case 'json':
      return {
        icon: 'mdi-json',
        color: '#ca3736',
        monacoLanguage: 'json'
      }
    case 'md':
      return {
        icon: 'mdi-markdown',
        color: '#3e95de',
        monacoLanguage: 'markdown'
      }
    case 'html':
      return {
        icon: 'mdi-language-html5',
        color: '#e34c25',
        monacoLanguage: 'html'
      }
    case 'npm':
      return {
        icon: 'mdi-npm',
        color: '#ca3736',
        monacoLanguage: 'json'
      }
    default:
      return {
        icon: 'mdi-file-outline',
        color: '#ffffff',
        monacoLanguage: 'text'
      }
  }
}
