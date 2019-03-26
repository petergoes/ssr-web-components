class Multiple extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.innerHTML = `
            <article>
                <header>
                    <slot name="header"></slot>
                </header>
                <section>
                    <slot></slot>
                </section>
                <footer>
                    <slot name="footer"></slot>
                </footer>
            </article>
        `
    }
}

window.customElements.define('x-multiple', Multiple)