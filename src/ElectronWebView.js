import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import camelCase from 'lodash.camelcase';
import { events, methods, props } from './constants';

export default class ElectronWebView extends Component {
	componentDidMount () {
		const container = ReactDOM.findDOMNode(this.c);
		let propString = '';
		Object.keys(props).forEach(propName => {
			if (typeof this.props[propName] !== 'undefined') {
				if (typeof this.props[propName] === 'boolean') {
					propString += `${propName}="${this.props[propName] ? 'on' : 'off'}" `;
				} else {
					propString += `${propName}=${JSON.stringify(this.props[propName].toString())} `;
				}
			}
		});
		if (this.props.className) {
			propString += `class="${this.props.className}" `;
		}
		container.innerHTML = `<webview ${propString}/>`
		this.view = container.querySelector('webview');

		this.ready = false;
		this.view.addEventListener('did-attach', () => {
			this.ready = true;
			events.forEach(event => {
				this.view.addEventListener(event, (...args) => {
					const propName = camelCase(`on-${event}`);
					// console.log('Firing event: ', propName, ' has listener: ', !!this.props[propName]);
					if (this.props[propName]) this.props[propName](...args);
				});
			})
		})

		methods.forEach(method => {
			this[method] = (...args) => {
				if (!this.ready) {
					throw new Error('WebView is not ready yet, you can\'t call this method');
				}
				return this.view[method](...args)
			}
		})
	}

	isReady() {
		return this.ready;
	}

	render () {
		return <div ref={c => this.c = c} style={this.props.style || {}}></div>;
	}
}

ElectronWebView.propTypes = Object.assign({
	className: PropTypes.string,
	style: PropTypes.object,
}, props);

events.forEach(event => {
	ElectronWebView.propTypes[camelCase(`on-${event}`)] = PropTypes.func;
});
