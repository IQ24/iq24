import { SupportForm } from "@/components/support-form";
import { getUser } from "@iq24/supabase/cached-queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | iq24",
};

export default async function Support() {
  const { data: userData } = await getUser();

  return (
    <div className="space-y-12">
      <div className="max-w-[450px]">
        <SupportForm
          email={userData.email}
          avatarUrl={userData.avatar_url}
          fullName={userData.full_name}
          teamName={userData.team.name}
        />
      </div>
    </div>
  );
}
