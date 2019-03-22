class Child extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `<strong>Nested</strong>`;
    }
}
window.customElements.define('x-child', Child);