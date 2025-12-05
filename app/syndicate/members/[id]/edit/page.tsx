import { db } from "@/lib/db";
import { syndicateMembers } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import MemberForm from "@/components/syndicate/MemberForm";

interface EditMemberPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { id } = await params;
  const memberId = parseInt(id);

  if (isNaN(memberId)) {
    notFound();
  }

  const [member] = await db
    .select()
    .from(syndicateMembers)
    .where(eq(syndicateMembers.id, memberId));

  if (!member) {
    notFound();
  }

  const allMembers = await db
    .select()
    .from(syndicateMembers)
    .orderBy(asc(syndicateMembers.displayOrder));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Member</h1>
        <p className="text-gray-600 mt-2">
          Update {member.nameEn}&apos;s information
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <MemberForm member={member} allMembers={allMembers} isEdit />
      </div>
    </div>
  );
}

