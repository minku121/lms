"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var promise_1 = require("mysql2/promise");
var dotenv = require("dotenv");
var fs_1 = require("fs");
var path_1 = require("path");
dotenv.config();
function setup() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, sqlFile, sql, queries, _i, queries_1, query, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Connecting to remote MySQL server...');
                    return [4 /*yield*/, promise_1.default.createConnection({
                            host: process.env.MYSQL_HOST,
                            user: process.env.MYSQL_USER,
                            password: process.env.MYSQL_PASSWORD,
                            database: process.env.MYSQL_DATABASE,
                            port: parseInt(process.env.MYSQL_PORT || '3306'),
                            ssl: {
                                rejectUnauthorized: false
                            }
                        })];
                case 1:
                    connection = _a.sent();
                    console.log('Connected.');
                    // Disable foreign key checks for setup
                    return [4 /*yield*/, connection.query('SET FOREIGN_KEY_CHECKS = 0')];
                case 2:
                    // Disable foreign key checks for setup
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 8, 9, 12]);
                    sqlFile = path_1.default.join(process.cwd(), 'schema.sql');
                    sql = fs_1.default.readFileSync(sqlFile, 'utf8');
                    queries = sql
                        .split(';')
                        .map(function (q) { return q.trim(); })
                        .filter(function (q) { return q.length > 0; });
                    _i = 0, queries_1 = queries;
                    _a.label = 4;
                case 4:
                    if (!(_i < queries_1.length)) return [3 /*break*/, 7];
                    query = queries_1[_i];
                    console.log("Executing: ".concat(query.substring(0, 50), "..."));
                    return [4 /*yield*/, connection.query(query)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    console.log('Database and tables initialized successfully!');
                    return [3 /*break*/, 12];
                case 8:
                    error_1 = _a.sent();
                    console.error('Error during setup:', error_1);
                    return [3 /*break*/, 12];
                case 9: 
                // Re-enable foreign key checks
                return [4 /*yield*/, connection.query('SET FOREIGN_KEY_CHECKS = 1')];
                case 10:
                    // Re-enable foreign key checks
                    _a.sent();
                    return [4 /*yield*/, connection.end()];
                case 11:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
setup();
