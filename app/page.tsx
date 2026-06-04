"use client";

import Link from "next/link";

const examples = [
  'chinese_tree',
  'compbuild-from-abfielder',
  "Indian Temple-from-abfielder",
  "Ivys_Starter_House-from-abfielder",
  'Mediavel Castle'
]

export default function Home() {

  return (
    <div className="h-screen w-screen flex flex-row gap-2">
      {examples.map(example =>
        <Link href={`/region/${example}`} key={example}>
          <span className="p-1 bg-red-300 m-1">{example}</span>
        </Link>
      )}
    </div>
  );
}