export type AddressSuggestion = {
  id: string;
  label: string;
  country: string;
  province: string;
  city: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  provider: "nominatim";
};

export type AddressSuggestionsResponse = {
  items: AddressSuggestion[];
};
