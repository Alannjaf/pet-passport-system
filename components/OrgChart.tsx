"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Member {
  id: number;
  nameEn: string;
  nameKu: string;
  titleEn: string;
  titleKu: string;
  photoBase64: string | null;
  parentId: number | null;
  displayOrder: number;
}

interface TreeNode extends Member {
  children: TreeNode[];
}

function buildTree(members: Member[]): TreeNode[] {
  const memberMap = new Map<number, TreeNode>();
  const roots: TreeNode[] = [];

  // Initialize all members with empty children arrays
  members.forEach((member) => {
    memberMap.set(member.id, { ...member, children: [] });
  });

  // Build the tree structure
  members.forEach((member) => {
    const node = memberMap.get(member.id)!;
    if (member.parentId === null) {
      roots.push(node);
    } else {
      const parent = memberMap.get(member.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // If parent not found, treat as root
        roots.push(node);
      }
    }
  });

  // Sort children by displayOrder
  const sortChildren = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.displayOrder - b.displayOrder);
    nodes.forEach((node) => sortChildren(node.children));
  };
  sortChildren(roots);

  return roots;
}

function getNodeLevel(node: TreeNode, members: Member[]): number {
  let level = 0;
  let currentParentId = node.parentId;
  while (currentParentId !== null) {
    level++;
    const parent = members.find((m) => m.id === currentParentId);
    currentParentId = parent?.parentId ?? null;
  }
  return level;
}

function MemberCard({
  member,
  isExpanded,
  hasChildren,
  onToggle,
}: {
  member: TreeNode;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md border-2 border-emerald-200 p-4 min-w-[200px] max-w-[280px] ${
        hasChildren ? "cursor-pointer hover:border-emerald-400 transition-colors" : ""
      }`}
      onClick={hasChildren ? onToggle : undefined}
    >
      <div className="flex flex-col items-center text-center">
        {/* Avatar/Photo */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3 overflow-hidden border-2 border-emerald-300">
          {member.photoBase64 ? (
            <Image
              src={member.photoBase64}
              alt={member.nameEn}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="w-10 h-10 text-emerald-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>

        {/* Name - English */}
        <h4 className="font-bold text-gray-900 text-sm">{member.nameEn}</h4>
        
        {/* Name - Kurdish */}
        <p className="text-gray-600 text-sm font-medium" dir="rtl">
          {member.nameKu}
        </p>

        {/* Title - English */}
        <p className="text-emerald-700 text-xs mt-2">{member.titleEn}</p>
        
        {/* Title - Kurdish */}
        <p className="text-emerald-600 text-xs" dir="rtl">
          {member.titleKu}
        </p>

        {/* Expand/Collapse indicator */}
        {hasChildren && (
          <div className="mt-2 text-emerald-500">
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

function OrgNode({
  node,
  level,
  expandedNodes,
  toggleNode,
  defaultExpandLevel,
}: {
  node: TreeNode;
  level: number;
  expandedNodes: Set<number>;
  toggleNode: (id: number) => void;
  defaultExpandLevel: number;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);

  return (
    <div className="flex flex-col items-center">
      {/* The member card */}
      <MemberCard
        member={node}
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        onToggle={() => toggleNode(node.id)}
      />

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-4">
          {/* Vertical line from parent */}
          <div className="flex justify-center">
            <div className="w-0.5 h-6 bg-emerald-300" />
          </div>

          {/* Horizontal line connecting children */}
          {node.children.length > 1 && (
            <div className="flex justify-center">
              <div
                className="h-0.5 bg-emerald-300"
                style={{
                  width: `${Math.min(node.children.length * 220, 900)}px`,
                }}
              />
            </div>
          )}

          {/* Children nodes */}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical line to child */}
                <div className="w-0.5 h-4 bg-emerald-300" />
                <OrgNode
                  node={child}
                  level={level + 1}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                  defaultExpandLevel={defaultExpandLevel}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrgChart() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const defaultExpandLevel = 1; // Only expand root level by default (shows first 2 levels)

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch("/api/syndicate-members");
        if (response.ok) {
          const data = await response.json();
          setMembers(data);

          // Set initial expanded state for first 2 levels
          const initialExpanded = new Set<number>();
          const tree = buildTree(data);
          
          const expandLevel = (nodes: TreeNode[], currentLevel: number) => {
            if (currentLevel >= defaultExpandLevel) return;
            nodes.forEach((node) => {
              if (node.children.length > 0) {
                initialExpanded.add(node.id);
                expandLevel(node.children, currentLevel + 1);
              }
            });
          };
          expandLevel(tree, 0);
          setExpandedNodes(initialExpanded);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

  const toggleNode = (id: number) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const tree = buildTree(members);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>No organizational structure available yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-8">
      <div className="min-w-max flex flex-col items-center py-8 px-4">
        {tree.map((root) => (
          <OrgNode
            key={root.id}
            node={root}
            level={0}
            expandedNodes={expandedNodes}
            toggleNode={toggleNode}
            defaultExpandLevel={defaultExpandLevel}
          />
        ))}
      </div>
    </div>
  );
}

