module.exports = function(user, userRequesting) {
    let unauthorized = user._id == userRequesting || !user.private ? false : user.private && !user.followers.some(foll => foll.user_id == userRequesting) && true
    return { unauthorized }
}