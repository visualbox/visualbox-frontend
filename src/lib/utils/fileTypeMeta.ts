export default (name: string) => {
  const fileType = name
    ? name.split('.').pop()
    : null

  switch (fileType) {
    case 'Dockerfile':
      return {
        icon: 'mdi-docker',
        color: '#2b9be8',
        monacoLanguage: 'dockerfile'
      }
    case 'go':
      return {
        icon: 'mdi-language-go',
        color: '#29beb1',
        monacoLanguage: 'go'
      }
    case 'html':
      return {
        icon: 'mdi-language-html5',
        color: '#e34c25',
        monacoLanguage: 'html'
      }
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
    case 'npm':
      return {
        icon: 'mdi-npm',
        color: '#ca3736',
        monacoLanguage: 'json'
      }
    case 'proto':
      return {
        icon: 'mdi-buffer',
        color: '#fff',
        monacoLanguage: 'text'
      }
    case 'py':
      return {
        icon: 'mdi-language-python',
        color: '#4180b1',
        monacoLanguage: 'python'
      }
    case 'sh':
      return {
        icon: 'mdi-console',
        color: '#4caf50',
        monacoLanguage: 'shell'
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
