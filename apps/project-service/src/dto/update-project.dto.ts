export class UpdateProjectDto {
  id: string;
  name?: string;
  description?: string | null;
  slug?: string;
  ownerId?: string;
}
