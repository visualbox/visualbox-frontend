import Vue from 'vue'
import * as monaco from 'monaco-editor'
import ResizeSensor from 'css-element-queries/src/ResizeSensor'

declare global {
  interface Window {
    monaco: any
    require: any
  }
}

Vue.component('monaco-editor', Vue.extend({
  name: 'MonacoEditor',

  props: {
    value: String,
    theme: {
      type: String,
      default: 'vs-dark'
    },
    language: String,
    options: Object,
    amd: {
      type: Boolean,
      default: false
    },
    require: {
      type: Function,
      default: window.require
    }
  },

  model: {
    event: 'change'
  },

  data: () => ({
    editor: null as any,
    resizeSensor: null as any
  }),

  watch: {
    options: {
      deep: true,
      handler (options) {
        if (this.editor)
          this.editor.updateOptions(options)
      }
    },

    value (newValue) {
      if (this.editor) {
        if (newValue !== this.editor.getValue())
          this.editor.setValue(newValue)
      }
    },

    language (newVal) {
      if (this.editor)
        window.monaco.editor.setModelLanguage(this.editor.getModel(), newVal)
    },

    theme (newVal) {
      if (this.editor)
        window.monaco.editor.setTheme(newVal)
    }
  },

  mounted () {
    if (this.amd) {
      this.require(['vs/editor/editor.main'], () => {
        this.initMonaco(window.monaco)
      })
    } else
      this.initMonaco(monaco)
    this.resizeSensor = new ResizeSensor(this.$el, () => { this.editor.layout() })
  },

  beforeDestroy () {
    if (this.editor)
      this.editor.dispose()
    this.resizeSensor.detach()
  },

  methods: {
    initMonaco (monacoInstance: any) {
      const options = Object.assign(
        {
          value: this.value,
          theme: this.theme,
          language: this.language
        },
        this.options
      )

      this.editor = monacoInstance.editor.create(this.$el, options)
      this.editor.getModel().updateOptions({ tabSize: 2 })
      this.$emit('editorDidMount', this.editor)
      this.editor.onContextMenu((e: monaco.editor.IEditorMouseEvent) => {
        this.$emit('contextMenu', e)
      })
      this.editor.onDidBlurEditorText(() => this.$emit('blurText'))
      this.editor.onDidBlurEditorWidget(() => this.$emit('blurWidget'))
      this.editor.onDidChangeConfiguration((e: monaco.editor.IConfigurationChangedEvent) => {
        this.$emit('configuration', e)
      })
      this.editor.onDidChangeCursorPosition((e: monaco.editor.ICursorPositionChangedEvent) => {
        this.$emit('position', e)
      })
      this.editor.onDidChangeCursorSelection((e: monaco.editor.ICursorSelectionChangedEvent) => {
        this.$emit('selection', e)
      })
      this.editor.onDidChangeModel((e: monaco.editor.IModelChangedEvent) => {
        this.$emit('model', e)
      })
      this.editor.onDidChangeModelContent((e: monaco.editor.IModelContentChangedEvent) => {
        const value = this.editor.getValue()
        if (this.value !== value)
          this.$emit('change', value, e)
      })
      this.editor.onDidChangeModelDecorations((e: monaco.editor.IModelDecorationsChangedEvent) => {
        this.$emit('modelDecorations', e)
      })
      this.editor.onDidChangeModelLanguage((e: object) => {
        this.$emit('modelLanguage', e)
      })
      this.editor.onDidChangeModelOptions((e: monaco.editor.IModelOptionsChangedEvent) => {
        this.$emit('modelOptions', e)
      })
      this.editor.onDidDispose(() => this.$emit('afterDispose'))
      this.editor.onDidFocusEditorText(() => this.$emit('focusText'))
      this.editor.onDidFocusEditorWidget(() => this.$emit('focusWidget'))
      this.editor.onDidLayoutChange((e: monaco.editor.EditorLayoutInfo) => this.$emit('layout', e))
      this.editor.onDidScrollChange((e: monaco.IScrollEvent) => this.$emit('scroll', e))
      this.editor.onKeyDown((e: monaco.IKeyboardEvent) => this.$emit('keydown', e))
      this.editor.onKeyUp((e: monaco.IKeyboardEvent) => this.$emit('keyup', e))
      this.editor.onMouseDown((e: monaco.editor.IEditorMouseEvent) => this.$emit('mouseDown', e))
      this.editor.onMouseLeave((e: monaco.editor.IPartialEditorMouseEvent) => this.$emit('mouseLeave', e))
      this.editor.onMouseMove((e: monaco.editor.IEditorMouseEvent) => this.$emit('mouseMove', e))
      this.editor.onMouseUp((e: monaco.editor.IEditorMouseEvent) => this.$emit('mouseUp', e))
    },

    getMonaco (): any {
      return this.editor
    },

    focus () {
      this.editor.focus()
    }
  },

  render (h) {
    return h('div')
  }
}))
