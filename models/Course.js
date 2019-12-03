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
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Please provide a value for "user ID"',
            },
            notEmpty: {
                msg: 'Please provide a value for "user ID"',
            }
        },
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Please provide a value for "title"',
            },
            notEmpty: {
                msg: 'Please provide a value for "title"',
            }
        },
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Please provide a value for "description"',
            },
            notEmpty: {
                msg: 'Please provide a value for "description"',
            }
        },
    },
    estimatedTime: {
        type: Sequelize.STRING, // Nullable
        allowNull: true
    },
    materialsNeeded: {
        type: Sequelize.STRING, // Nullable
        allowNull: true
    },
    }, { sequelize });


    Course.associate = (models) => {
        Course.belongsTo(models.User);
    };


    return Course;
}