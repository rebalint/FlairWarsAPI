/**
 * Standard Parameters
 * RedditUsername - User's Reddit Username
 * FlairwarsColor - User's Flairwars Color
 * DiscordMemberID - User's Discord Member ID
 */

const express = require('express')
const router = express.Router()

const UserOps = require('../db/operations/user')
const AppOps = require('../db/operations/application')
const ProtectRoute = require('../auth/protected')

router.get('/', (req, res) => {

  if ( Object.keys(req.query).length > 0 ) {

    UserOps.ReadUsersByQuery({
      $or: [
        { RedditName: req.query.RedditUsername },
        { Color: req.query.FlairwarsColor },
        { MemberID: req.query.DiscordMemberID }
      ]
    }).then( results => {
      let UsersResponse = []
      results.forEach( userResult => {
        UsersResponse.push({
          DiscordMemberID: userResult.MemberID,
          FlairwarsColor: userResult.Color,
          RedditUsername: userResult.RedditName
        })
      })
      res.status(200).send(UsersResponse)
    })

  }

  else {
    UserOps.ReadAllUsers().then( results => {
      let UsersResponse = []
      results.forEach( userResult => {
        UsersResponse.push({
          DiscordMemberID: userResult.MemberID,
          FlairwarsColor: userResult.Color,
          RedditUsername: userResult.RedditName
        })
      })
      res.status(200).send(UsersResponse)
    })
  }
   
})

router.post('/', (req, res) => {

  const RoutePermissions = [AppOps.PermissionTypes.CanWriteUsers]

  let RouteOperation = () => {  
    const requiredFields = ['RedditUsername', 'FlairwarsColor', 'DiscordMemberID']

    if (requiredFields.every( item => req.body.hasOwnProperty(item))) {
      UserOps.ReadOneUser(req.body.DiscordMemberID).then( ExistingUser => {

        if (ExistingUser) {
          res.status(409).send('Conflict: User exists')
        }

        else {
          UserOps.APICreateUser(req.body.DiscordMemberID, req.body.RedditUsername, req.body.FlairwarsColor).then( newUser => {

            if (newUser) {
              res.status(201).send('Created')
            }

            else res.status(500).send('Internal Server Error: Database communication error')

          })
        }
      })
    }

    else {

      if( req.body.hasOwnProperty('DiscordMemberID') ) {
        UserOps.ReadOneUser(req.body.DiscordMemberID).then( ExistingUser => {
          if (ExistingUser) {
            res.status(409).send('Conflict: User exists')
          }
          else {
            UserOps.CreateUser(req.body.DiscordMemberID, 'None')
            res.status(201).send('Created')
          }
        })
      }
      else res.status(400).send('Bad Request: Required fields not met')

    }
  }

  ProtectRoute(RoutePermissions, req, res, RouteOperation)

})

router.put('/id/:DiscordID', (req, res) => {

  const RequiredPermissions = [AppOps.PermissionTypes.CanUpdateUsers]

  let RouteOperation = () => {
    UserOps.ReadOneUser(req.params.DiscordID).then(ThisUser => {
      if (ThisUser) {
        const RequiredFields = ['FlairwarsColor','RedditUsername']
  
        if (RequiredFields.every( item => req.body.hasOwnProperty(item))) {
          ThisUser.RedditName = req.body.RedditUsername
          ThisUser.Color = req.body.FlairwarsColor
          ThisUser.save()
          res.status(202).send('Accepted: User updated')
        }
        else {
          res.status(400).send('Bad Request: Required fields not met')
        }
      }
      else {
        res.status(404).send('Not Found: User not found')
      }
    })
  }
            
  ProtectRoute(RequiredPermissions, req, res, RouteOperation)

})

module.exports = router