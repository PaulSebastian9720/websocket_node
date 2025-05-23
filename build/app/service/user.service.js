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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const data_source_1 = require("../config/data.source");
const user_1 = require("../entities/user");
class UserService {
    constructor() {
        this.userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
    }
    findOrCreate(userName) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.userRepo.findOne({ where: { userName } });
            if (!user) {
                user = this.userRepo.create({ userName });
                yield this.userRepo.save(user);
            }
            return user;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepo.findOne({ where: { id } });
        });
    }
}
exports.UserService = UserService;
