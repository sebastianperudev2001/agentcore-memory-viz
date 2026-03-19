import React from "react";

// Generic passthrough mock for all @cloudscape-design/components/* imports.
// Each component simply renders its children so unit tests can assert on
// rendered output without pulling in the ESM-only Cloudscape packages.
const CloudscapeMock = ({
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { [key: string]: unknown }) => (
  <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
);

export default CloudscapeMock;
