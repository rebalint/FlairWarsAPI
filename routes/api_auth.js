const express = require('express')
const router = express.Router()

const AppOps = require('../db/operations/application')
const ProtectRoute = require('../auth/protected')

// This is the route for registering an application within the system
router.post('/', (req, res) => {
    if (req.body.hasOwnProperty('ApplicationName')) {
        AppOps.ReadByName(req.body.ApplicationName).then( ExistingApp => {
            if (ExistingApp) {
                res.status(409).send(`Conflict: App with name ${ExistingApp.AppName} already exists`)
            }
            else {
                AppOps.RegisterApplication(req.body.ApplicationName).then( NewApplication => {
                    res.status(201).send({ClientSecret: NewApplication._id})
                })
            }
        })
    }
    else {
        res.status(400).send('Bad Request: Incomplete body')
    }
})

// This is the route for giving or removing permissions to an application
router.put('/:AppName', (req, res) => {
    const RequiredPermissions = [AppOps.PermissionTypes.CanManageAppPerms]

    const RouteOperation = () => {
        if (req.query.hasOwnProperty('action')) {
            if (req.query.action === 'add') {
                if (req.body.hasOwnProperty('Permissions')) {
                    if (Array.isArray(req.body.Permissions)) {
                        if(req.body.Permissions.every( PermType => Object.keys(AppOps.PermissionTypes).includes(PermType))) {
                            AppOps.AddPermissions(req.params.AppName, req.body.Permissions)
                            res.status(200).send('OK: Operation performed')
                        }
                        else {
                            res.status(400).send('Bad Request: Invalid Permission Types Included')
                        }
                    }
                    else {
                        if (AppOps.PermissionTypes.hasOwnProperty(req.body.Permissions)) {
                            AppOps.AddPermissions(req.params.AppName, req.body.Permissions)
                            res.status(200).send('OK: Operation performed')
                        }
                        else {
                            res.status(400).send('Bad Request: Invalid Permission Type Included')
                        }
                    }
               }
               else {
                   res.status(400).send('Bad Request: Body incomplete')
               }
            }
            else if (req.query.action === 'remove') {
                if (req.body.hasOwnProperty('Permissions')) {
                    if (Array.isArray(req.body.Permissions)) {
                        if(req.body.Permissions.every( PermType => Object.keys(AppOps.PermissionTypes).includes(PermType))) {
                            AppOps.RemovePermissions(req.params.AppName, req.body.Permissions)
                            res.status(200).send('OK: Operation performed')
                        }
                        else {
                            res.status(400).send('Bad Request: Invalid Permission Types Included')
                        }
                    }
                    else {
                        if (AppOps.PermissionTypes.hasOwnProperty(req.body.Permissions)) {
                            AppOps.RemovePermissions(req.params.AppName, req.body.Permissions)
                            res.status(200).send('OK: Operation performed')
                        }
                        else {
                            res.status(400).send('Bad Request: Invalid Permission Type Included')
                        }
                    }
               }
               else {
                   res.status(400).send('Bad Request: Body incomplete')
               }
            }
            else {
                res.status(400).send('Bad Request: Invalid action')
            }
        }
        else {
            res.status(400).send('Bad Request: Please include action in query')
        }
        
    }

    ProtectRoute(RequiredPermissions, req, res, RouteOperation)
})

module.exports = router