const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('load', async (...args) => {
        const htmlHandle = await page.$('html')
        await htmlHandle.$eval('x-hello', 
            (node) => {
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

                return node.outerHTML
            }
        )

        console.log(await page.content())
        fs.writeFile(
            path.join(__dirname, '/public/index.ssr.html'),
            await page.content(), {encoding: 'utf8'},
            async (err) => {
                await browser.close();
            })
    })

    await page.goto('file://' + path.join(__dirname, '/public/index.html'))    
})();