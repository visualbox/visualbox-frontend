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
      window.visualbox = {
        onConfigChanged: function (cb) { this.callbacks.onConfigChanged = cb },
        onDataChanged: function (cb) { this.callbacks.onDataChanged = cb },
        config: ${configString},
        data: undefined,
        callbacks: {
          onConfigChanged: undefined,
          onDataChanged: undefined
        }
      };

      window.addEventListener('DOMContentLoaded', function () {
        if (typeof visualbox.callbacks.onConfigChanged === 'function') {
          visualbox.callbacks.onConfigChanged(${configString});
        }
      });

      window.addEventListener('message', function (event) {
        try {
          if (typeof event.data === 'object' && event.data.call === 'sendConfig') {
            visualbox.config = event.data.value;

            if (typeof (visualbox.callbacks || {}).onConfigChanged === 'function') {
              visualbox.callbacks.onConfigChanged(event.data.value)
            }
          }
          if (typeof event.data === 'object' && event.data.call === 'sendData') {
            visualbox.data = event.data.value;

            if (typeof (visualbox.callbacks || {}).onDataChanged === 'function') {
              visualbox.callbacks.onDataChanged(event.data.value)
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
