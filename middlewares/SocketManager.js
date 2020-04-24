
module.exports = function(socket) {

    socket.on('SET_USER_ID', (user_id) => socket.join(`${user_id}`) )
}
