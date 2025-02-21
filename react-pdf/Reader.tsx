import * as React from 'react'
import { render } from 'react-dom'
import { Page, Document, pdfjs } from 'react-pdf'
import raf, { cancel } from 'raf'
import Down from './components/down'
import Plus from './components/Plus'
import Minus from './components/Minus'
import Up from './components/up'
import './Reader.less'

const ReactContainer = document.querySelector('#react-container')

const PDFJS = pdfjs as any

PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`
const options = {
  cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS.version}/cmaps/`,
  cMapPacked: true,
}

interface Props {
  file: any
  customStyle?: {
    readerContainer?: any
    readerContainerDocument?: any
    readerContainerNumbers?: any
    readerContainerNumbersContent?: any
    readerContainerZoomContainer?: any
    readerContainerZoomContainerButton?: any
    readerContainerNavigate?: any
    readerContainerNavigateArrow?: any
  }
}

interface State {
  numPages?: number
  currentPage: number
  ready: boolean
  scale: number
  error?: any
}

class Reader extends React.Component<Props, State> {
  static getDerivedStateFromError(error: any) {
    return { error }
  }

  state = {
    numPages: null,
    currentPage: 1,
    ready: true,
    pageLoaded: false,
    scale: 0.75,
    error: undefined,
  }

  MAX_SCALE = 2
  __zoomEvent = false

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages })
  }

  onError = (error: Error) => this.setState({ error })

  zoomOut = (event: any) => {
    event.preventDefault()
    if (!this.__zoomEvent) {
      raf(this.zOut)
    }
  }

  zoomIn = (event: any) => {
    event.preventDefault()
    if (!this.__zoomEvent) {
      raf(this.zIn)
    }
  }

  zIn = () => {
    if (this.state.scale <= this.MAX_SCALE - 0.25) {
      this.__zoomEvent = true
      this.setState(previousState => ({
        scale: previousState.scale + 0.25,
      }))
    }
  }

  zOut = () => {
    if (this.state.scale >= 0.75) {
      // min scale out is 0.5 and defaults @ 0.75
      this.__zoomEvent = true
      this.setState(previousState => ({
        scale: previousState.scale - 0.25,
      }))
    }
  }

  up = () => {
    const { currentPage } = this.state
    if (currentPage > 1) {
      const target = currentPage - 1
      this.setState({ currentPage: target })
    }
    // @ts-ignore
    cancel(this.up)
  }

  down = () => {
    const { currentPage, numPages } = this.state
    if (currentPage < numPages) {
      const target = currentPage + 1
      this.setState({ currentPage: target })
    }
    // @ts-ignore
    cancel(this.down)
  }

  goUp = (event: any) => {
    event.preventDefault()
    raf(this.up)
  }

  goDown = (event: any) => {
    event.preventDefault()
    raf(this.down)
  }

  renderPage = (pageNumber: number) => {
    return (
      <Page
        loading={' '}
        key={`page_${pageNumber}`}
        pageNumber={pageNumber}
        onLoadError={this.onError}
        onRenderError={this.onError}
        onGetTextError={this.onError}
        onRenderSuccess={() => {
          this.__zoomEvent = false
        }}
        scale={this.state.scale}
      />
    )
  }

  render() {
    const { numPages, currentPage, error } = this.state
    const { customStyle } = this.props
    if (error) {
      return <p>{error.message ? error.message : 'Sorry an error occurred!'}</p>
    }
    return (
      <div className='Reader'>
        <div className='Reader__container' style={customStyle?.readerContainer}>
          <div
            className='Reader__container__document'
            style={customStyle?.readerContainerDocument}
          >
            <Document
              loading={' '}
              onLoadSuccess={this.onDocumentLoadSuccess}
              onLoadError={this.onError}
              onSourceError={this.onError}
              {...{ options, file }}
            >
              {this.renderPage(currentPage)}
            </Document>
          </div>

          {numPages && (
            <div
              className='Reader__container__numbers'
              style={customStyle?.readerContainerNumbers}
            >
              <div
                className='Reader__container__numbers__content'
                style={customStyle?.readerContainerNumbersContent}
              >
                {currentPage} / {numPages}
              </div>
            </div>
          )}

          <div
            className='Reader__container__zoom_container'
            style={customStyle?.readerContainerZoomContainer}
          >
            <div
              className='Reader__container__zoom_container__button'
              style={customStyle?.readerContainerZoomContainerButton}
              onClick={this.zoomIn}
            >
              <Plus />
            </div>
            <div
              className='Reader__container__zoom_container__button'
              style={customStyle?.readerContainerZoomContainerButton}
              onClick={this.zoomOut}
            >
              <Minus />
            </div>
          </div>

          <div
            className={'Reader__container__navigate'}
            style={customStyle?.readerContainerNavigate}
          >
            <div
              className='Reader__container__navigate__arrow'
              style={{
                ...(currentPage === 1
                  ? { color: 'rgba(255,255,255,0.4)' }
                  : {}),
                ...customStyle?.readerContainerNavigateArrow,
              }}
              onClick={this.goUp}
            >
              <Up />
            </div>
            <div
              className='Reader__container__navigate__arrow'
              style={{
                ...(currentPage === numPages
                  ? { color: 'rgba(255,255,255,0.4)' }
                  : {}),
                ...customStyle?.readerContainerNavigateArrow,
              }}
              onClick={this.goDown}
            >
              <Down />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const tagData = document.querySelector('#file')
const file = tagData.getAttribute('data-file')
// @ts-ignore
const customStyle = window.CUSTOM_STYLE

render(<Reader {...{ file, customStyle }} />, ReactContainer)
