import React from 'react';

// Renders `children` while reserving space for the widest of `reserve`,
// so swapping labels (COPY → ✓ COPIED) never resizes the parent.
export function StableText({
  children,
  reserve,
}: {
  children: React.ReactNode;
  reserve: string[];
}) {
  return (
    <span className="inline-grid justify-items-center">
      {reserve.map((text) => (
        <span key={text} aria-hidden className="invisible col-start-1 row-start-1">
          {text}
        </span>
      ))}
      <span className="col-start-1 row-start-1">{children}</span>
    </span>
  );
}
