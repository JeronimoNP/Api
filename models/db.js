const Sequelize = require('sequelize');
require('dotenv').config();
const DataBase = process.env.DATABASE;
const User = process.env.USER;
const Password = process.env.PASSWORD;
const Host = process.env.LOCALHOST;


const sequelize = new Sequelize(DataBase, User , Password,{
    host: Host,
    dialect: 'mysql'
});


sequelize.authenticate()
.then(function(){
  console.log("Conexão com o banco de dados concluido!");
}).catch(function(error){
  console.log("Erro na conexão ao banco de dados!!");
  console.error(error);
});

module.exports = sequelize;