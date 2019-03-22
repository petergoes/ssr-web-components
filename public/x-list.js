class List extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.innerHTML = `<div>
            <p>Users:</p>
            <ul></ul>
        </div>`
    }

    get users() {
        return this._users
    }

    set users(value) {
        this._users = value
        this.setAttribute('users', value)
        const list = this.shadowRoot.querySelector('ul')
        const listItems = value.map(item => {
            return `<li>${item.name}</li>`
        }).join('')
        list.innerHTML = listItems
    }
}

window.customElements.define('x-list', List);