const validator = require('fastest-validator')

const v = new validator()
const schemaCreateInventory = {
    inventoryName: { type: "string" },
    inventoryCategory: { type: "string"},
    expiryTime: {
        type: "date", 
        optional: true,
        convert: true,
        default: '0000-00-00 00:00:00'

    },
    quantity: { type: "number", default: 1, convert: true},
    manufacturingTime: { 
        type: "date",
        convert: true
    }
}
const check = v.compile(schemaCreateInventory)

module.exports = check