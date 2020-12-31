/** 
 * Item Operations
 * 
 * === SCHEMA ===
 * ItemName: String,
 * ItemDescription: String,
 * ItemBuyPrice: Number,
 * ItemSellPrice: Number,
 * ItemFunc: String,
 * ItemExpiration: Date,
 * ItemsInStock: Number
 */

const Item = require('../schema/item')

module.exports.CreateCosmeticItem = (ItemName, ItemDescription, BuyPrice) => {
    let NewCurrency = new Item.Model({
        ItemName: ItemName,
        ItemDescription: ItemDescription,
        ItemBuyPrice: BuyPrice,
        ItemSellPrice: Math.floor(BuyPrice*0.7),
        ItemHonPrice: null,
        ItemFunc: null,
        ItemExpiration: null,
        ItemsInStock: -1
    })

    return NewCurrency.save()
}

module.exports.CreateFunctionalItem = (ItemName, ItemDescription, BuyPrice, FunctionName) => {
    let NewCurrency = new Item.Model({
        ItemName: ItemName,
        ItemDescription: ItemDescription,
        ItemBuyPrice: BuyPrice,
        ItemSellPrice: Math.floor(BuyPrice*0.7),
        ItemHonPrice: null,
        ItemFunc: FunctionName,
        ItemExpiration: null,
        ItemsInStock: -1
    })

    return NewCurrency.save()
}

module.exports.ReadAllItems = async () => {
    return await Item.Model.find({}).exec()
}