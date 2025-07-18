"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserGroup.belongsTo(models.User);
      UserGroup.belongsTo(models.Group);
    }
  }
  UserGroup.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      groupId: { type: DataTypes.INTEGER, allowNull: false },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "UserGroup",
    }
  );
  return UserGroup;
};
