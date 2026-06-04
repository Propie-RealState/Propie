export type GlobalSearchPropertyResult = {
  id: string;
  title: string;
  subtitle: string | null;
  coverImage: string | null;
  operationType: string;
  propertyType: string;
};

export type GlobalSearchLocationResult = {
  id: string;
  label: string;
  subtitle: string | null;
};

export type GlobalSearchAgentResult = {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  rating: number;
  managedProperties: number;
};

export type GlobalSearchOwnerResult = {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
};

export type GlobalSearchResponse = {
  query: string;
  properties: GlobalSearchPropertyResult[];
  locations: GlobalSearchLocationResult[];
  agents: GlobalSearchAgentResult[];
  owners: GlobalSearchOwnerResult[];
};

export type GlobalSearchSelection =
  | {
      kind: "property";
      id: string;
      label: string;
    }
  | {
      kind: "location";
      id: string;
      label: string;
    }
  | {
      kind: "agent";
      id: string;
      label: string;
    }
  | {
      kind: "owner";
      id: string;
      label: string;
    };
