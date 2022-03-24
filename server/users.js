const users = [];

const addUser = ({ id, name, room }) => {//add new user
  name = name.trim().toLowerCase();//trim-remove white space
  room = room.trim().toLowerCase();//toLowerCase-convert upperCase to lower Case.
  const existingUser = users.find((user) => user.room === room && user.name === name);//find if new user and existing user has same name.
  if(!name || !room) {
    return { error: 'Username and room are required.' };
  }
  if(existingUser) {
    return { error: 'Username is taken.' };
  }

  const user = { id, name, room };

  users.push(user);//push new user to array

  return { user };
}

const removeUser = (id) => {//remove user
  const index = users.findIndex((user) => user.id === id);

  if(index !== -1) return users.splice(index, 1)[0];
}

const getUser = (id) => users.find((user) => user.id === id);//get users

const getUsersInRoom = (room) => users.filter((user) => user.room === room);//get users in specific room

module.exports = { addUser, removeUser, getUser, getUsersInRoom };