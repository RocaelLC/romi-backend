"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./users/user.entity");
const doctor_profile_entity_1 = require("./users/doctor-profile.entity");
const patient_profile_entity_1 = require("./users/patient-profile-entity");
const audit_log_entity_1 = require("./audit/audit-log.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => ({
                    type: 'postgres',
                    host: process.env.DB_HOST || 'localhost',
                    port: Number(process.env.DB_PORT || 5432),
                    username: process.env.DB_USER || 'romi',
                    password: process.env.DB_PASS || 'romi_password',
                    database: process.env.DB_NAME || 'romi_db',
                    entities: [user_entity_1.User, doctor_profile_entity_1.DoctorProfile, patient_profile_entity_1.PatientProfile, audit_log_entity_1.AuditLog],
                    synchronize: true, // en prod usa migraciones
                }),
            }),
        ],
    })
], AppModule);
