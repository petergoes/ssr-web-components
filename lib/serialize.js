module.exports = function serialize (rootNode) {
  function serializeNode (node) {
    try {
      const lightDomNodes = [...node.childNodes]
      const lightDomHtml = node.innerHTML
      const templateDom = document.createElement('template')
      const scriptData = document.createElement('script')
      const slotsNodes = node.shadowRoot.querySelectorAll('slot')
      const slots = slotsNodes ? [...slotsNodes] : []
      const attributesProperties = node.getAttributeNames()
        .filter(name => name !== 'data-ssr')
        .reduce((obj, name) => {
            return {...obj, [name]: node[name] }
        }, {})

      templateDom.setAttribute('type', 'ssr-light-dom')
      templateDom.innerHTML = lightDomHtml

      scriptData.setAttribute('type', 'ssr-data')
      scriptData.innerHTML = JSON.stringify(attributesProperties)

      slots.forEach(slot => {
        if (!slot.getAttribute('name')) {
          slot.setAttribute('name', 'default')
        }
      })

      // move light nodes into shadowDom into their correct slots
      lightDomNodes
        .forEach(lightNode => {
          const targetSlotName = lightNode.nodeName === '#text' 
            ? 'default'
            : lightNode.getAttribute('slot') || 'default'

          const targetSlot = slots.find(slot => {
            const nameOfSlot = slot.getAttribute('name') || 'default'
            return nameOfSlot === targetSlotName 
          })

          targetSlot 
            ? targetSlot.parentNode.insertBefore(lightNode, targetSlot)
            : lightNode.parentNode.removeChild(lightNode)
        })

      // move shadowDom into root node
      Array.from(node.shadowRoot.childNodes).forEach(shadowNode => {
        shadowNode.parentNode.removeChild(shadowNode)
        node.appendChild(shadowNode)
      })

      // remove slot element
      slots.forEach(slot => slot.parentNode.removeChild(slot))

      // serialize custom element child nodes 
      serialize(node)

      // add original lightDom as template
      if (templateDom.innerHTML !== '') {
        node.appendChild(templateDom)
      }

      if (scriptData.innerHTML !== '{}') {
        node.appendChild(scriptData)
      }

      node.setAttribute('data-ssr', 'serialized')
    } catch (err) {
        console.log('error:', err)
    }
  }
  
  [...rootNode.querySelectorAll('*')]
      .filter(element => /-/.test(element.nodeName))
      .forEach(serializeNode)
}
