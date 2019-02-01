/**
 * Build an IFrame URI string for a widget.
 * @param  {String} source Integration source code
 * @param  {Object} config Integration configuration
 * @return {String}        URI encoded string
 */
export default (source: string, config: IObject) => {
  // Compile code template
  let configParsed: string
  try {
    configParsed = JSON.stringify(config)
  } catch (e) {
    configParsed = '{}'
  }
  let code = `
    <script type="text/javascript">
      window.CONFIG = ${configParsed};
      window.DATA = null;

      window.addEventListener('message', function (event) {
        try {
          if (typeof event.data == 'object' && event.data.call=='sendConfig') {
            window.CONFIG = event.data.value;

            if (typeof onMessage === 'function') {
              onMessage({
                type: 'CONFIG_CHANGED',
                value: event.data.value
              })
            }
          }
          if (typeof event.data == 'object' && event.data.call=='sendData') {
            window.DATA = event.data.value;

            if (typeof onMessage === 'function') {
              onMessage({
                type: 'DATA_CHANGED',
                value: event.data.value
              })
            }
          }
        } catch (e) {
          console.warn('Widget error:', e);
        }
      }, false);
    </script>
    ${source}
  `

  try {
    code = encodeURIComponent(code)
  } catch (e) {
    code = 'Failed to compile widget...'
  }

  return `data:text/html,${code}`
}
