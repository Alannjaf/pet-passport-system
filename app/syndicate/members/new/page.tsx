import { db } from "@/lib/db";
import { syndicateMembers } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import MemberForm from "@/components/syndicate/MemberForm";

export default async function NewMemberPage() {
  const allMembers = await db
    .select()
    .from(syndicateMembers)
    .orderBy(asc(syndicateMembers.displayOrder));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Member</h1>
        <p className="text-gray-600 mt-2">
          Add a new member to the organizational structure
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <MemberForm allMembers={allMembers} />
      </div>
    </div>
  );
}

