const AuthGate = require('./auth_gate')

module.exports = (RequiredPerms, req, res, Operation) => {
    // This function will perform the requisite checking of permissions before continuing with the Operation,
    // which should be the protected function to perform

    const Secret = AuthGate.AuthCheck(req.headers)

    if (Secret) {
        AuthGate.PullAppInfo(Secret, AppInfo => {
            if (AppInfo) {
                AuthGate.AuthGate(RequiredPerms, AppInfo.Permissions, IsAllowed => {
                    if (IsAllowed) {
                        Operation()
                    }
                    else {
                        res.status(401).send(`Unauthorized: App ${AppInfo.AppName} is not authorized for this operation.`)
                    }
                })
            }
            else {
                res.status(403).send('Forbidden: This app has not been registered')
            }
        })
    }
    else {
        res.status(400).send('Bad Request: Required headers not present')
    }
}