declare module "next-mdx-remote/rsc" {
  import type { ReactNode } from "react";

  interface MDXRemoteRSCProps {
    source: string;
    options?: any;
    components?: any;
  }

  export function MDXRemote(props: MDXRemoteRSCProps): ReactNode;
}
