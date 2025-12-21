"use client";

import { useState, useEffect } from "react";

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
      className={`bg-white rounded-xl shadow-md border-2 border-emerald-200 p-3 sm:p-4 min-w-[160px] max-w-[200px] sm:min-w-[200px] sm:max-w-[280px] min-h-[180px] sm:min-h-[200px] ${
        hasChildren
          ? "cursor-pointer hover:border-emerald-400 active:scale-95 active:shadow-sm transition-all duration-200 touch-manipulation"
          : ""
      }`}
      onClick={hasChildren ? onToggle : undefined}
    >
      <div className="flex flex-col items-center text-center">
        {/* Avatar/Photo */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-2 sm:mb-3 overflow-hidden border-2 border-emerald-300">
          {member.photoBase64 ? (
            <img
              src={member.photoBase64}
              alt={member.nameEn}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>

        {/* Name - English */}
        <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{member.nameEn}</h4>
        
        {/* Name - Kurdish */}
        <p className="text-gray-600 text-xs sm:text-sm font-medium" dir="rtl">
          {member.nameKu}
        </p>

        {/* Title - English */}
        <p className="text-emerald-700 text-[10px] sm:text-xs mt-1 sm:mt-2">{member.titleEn}</p>
        
        {/* Title - Kurdish */}
        <p className="text-emerald-600 text-[10px] sm:text-xs" dir="rtl">
          {member.titleKu}
        </p>

        {/* Expand/Collapse indicator */}
        {hasChildren && (
          <div className="mt-1 sm:mt-2 text-emerald-500">
            <svg
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${
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
    <div className="flex flex-col items-center w-full relative pb-4 sm:pb-6">
      {/* The member card */}
      <MemberCard
        member={node}
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        onToggle={() => toggleNode(node.id)}
      />

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-4 sm:mt-6 flex flex-col items-center w-full relative">
          {/* Vertical line from parent down to children */}
          <div className="flex justify-center">
            <div className="w-0.5 h-4 sm:h-6 bg-emerald-300" />
          </div>

          {/* Children container - using flexbox with wrapping for better variable height handling */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 mt-2 sm:mt-4 w-full max-w-7xl px-2 sm:px-4">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center flex-[1_1_100%] sm:flex-[1_1_calc(50%-1.5rem)] lg:flex-[1_1_calc(33.333%-1.5rem)] xl:flex-[1_1_calc(25%-1.5rem)] min-w-[160px] sm:min-w-[200px] max-w-[280px]">
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
    <div className="w-full pb-8">
      <div className="flex flex-col items-center py-4 sm:py-8 px-2 sm:px-4">
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

