export default (name: string): string => {
  switch (name) {
    case 'package.json': return 'npm'
    default:
      const nameSplit = name.split('.')
      return nameSplit.length > 1 ? nameSplit[nameSplit.length - 1] : 'file'
  }
}
