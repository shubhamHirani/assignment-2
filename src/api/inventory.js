const express = require('express')
const multer = require('multer')
const moment = require('moment-timezone')
const connection = require('../db/sql')
const check = require('../model/model')
const sharp = require('sharp')
const logger = require('../../logger')
const app = express()
const fs = require('fs')

app.use(express.json())

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/');
    },
    filename: function (req, file, cb) {
        // let extension = file.originalname.split(".").pop()
        cb(null, file.originalname);
    }
})

const upload = multer({
    storage: storage,
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(png|jpeg|jpg)$/)){
            return cb(new Error('Please upload an Image.'))
            logger.error('upload inventory image')
        }
        
        cb(undefined, true)
        logger.info('file is added to public folder')
    }
   
})

app.post('/addinventory', upload.single('profile'), (req,res)=>{
    check(req.body)

    const inventory_name = req.body.inventory_name
    // console.log(req.body.inventoryName)
    const inventoryCategory = req.body.inventoryCategory
    var expiryTime = req.body.expiryTime
    const quantity = req.body.quantity
    var manufacturingTime = req.body.manufacturingTime
    const inventoryImage = '/home/shubham/node-js/assignment-2/public/'+req.file.filename

    // const buffer = sharp(req.file.buffer).png().toBuffer()

    expiryTime = moment(expiryTime).tz("America/Los_Angeles").format();
    manufacturingTime = moment(manufacturingTime).tz("America/Los_Angeles").format();

    if(expiryTime< manufacturingTime){
        logger.error('please enter valid date')
        throw new Error('please enter valid date and time ')
    }
    
    connection.query('INSERT INTO inventory (inventory_name , inventory_category, expiry_time, quantity, manufacturing_time, inventory_image, inventory_id) VALUES (?,?,?,?,?,?,?)', [inventory_name, inventoryCategory, expiryTime, quantity, manufacturingTime, inventoryImage, 0], (err, result)=>{
        if(err){
            throw err
        }
        logger.info('data inserted succesfully.....')
        res.status(200).send(result)
    })
})

app.get('/inventory/:name', (req,res)=>{
    const name  = req.params.name
    let timezone = ''
    if (!req.query.timezone) {
        timezone = 'America/Los_Angeles'
    }else {
        timezone = req.query.timezone
    }

    connection.query('SELECT * FROM inventory WHERE inventory_name = ? OR inventory_category = ?', [name, name], (err, result)=>{
        if(err){
            logger.error(err)
            throw err
        }

        const dateDiff = (firstDate, secondDate) => {
            if (firstDate <=secondDate) {
                return true
            }else{
                return false
            }
        };


        const newArr = result.map((element) => {
            var expiryTime = moment.tz(element.expiryTime, timezone).format()
            is_expired = dateDiff(expiryTime, new Date())
            element.is_expired = is_expired
            return element
        });

        const jsonArr = JSON.stringify(newArr)
        logger.info('data is fetched using variable '+name)
        res.end(jsonArr);
    })
})


app.put('/update/:id', (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['quantity']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))


    if (!isValidOperation) {
        logger.error('Invalid update')
        return res.status(400).send({ error: 'Invalid update' })
    }

    console.log(req.body)
    console.log(req.json)
    connection.query('UPDATE inventory SET quantity = ? WHERE inventory_id = ?', [req.body.quantity,req.params.id], (err,result)=>{
        if(err){
            logger.error(err)
            throw err
        }
        logger.info('data is updated')
        res.send(result)
    })
})

app.delete('/inventory/image/:id', (req,res)=>{
    const id = req.params.id

    connection.query("UPDATE inventory SET status = ? WHERE inventory_id = ?",['true', id],(err, result)=>{
        if(err){
            logger.error(err)
            throw err
        }
        connection.query('select inventory_image from inventory where inventory_id=?', [id], (error, results, fields) => {
            fs.unlink(results[0].inventory_image, (error) => {

                if (error) {
                    logger.error(error)
                    throw error;
                }
                connection.query("UPDATE inventory SET inventory_image = ? WHERE inventory_id = ?",[' ', id], (err, result)=>{
                    if(err){
                        logger.error(err)
                        throw err
                    }
                })


                logger.info('successfully unlink image data')
            })
        })
        logger.info('image is deleted succesfully')
        res.send(result)
    } )
})
  

app.delete('/inventory/name', (req,res)=>{
    check(req.body)
    const category = req.body.name

    connection.query("DELETE FROM inventory WHERE inventory_category = ? OR inventory_name = ?",[category, category],(err, result)=>{
        if(err){
            logger.error(err)
            throw err
        }
        logger.info('inventory data deleted succesfully')
        res.send(result)
    } )
})


module.exports = app