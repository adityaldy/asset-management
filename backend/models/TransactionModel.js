import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Transactions = db.define('transactions', {
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
    asset_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'assets',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Nullable untuk transaksi repair/dispose yang tidak melibatkan employee
        references: {
            model: 'users',
            key: 'id'
        }
    },
    admin_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    action_type: {
        type: DataTypes.ENUM('checkout', 'checkin', 'repair', 'complete_repair', 'dispose', 'lost', 'found'),
        allowNull: false
    },
    transaction_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    condition_status: {
        type: DataTypes.STRING(50),
        allowNull: true // Good, Damaged, Lost, dll
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // Transactions are immutable, no update
    indexes: [
        {
            unique: true,
            fields: ['uuid']
        },
        {
            fields: ['asset_id']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['admin_id']
        },
        {
            fields: ['action_type']
        },
        {
            fields: ['transaction_date']
        }
    ]
});

export default Transactions;
