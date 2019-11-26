'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class Course extends Sequelize.Model {}
    Course.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: Sequelize.STRING, // Id from the users table
        // allowNull: false
    },
    title: {
        type: Sequelize.STRING,
        // allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        // allowNull: false
    },
    estimatedTime: {
        type: Sequelize.STRING, // Nullable
        // allowNull: true
    },
    materialsNeeded: {
        type: Sequelize.STRING, // Nullable
        // allowNull: true
    },
    }, { sequelize });


    Course.associate = (models) => {
        Course.belongsTo(models.User);
    };


    return Course;
}