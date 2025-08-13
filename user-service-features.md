# Complete User Service - Features & Implementation

## Current Status vs Complete Features

### ✅ **What You Have (Done)**

- User Registration
- User Login
- Get Current User Information

### 🎯 **What's Missing (To Complete)**

## 1. User Profile Management

### **Features:**

- Update user profile (name, avatar, etc.)
- Change password
- Upload/update avatar
- Account settings

### **Message Patterns (User Service):**

```typescript
// users/users.controller.ts
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern("get_user_profile")
  async getProfile(data: { userId: string }) {
    return this.usersService.getProfile(data.userId);
  }

  @MessagePattern("update_user_profile")
  async updateProfile(data: {
    userId: string;
    updateDto: UpdateUserProfileDto;
  }) {
    return this.usersService.updateProfile(data.userId, data.updateDto);
  }

  @MessagePattern("change_user_password")
  async changePassword(data: {
    userId: string;
    changePasswordDto: ChangePasswordDto;
  }) {
    return this.usersService.changePassword(
      data.userId,
      data.changePasswordDto
    );
  }

  @MessagePattern("upload_user_avatar")
  async uploadAvatar(data: { userId: string; file: Express.Multer.File }) {
    return this.usersService.uploadAvatar(data.userId, data.file);
  }

  @MessagePattern("delete_user_account")
  async deleteAccount(data: { userId: string; password: string }) {
    return this.usersService.deleteAccount(data.userId, data.password);
  }
}
```

### **API Gateway Endpoints (HTTP):**

```typescript
// apps/api-gateway/src/users/users.controller.ts
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("profile")
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile({ userId: user.id });
  }

  @Put("profile")
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateDto: UpdateUserProfileDto
  ) {
    return this.usersService.updateProfile({ userId: user.id, updateDto });
  }

  @Put("password")
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.usersService.changePassword({
      userId: user.id,
      changePasswordDto,
    });
  }

  @Post("avatar")
  @UseInterceptors(FileInterceptor("avatar"))
  async uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.usersService.uploadAvatar({ userId: user.id, file });
  }

  @Delete("account")
  async deleteAccount(
    @CurrentUser() user: JwtPayload,
    @Body() deleteAccountDto: DeleteAccountDto
  ) {
    return this.usersService.deleteAccount({
      userId: user.id,
      password: deleteAccountDto.password,
    });
  }
}
```

## 2. Email Verification System

### **Features:**

- Send verification email on registration
- Verify email with token
- Resend verification email

### **Message Patterns (User Service):**

```typescript
// auth/auth.controller.ts
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern("verify_user_email")
  async verifyEmail(data: { token: string }) {
    return this.authService.verifyEmail(data.token);
  }

  @MessagePattern("resend_verification_email")
  async resendVerification(data: { userId: string }) {
    return this.authService.resendVerificationEmail(data.userId);
  }
}
```

### **API Gateway Endpoints (HTTP):**

```typescript
// apps/api-gateway/src/auth/auth.controller.ts
@Post('verify-email')
async verifyEmail(@Body() verifyDto: VerifyEmailDto) {
  return this.authService.verifyEmail({ token: verifyDto.token });
}

@Post('resend-verification')
@UseGuards(JwtAuthGuard)
async resendVerification(@CurrentUser() user: JwtPayload) {
  return this.authService.resendVerificationEmail({ userId: user.id });
}
```

## 3. Password Reset System

### **Features:**

- Request password reset via email
- Reset password with token
- Validate reset tokens

### **Message Patterns (User Service):**

```typescript
// users/auth.controller.ts
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern("request_password_reset")
  async requestPasswordReset(data: { email: string }) {
    return this.authService.requestPasswordReset(data.email);
  }

  @MessagePattern("reset_user_password")
  async resetPassword(data: { token: string; newPassword: string }) {
    return this.authService.resetPassword(data);
  }

  @MessagePattern("validate_reset_token")
  async validateResetToken(data: { token: string }) {
    return this.authService.validateResetToken(data.token);
  }
}
```

### **API Gateway Endpoints (HTTP):**

```typescript
// apps/api-gateway/src/auth/auth.controller.ts
@Post('forgot-password')
async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
  return this.authService.requestPasswordReset({ email: forgotPasswordDto.email });
}

@Post('reset-password')
async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
  return this.authService.resetPassword({
    token: resetPasswordDto.token,
    newPassword: resetPasswordDto.newPassword
  });
}

@Post('validate-reset-token')
async validateResetToken(@Body() validateDto: ValidateResetTokenDto) {
  return this.authService.validateResetToken({ token: validateDto.token });
}
```

## 4. Team Management

### **Features:**

- Create teams/workspaces
- Invite users to teams
- Manage team members
- Team roles and permissions
- Team settings

### **Message Patterns (User Service):**

```typescript
// users/teams.controller.ts
@Controller()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @MessagePattern("create_team")
  async createTeam(data: { userId: string; createTeamDto: CreateTeamDto }) {
    return this.teamsService.create(data.userId, data.createTeamDto);
  }

  @MessagePattern("get_user_teams")
  async getUserTeams(data: { userId: string }) {
    return this.teamsService.getUserTeams(data.userId);
  }

  @MessagePattern("get_team_details")
  async getTeam(data: { teamId: string; userId: string }) {
    return this.teamsService.getTeamDetails(data.teamId, data.userId);
  }

  @MessagePattern("update_team")
  async updateTeam(data: {
    teamId: string;
    userId: string;
    updateDto: UpdateTeamDto;
  }) {
    return this.teamsService.updateTeam(
      data.teamId,
      data.userId,
      data.updateDto
    );
  }

  @MessagePattern("delete_team")
  async deleteTeam(data: { teamId: string; userId: string }) {
    return this.teamsService.deleteTeam(data.teamId, data.userId);
  }

  @MessagePattern("get_team_members")
  async getTeamMembers(data: { teamId: string; userId: string }) {
    return this.teamsService.getTeamMembers(data.teamId, data.userId);
  }

  @MessagePattern("invite_user_to_team")
  async inviteUser(data: {
    teamId: string;
    userId: string;
    inviteDto: InviteUserDto;
  }) {
    return this.teamsService.inviteUser(
      data.teamId,
      data.userId,
      data.inviteDto
    );
  }

  @MessagePattern("update_team_member_role")
  async updateMemberRole(data: {
    teamId: string;
    userId: string;
    memberId: string;
    roleId: string;
  }) {
    return this.teamsService.updateMemberRole(
      data.teamId,
      data.userId,
      data.memberId,
      data.roleId
    );
  }

  @MessagePattern("remove_team_member")
  async removeMember(data: {
    teamId: string;
    userId: string;
    memberId: string;
  }) {
    return this.teamsService.removeMember(
      data.teamId,
      data.userId,
      data.memberId
    );
  }
}
```

### **API Gateway Endpoints (HTTP):**

```typescript
// apps/api-gateway/src/teams/teams.controller.ts
@Controller("teams")
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  async createTeam(
    @CurrentUser() user: JwtPayload,
    @Body() createTeamDto: CreateTeamDto
  ) {
    return this.teamsService.createTeam({ userId: user.id, createTeamDto });
  }

  @Get()
  async getUserTeams(@CurrentUser() user: JwtPayload) {
    return this.teamsService.getUserTeams({ userId: user.id });
  }

  @Get(":id")
  async getTeam(@Param("id") teamId: string, @CurrentUser() user: JwtPayload) {
    return this.teamsService.getTeamDetails({ teamId, userId: user.id });
  }

  @Put(":id")
  async updateTeam(
    @Param("id") teamId: string,
    @CurrentUser() user: JwtPayload,
    @Body() updateDto: UpdateTeamDto
  ) {
    return this.teamsService.updateTeam({ teamId, userId: user.id, updateDto });
  }

  @Delete(":id")
  async deleteTeam(
    @Param("id") teamId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.teamsService.deleteTeam({ teamId, userId: user.id });
  }

  @Get(":id/members")
  async getTeamMembers(
    @Param("id") teamId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.teamsService.getTeamMembers({ teamId, userId: user.id });
  }

  @Post(":id/invite")
  async inviteUser(
    @Param("id") teamId: string,
    @CurrentUser() user: JwtPayload,
    @Body() inviteDto: InviteUserDto
  ) {
    return this.teamsService.inviteUser({ teamId, userId: user.id, inviteDto });
  }

  @Put(":id/members/:memberId")
  async updateMemberRole(
    @Param("id") teamId: string,
    @Param("memberId") memberId: string,
    @CurrentUser() user: JwtPayload,
    @Body() updateRoleDto: UpdateMemberRoleDto
  ) {
    return this.teamsService.updateMemberRole({
      teamId,
      userId: user.id,
      memberId,
      roleId: updateRoleDto.roleId,
    });
  }

  @Delete(":id/members/:memberId")
  async removeMember(
    @Param("id") teamId: string,
    @Param("memberId") memberId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.teamsService.removeMember({
      teamId,
      userId: user.id,
      memberId,
    });
  }
}
```

## 5. User Preferences System

### **Features:**

- Theme settings (light/dark)
- Language preferences
- Notification settings
- Dashboard preferences
- Timezone settings

### **Message Patterns (User Service):**

```typescript
// users/preferences.controller.ts
@Controller()
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @MessagePattern("get_user_preferences")
  async getPreferences(data: { userId: string }) {
    return this.preferencesService.getPreferences(data.userId);
  }

  @MessagePattern("update_user_preferences")
  async updatePreferences(data: {
    userId: string;
    updateDto: UpdatePreferencesDto;
  }) {
    return this.preferencesService.updatePreferences(
      data.userId,
      data.updateDto
    );
  }
}
```

### **API Gateway Endpoints (HTTP):**

```typescript
// apps/api-gateway/src/users/preferences.controller.ts
@Controller("users/preferences")
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  async getPreferences(@CurrentUser() user: JwtPayload) {
    return this.preferencesService.getPreferences({ userId: user.id });
  }

  @Put()
  async updatePreferences(
    @CurrentUser() user: JwtPayload,
    @Body() updateDto: UpdatePreferencesDto
  ) {
    return this.preferencesService.updatePreferences({
      userId: user.id,
      updateDto,
    });
  }
}
```

## 6. Session Management

### **Features:**

- Active session tracking
- Device management
- Session invalidation
- Security monitoring

### **Message Patterns (User Service):**

```typescript
// users/sessions.controller.ts
@Controller()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @MessagePattern("get_user_sessions")
  async getUserSessions(data: { userId: string }) {
    return this.sessionsService.getUserSessions(data.userId);
  }

  @MessagePattern("revoke_user_session")
  async revokeSession(data: { userId: string; sessionId: string }) {
    return this.sessionsService.revokeSession(data.userId, data.sessionId);
  }

  @MessagePattern("revoke_all_user_sessions")
  async revokeAllSessions(data: { userId: string; currentSessionId: string }) {
    return this.sessionsService.revokeAllSessions(
      data.userId,
      data.currentSessionId
    );
  }

  @MessagePattern("create_user_session")
  async createSession(data: {
    userId: string;
    deviceInfo: any;
    ipAddress: string;
  }) {
    return this.sessionsService.createSession(
      data.userId,
      data.deviceInfo,
      data.ipAddress
    );
  }
}
```

### **API Gateway Endpoints (HTTP):**

```typescript
// apps/api-gateway/src/users/sessions.controller.ts
@Controller("users/sessions")
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async getUserSessions(@CurrentUser() user: JwtPayload) {
    return this.sessionsService.getUserSessions({ userId: user.id });
  }

  @Delete(":sessionId")
  async revokeSession(
    @Param("sessionId") sessionId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.sessionsService.revokeSession({ userId: user.id, sessionId });
  }

  @Delete()
  async revokeAllSessions(@CurrentUser() user: JwtPayload, @Req() req: any) {
    return this.sessionsService.revokeAllSessions({
      userId: user.id,
      currentSessionId: req.sessionId,
    });
  }
}
```

## 7. Role-Based Access Control (RBAC)

### **Features:**

- System roles (super_admin, admin, user)
- Team roles (owner, admin, member, viewer)
- Permission checking
- Role management

### **Message Patterns for Other Services:**

```typescript
// users/permissions.controller.ts
@Controller()
export class PermissionsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly permissionService: PermissionService
  ) {}

  @MessagePattern("get_user_permissions")
  async getUserPermissions(data: { userId: string; teamId?: string }) {
    return this.permissionService.getUserPermissions(data.userId, data.teamId);
  }

  @MessagePattern("check_user_permission")
  async checkPermission(data: {
    userId: string;
    permission: string;
    teamId?: string;
  }) {
    return this.permissionService.hasPermission(
      data.userId,
      data.permission,
      data.teamId
    );
  }

  @MessagePattern("get_user_basic_info")
  async getUserBasicInfo(data: { userId: string }) {
    const user = await this.usersService.findById(data.userId);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
    };
  }

  @MessagePattern("get_users_basic_info")
  async getUsersBasicInfo(data: { userIds: string[] }) {
    const users = await this.usersService.findByIds(data.userIds);
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
    }));
  }

  @MessagePattern("validate_user_access")
  async validateUserAccess(data: {
    userId: string;
    resourceId: string;
    resourceType: string;
  }) {
    return this.permissionService.validateAccess(
      data.userId,
      data.resourceId,
      data.resourceType
    );
  }
}
```

## Complete Database Tables

### **Tables You Need:**

1. ✅ **users** - Basic user information
2. ✅ **teams** - Team/workspace information
3. ✅ **roles** - System and team roles
4. ✅ **team_memberships** - User-team relationships
5. ✅ **user_sessions** - Session tracking
6. ✅ **user_preferences** - User settings
7. ✅ **password_reset_tokens** - Password reset functionality
8. ✅ **email_verification_tokens** - Email verification
9. 🆕 **team_invitations** - Team invitation system
10. 🆕 **user_activities** - User activity logging

### **New Tables Needed:**

```typescript
// Team Invitations
export const teamInvitations = pgTable(
  "team_invitations",
  {
    id: uuid("id").primaryKey().default(generateId()),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),
    invitedBy: uuid("invited_by")
      .notNull()
      .references(() => users.id),
    token: varchar("token", { length: 255 }).notNull().unique(),
    status: varchar("status", { length: 20 }).default("pending"), // pending, accepted, expired
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    emailTeamIdx: index("idx_team_invitations_email_team").on(
      table.email,
      table.teamId
    ),
    tokenIdx: index("idx_team_invitations_token").on(table.token),
  })
);

// User Activity Log
export const userActivities = pgTable(
  "user_activities",
  {
    id: uuid("id").primaryKey().default(generateId()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 100 }).notNull(),
    resource: varchar("resource", { length: 100 }).notNull(),
    resourceId: uuid("resource_id"),
    metadata: jsonb("metadata"),
    ipAddress: inet("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("idx_user_activities_user").on(table.userId),
    actionIdx: index("idx_user_activities_action").on(table.action),
    createdAtIdx: index("idx_user_activities_created_at").on(table.createdAt),
  })
);
```

## DTOs (Data Transfer Objects)

### **Request DTOs:**

```typescript
// Update Profile DTO
export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

// Change Password DTO
export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain uppercase, lowercase, and number",
  })
  newPassword: string;
}

// Delete Account DTO
export class DeleteAccountDto {
  @IsString()
  password: string;
}

// Create Team DTO
export class CreateTeamDto {
  @IsString()
  @Length(2, 50)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens",
  })
  slug: string;
}

// Invite User DTO
export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsUUID()
  roleId: string;

  @IsOptional()
  @IsString()
  message?: string;
}

// Update Member Role DTO
export class UpdateMemberRoleDto {
  @IsUUID()
  roleId: string;
}

// User Preferences DTO
export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  theme?: "light" | "dark";

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsObject()
  notifications?: {
    email?: boolean;
    push?: boolean;
    desktop?: boolean;
  };

  @IsOptional()
  @IsString()
  timezone?: string;
}
```

## Service Implementation Priority

### **Phase 1: Core User Features (Next)**

1. User profile management
2. Password reset system
3. Email verification

### **Phase 2: Team Management**

1. Team CRUD operations
2. Team invitations
3. Member management

### **Phase 3: Advanced Features**

1. Session management
2. Activity logging
3. Advanced permissions

## Guards and Decorators

```typescript
// Custom decorators for API Gateway
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Permission guard for API Gateway
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );

    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const hasPermission = await this.usersService.checkPermission({
      userId: user.id,
      permission: requiredPermission,
      teamId: request.params.teamId || request.body.teamId
    });

    return hasPermission;
  }
}

// Usage in API Gateway
@Put('teams/:id')
@RequirePermission('team:write')
@UseGuards(JwtAuthGuard, PermissionGuard)
async updateTeam(@Param('id') id: string, @Body() updateDto: UpdateTeamDto) {
  // Implementation
}
```

## Microservices Communication Pattern

### **User Service (TCP Transport):**

- Uses `@MessagePattern()` decorators
- Handles business logic
- Communicates with database
- Returns data to API Gateway

### **API Gateway (HTTP Transport):**

- Uses `@Get()`, `@Post()`, `@Put()`, `@Delete()` decorators
- Handles HTTP requests/responses
- Uses `@UseGuards()` for authentication/authorization
- Calls User Service via TCP client proxy
- Transforms responses for HTTP clients

### **Service Communication Flow:**

```
HTTP Client → API Gateway → User Service (TCP) → Database
HTTP Client ← API Gateway ← User Service (TCP) ← Database
```

This completes your User Service with the correct microservices architecture! Focus on implementing these features incrementally - start with user profile management, then move to password reset, then team management.
