Files for www.varnamproject.com


# Running
* Install dependencies using `npm install`
* Run server using `node server.js`
* You may need to compile the Varnam module yourself. Otherwise you may see errors like the following: `Error: dlopen(/Users/sdqali/src/play/varnamproject.com/node_modules/varnam.node, 1): no suitable image found.  Did find:`
`	/Users/sdqali/src/play/varnamproject.com/node_modules/varnam.node: unknown file type, first eight bytes: 0x7F 0x45 0x4C 0x46 0x02 0x01 0x01 0x00`
* To compile Varnam module, grab `https://github.com/navaneeth/libvarnam-nodejs` and build
* Copy `<libvarnam-nodejs>/build/Release/varnam.node` to `./node_modules`
