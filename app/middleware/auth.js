function authenticated(req, res, next){
    // Checks if user is signed in or not
    console.log(req.session.clientId) 
    next();
}
module.exports = authenticated;