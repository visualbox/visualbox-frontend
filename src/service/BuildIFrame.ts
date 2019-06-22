/**
 * Build an IFrame URI string for a widget.
 */
export default (code: string, config: IObject) => {
  let configString: string
  try {
    configString = JSON.stringify(config)
  } catch (e) {
    configString = '{}'
  }

  // Inject stringified CONFIG
  code = `
    <script type="text/javascript">
      window.CONFIG = ${configString};
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
    ${code}
  `

  try {
    code = encodeURIComponent(code)
  } catch (e) {
    code = 'Failed to compile widget...'
  }

  return `data:text/html;charset=UTF-8,${code}`
}
