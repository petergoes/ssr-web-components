const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');

const hydrateScript = `
[...document.querySelectorAll('[data-ssr="serialized"]')].forEach(el => {
  const template = el.querySelector('template')
  const templateContent = template.content

  el.childNodes.forEach(node => {
    if (node !== template) {
      node.parentElement.removeChild(node)
    }
  })

  templateContent.childNodes.forEach(node => el.appendChild(node))
  template.parentElement.removeChild(template)
  el.setAttribute('data-ssr', 'hydrated')
})
`;

(async (fileName) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('load', async (...args) => {
    const result = await page.$$eval('[data-ssr]', nodes => {
      return nodes.forEach(node => {
        const lightDomNodes = node.childNodes
        const lightDomHtml = node.innerHTML
        const templateElement = document.createElement('template')
        const slot = node.shadowRoot.querySelector('slot')
      
        templateElement.innerHTML = lightDomHtml
        
        // move light nodes into shadowDom
        lightDomNodes.forEach(lightNode => slot.parentNode.insertBefore(lightNode, slot))
      
        // move shadowDom into root node
        node.shadowRoot.childNodes.forEach(shadowNode => node.appendChild(shadowNode))
      
        // remove slot element
        slot.parentNode.removeChild(slot)
      
        // add original lightDom as template
        node.appendChild(templateElement)

        node.setAttribute('data-ssr', 'serialized')
      })
    })

    await page.$eval('body', (body, script) => {
      const tag = document.createElement('script')
      tag.innerHTML = script
      body.appendChild(tag)
    }, hydrateScript)

    fs.writeFile(
      path.join(__dirname, fileName.replace('.html', '.ssr.html')),
      await page.content(), {encoding: 'utf8'},
      async (err) => {
          await browser.close();
      }
    )
  })

  await page.goto('file://' + path.join(__dirname, fileName))    
})('/public/index.html');