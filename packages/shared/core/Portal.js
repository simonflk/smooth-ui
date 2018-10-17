import React from 'react'
import ReactDOM from 'react-dom'

class Portal extends React.Component {
  static defaultProps = {
    type: 'sui-portal',
  }

  state = { node: null }

  componentDidMount() {
    const node = document.createElement(this.props.type)
    document.body.appendChild(node)
    this.setState({ node })
  }

  componentWillUnmount() {
    document.body.removeChild(this.state.node)
  }

  render() {
    return this.state.node
      ? ReactDOM.createPortal(this.props.children, this.state.node)
      : null
  }
}

export default Portal
