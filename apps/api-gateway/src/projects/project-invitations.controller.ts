import { Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Project Invitations')
@Controller('invitations')
export class ProjectInvitationsController {
  constructor(
    @Inject('PROJECT_SERVICE') private readonly projectService: ClientProxy,
  ) {}

  @Post(':token/accept')
  acceptInvitation(@Param('token') token: string) {
    return firstValueFrom(
      this.projectService.send('member.acceptInvitation', token),
    );
  }

  @Post(':token/decline')
  declineInvitation(@Param('token') token: string) {
    return firstValueFrom(
      this.projectService.send('member.declineInvitation', token),
    );
  }

  @Get(':token')
  getProjectInvitations(@Param('token') token: string) {
    return firstValueFrom(
      this.projectService.send('member.getInvitationById', token),
    );
  }
}
