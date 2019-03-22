class Parent extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `<em><x-child></x-child></em>`;
    }
}
window.customElements.define('x-parent', Parent);