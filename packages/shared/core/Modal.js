/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react'
import PropTypes from 'prop-types'
import { css, withTheme } from './styled-engine'
import { th, mixin } from './utils/system'
import Transition from './Transition'
import Portal from './Portal'
import createComponent from './utils/createComponent'

const createAriaHider = dialogNode => {
  const originalValues = []
  const rootNodes = []

  Array.prototype.forEach.call(document.querySelectorAll('body > *'), node => {
    if (node === dialogNode.parentNode) {
      return
    }
    const attr = node.getAttribute('aria-hidden')
    const alreadyHidden = attr !== null && attr !== 'false'
    if (alreadyHidden) {
      return
    }
    originalValues.push(attr)
    rootNodes.push(node)
    node.setAttribute('aria-hidden', 'true')
  })

  return () => {
    rootNodes.forEach((node, index) => {
      const originalValue = originalValues[index]
      if (originalValue === null) {
        node.removeAttribute('aria-hidden')
      } else {
        node.setAttribute('aria-hidden', originalValue)
      }
    })
  }
}

class ModalComponent extends React.Component {
  handleKeyup = ({ keyCode }) => {
    if (keyCode === 27 /* Escape */) {
      this.props.onClose()
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyup)
    if (this.disposeAriaHider) {
      this.disposeAriaHider()
    }
  }

  setupKeyHandling() {
    if (this.props.opened) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keyup', this.handleKeyup)
    } else {
      document.body.style.overflow = null
      document.removeEventListener('keyup', this.handleKeyup)
    }
  }

  componentDidMount() {
    this.setupKeyHandling()
  }

  componentDidUpdate() {
    this.setupKeyHandling()
  }

  handleDialogRef = dialogNode => {
    if (dialogNode && !this.disposeAriaHider) {
      this.disposeAriaHider = createAriaHider(dialogNode)
    }
  }

  render() {
    const {
      className: propClassName,
      forwardedRef,
      forwardedAs,
      theme,
      opened,
      onClose,
      children,
      persistent,
      ...props
    } = this.props
    return (
      <Portal>
        <Transition
          timeout={theme ? theme.modalTransitionDuration : 300}
          in={this.props.opened}
        >
          {transitionState => {
            const visible =
              opened ||
              transitionState === 'entered' ||
              transitionState === 'exiting' ||
              transitionState === 'entering'
            const mounted = persistent || visible
            let className = 'sui-modal'
            if (visible) className += ' sui-modal-opened'
            if (transitionState)
              className += ` sui-modal-transition-${transitionState}`
            if (propClassName) className += ` ${propClassName}`
            return (
              <div
                role="dialog"
                tabIndex="-1"
                className={className}
                ref={this.handleDialogRef}
                {...props}
              >
                {mounted && (
                  <div className="sui-modal-backdrop" onClick={onClose} />
                )}
                {mounted && children}
              </div>
            )
          }}
        </Transition>
      </Portal>
    )
  }
}

const ModalComponentWithTheme = withTheme(ModalComponent)

const Modal = createComponent(() => ({
  name: 'modal',
  InnerComponent: ModalComponentWithTheme,
  style: css`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: ${th('zIndexModal')};
    visibility: hidden;
    overflow: hidden;
    outline: 0;
    ${mixin(
      'transition',
      css`opacity ${th('modalTransitionDuration')}ms ease-in-out`,
    )};

    &.sui-modal-opened {
      visibility: visible;
      overflow-x: hidden;
      overflow-y: auto;
    }

    &.sui-modal-transition-entering {
      opacity: 1;
    }

    &.sui-modal-transition-entered {
      opacity: 1;
    }

    &.sui-modal-transition-exited {
      opacity: 0;
    }

    &.sui-modal-transition-exiting {
      opacity: 0;
    }

    .sui-modal-backdrop {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: ${th('modalBackdropBg')};
    }
  `,
  propTypes: {
    children: PropTypes.node,
    opened: PropTypes.bool,
    persistent: PropTypes.bool,
    onClose: PropTypes.func,
  },
  defaultProps: {
    persistent: true,
  },
}))

export default Modal
