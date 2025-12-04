import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Assets = db.define('assets', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 150]
        }
    },
    asset_tag: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    serial_number: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    location_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'locations',
            key: 'id'
        }
    },
    current_holder_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('available', 'assigned', 'repair', 'retired', 'missing'),
        defaultValue: 'available',
        allowNull: false
    },
    purchase_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        allowNull: false
    },
    specifications: {
        type: DataTypes.JSON,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'assets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['uuid']
        },
        {
            unique: true,
            fields: ['asset_tag']
        },
        {
            unique: true,
            fields: ['serial_number']
        },
        {
            fields: ['name']
        },
        {
            fields: ['status']
        },
        {
            fields: ['category_id']
        },
        {
            fields: ['location_id']
        },
        {
            fields: ['current_holder_id']
        }
    ]
});

export default Assets;
