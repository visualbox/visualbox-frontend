export default (name: string) => {
  const fileType = name.split('.').pop()

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
    case 'py':
      return {
        icon: 'mdi-language-python',
        color: '#4180b1',
        monacoLanguage: 'python'
      }
    case 'go':
      return {
        icon: 'mdi-language-go',
        color: '#29beb1',
        monacoLanguage: 'go'
      }
    case 'txt':
      return {
        icon: 'mdi-script-text',
        color: '#b9ae00',
        monacoLanguage: 'text'
      }
    default:
      return {
        icon: 'mdi-file-question',
        color: '#DDD',
        monacoLanguage: 'text'
      }
  }
}
