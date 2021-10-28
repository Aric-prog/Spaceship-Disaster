function authenticated(req, res, next){
    // Checks if user is signed in or not
    // Other checks probably happen here as well, premium account, skinpacks, etc.
    
    console.log(req.session.clientId) 
    next();
}
module.exports = authenticated;