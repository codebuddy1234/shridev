import { AdminPageHeading } from "@/components/admin/page-heading";
import { TeamManager } from "@/components/admin/team-manager";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ErrorState } from "@/components/ui/states";
import { getAdminTeam } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import type { TeamMember } from "@/types/api";

export const metadata = { title: "Team" };

export default async function AdminTeamPage() {
  const { token } = await requireAdmin("/admin/team");

  let members: TeamMember[] = [];
  let failed = false;

  try {
    members = await getAdminTeam(token);
  } catch (error) {
    console.error("[admin-team] load failed:", error);
    failed = true;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <AdminPageHeading
        title="Team"
        description="People shown on the public team page. Anyone marked visible appears there immediately."
      />

      {failed ? (
        <ErrorState
          title="Could not load team members"
          description="The API did not respond. Check that the backend is running, then reload."
          onRetry={
            <ButtonLink href="/admin/team" size="sm" variant="secondary">
              <Icon name="RefreshCw" size={15} />
              Reload
            </ButtonLink>
          }
        />
      ) : (
        <TeamManager members={members} />
      )}
    </div>
  );
}
