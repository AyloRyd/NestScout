import pool from "../db.js";

class BaseModel {
    static table = '';
    static db = pool;

    static async create(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');

        const sql = `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${placeholders})`;

        const [result] = await this.db.query(sql, values);
        const insertedId = result.insertId;
        return { id: insertedId, ...data };
    }

    static async read(where = {}, limit = null, orderBy = null) {
        let sql = `SELECT * FROM ${this.table}`;
        const values = [];

        if (Object.keys(where).length > 0) {
            const whereClauses = Object.keys(where)
                .map((key) => `${key} = ?`)
                .join(' AND ');
            sql += ` WHERE ${whereClauses}`;
            values.push(...Object.values(where));
        }

        if (orderBy) {
            sql += ` ORDER BY ${orderBy}`;
        }

        if (limit) {
            sql += ` LIMIT ?`;
            values.push(limit);
        }

        const [rows] = await this.db.query(sql, values);
        return rows;
    }

    static async update(data, where) {
        const setClauses = Object.keys(data).map((key) => `${key} = ?`).join(', ');
        const whereClauses = Object.keys(where).map((key) => `${key} = ?`).join(' AND ');

        const sql = `UPDATE ${this.table} SET ${setClauses} WHERE ${whereClauses}`;
        const values = [...Object.values(data), ...Object.values(where)];
        const [result] = await this.db.query(sql, values);
        return result;
    }

    static async delete(where) {
        const whereClauses = Object.keys(where).map((key) => `${key} = ?`).join(' AND ');

        const sql = `DELETE FROM ${this.table} WHERE ${whereClauses}`;
        const values = Object.values(where);
        const [result] = await this.db.query(sql, values);
        return result;
    }
}

export default BaseModel;