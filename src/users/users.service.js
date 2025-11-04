"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const doctor_profile_entity_1 = require("./doctor-profile.entity");
const patient_profile_entity_1 = require("./patient-profile-entity");
const audit_service_1 = require("../audit/audit.service");
const upsert_user_dto_1 = require("./dto/upsert-user.dto");
let UsersService = class UsersService {
    constructor(users, docs, pats, audit) {
        this.users = users;
        this.docs = docs;
        this.pats = pats;
        this.audit = audit;
    }
    async upsertFromB2C(claims, dto, ip) {
        const externalId = claims.sub;
        const email = claims.email || claims.emails?.[0] || null;
        const displayName = claims.name || null;
        let user = await this.users.findOne({ where: { external_id: externalId } });
        if (!user) {
            // Crear nuevo
            user = this.users.create({
                external_id: externalId,
                email: email ?? undefined,
                display_name: displayName ?? undefined,
                role: dto.role, // patient | doctor
                consent_version: dto.consentVersion,
            });
            user = await this.users.save(user);
            if (dto.role === upsert_user_dto_1.UpsertRole.doctor) {
                const dp = this.docs.create({
                    user,
                    specialty: dto.doctor?.specialty,
                    license_number: dto.doctor?.licenseNumber,
                    bio: dto.doctor?.bio,
                });
                await this.docs.save(dp);
            }
            else {
                const pp = this.pats.create({
                    user,
                    demographics: dto.patient?.demographics,
                    emergency_contact: dto.patient?.emergency_contact,
                    risk_flags: dto.patient?.risk_flags,
                });
                await this.pats.save(pp);
            }
            await this.audit.log('USER_CREATE', user.id, 'app_user', user.id, { role: dto.role }, ip);
        }
        else {
            // Actualizar datos no sensibles
            user.display_name = user.display_name ?? displayName ?? null;
            user.email = user.email ?? (email ?? null);
            user.consent_version = dto.consentVersion ?? user.consent_version ?? null;
            await this.users.save(user);
            // Upsert de perfil por rol si faltara
            if (user.role === 'doctor') {
                let dp = await this.docs.findOne({ where: { user: { id: user.id } } });
                if (!dp)
                    dp = this.docs.create({ user });
                dp.specialty = dto.doctor?.specialty ?? dp.specialty;
                dp.license_number = dto.doctor?.licenseNumber ?? dp.license_number;
                dp.bio = dto.doctor?.bio ?? dp.bio;
                await this.docs.save(dp);
            }
            else if (user.role === 'patient') {
                let pp = await this.pats.findOne({ where: { user: { id: user.id } } });
                if (!pp)
                    pp = this.pats.create({ user });
                pp.demographics = dto.patient?.demographics ?? pp.demographics;
                pp.emergency_contact = dto.patient?.emergency_contact ?? pp.emergency_contact;
                pp.risk_flags = dto.patient?.risk_flags ?? pp.risk_flags;
                await this.pats.save(pp);
            }
            await this.audit.log('USER_UPDATE', user.id, 'app_user', user.id, { role: user.role }, ip);
        }
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(doctor_profile_entity_1.DoctorProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(patient_profile_entity_1.PatientProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], UsersService);
