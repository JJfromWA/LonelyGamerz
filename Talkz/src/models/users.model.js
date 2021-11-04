// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize')
const DataTypes = Sequelize.DataTypes

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient')
  const users = sequelizeClient.define('users', {

    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },

    googleId: { type: DataTypes.STRING },

    githubId: { type: DataTypes.STRING }

  }, {
    hooks: {
      beforeCount (options) {
        options.raw = true
      }
    }
  })

  users.associate = function (models) {

    const { posts, profile } = models;
    users.hasMany(posts); // Add userId to posts model
    users.hasOne(profile);
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  }

  // eslint-disable-next-line no-unused-vars
  

  return users
}
