import React from "react";

// Generic passthrough mock for all @cloudscape-design/components/* imports.
// Each component simply renders its children so unit tests can assert on
// rendered output without pulling in the ESM-only Cloudscape packages.
// The `header` and `actions` props are also rendered so header content is
// accessible to queries in unit tests.
const CloudscapeMock = ({
  children,
  header,
  actions,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { header?: React.ReactNode; actions?: React.ReactNode; [key: string]: unknown }) => (
  <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
    {header}
    {actions}
    {children}
  </div>
);

export default CloudscapeMock;
