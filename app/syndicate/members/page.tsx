import { db } from "@/lib/db";
import { syndicateMembers } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import Link from "next/link";

export default async function MembersPage() {
  const members = await db
    .select()
    .from(syndicateMembers)
    .orderBy(asc(syndicateMembers.displayOrder));

  // Build a map for quick parent lookup
  const memberMap = new Map(members.map((m) => [m.id, m]));

  // Function to get parent name
  const getParentName = (parentId: number | null) => {
    if (!parentId) return "—";
    const parent = memberMap.get(parentId);
    return parent ? parent.nameEn : "Unknown";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Syndicate Members
          </h1>
          <p className="text-gray-600 mt-2">
            Manage the organizational structure
          </p>
        </div>
        <Link
          href="/syndicate/members/new"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
        >
          + Add Member
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No members yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start building your organizational structure by adding the first
            member.
          </p>
          <Link
            href="/syndicate/members/new"
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
          >
            Add First Member
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reports To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                        {member.photoBase64 ? (
                          <img
                            src={member.photoBase64}
                            alt={member.nameEn}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            className="w-6 h-6 text-emerald-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.nameEn}
                        </p>
                        <p className="text-sm text-gray-500" dir="rtl">
                          {member.nameKu}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{member.titleEn}</p>
                    <p className="text-sm text-gray-500" dir="rtl">
                      {member.titleKu}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {getParentName(member.parentId)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {member.displayOrder}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/syndicate/members/${member.id}/edit`}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

