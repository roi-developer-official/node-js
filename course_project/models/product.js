const path = require('path')
const main = require.main
const fs = require('fs')

const p = path.join(path.dirname(main.filename), 'data', 'products.json')
module.exports = class Product {
    constructor(title) {
        this.title = title
    }

    save() {
        fs.readFile(p, (err,fileContent)=>{
            let products = []
            if(!err){
                products = JSON.parse(fileContent)
            }
            products.push(this)

            fs.writeFile(p, JSON.stringify(products), (err)=>{
                console.log(err)
            })
        })
    }

    static fetchAll(cb) {
        fs.readFile(p, (err,fileContent)=>{
            if(err){
                cb([])
            }
            cb(JSON.parse(fileContent))
        })
    }
}

